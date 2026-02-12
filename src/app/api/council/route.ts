import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { StateGraph, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { LangChainAdapter } from "ai";

// 1. Tool Definitions (Personas)
// Each persona is a simplified "tool" that the supervisor can call
const personaSchema = z.object({
    personaName: z.enum(["vc", "angel", "customer", "growth", "risk"]),
});

// Since we are simulating a debate, the "tool" logic is just routing.
// The actual generation happens in the node.

// 2. State Definition
interface BoardroomState {
    messages: BaseMessage[];
    next_speaker: string;
    round_count: number;
}

// 3. Define the Supervisor (Chairman) Model
const chairmanModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY || "dummy_key", // Prevent crash on init, will fail on invoke if invalid
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
});

if (!process.env.GROQ_API_KEY) {
    console.warn("WARNING: GROQ_API_KEY is not set. Council API will fail.");
}

// 4. Define Persona Models
// We use a factory function to get the right key if valid, or fallback
function getPersonaModel(personaId: string) {
    const specificKey = process.env[`GROQ_API_KEY_${personaId.toUpperCase()}`];
    const apiKey = specificKey || process.env.GROQ_API_KEY;

    return new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
    });
}

// 5. Node Functions

// supervisorNode: Decides who speaks next
async function supervisorNode(state: BoardroomState) {
    const { messages, round_count } = state;
    const lastMessage = messages[messages.length - 1];

    // If we have reached the round limit, end the discussion
    // Assuming 2 rounds per persona roughly
    if (round_count > 10) {
        return { next_speaker: "FINISH" };
    }

    const systemPrompt = `You are The Chairman of the Board.
You are moderating a debate about a startup idea between 5 personas:
- VC (Gus): Focuses on metrics and scale.
- Angel (Walter): Focuses on vision and founder fit.
- Customer (Jesse): Focuses on user pain and usability.
- Growth (Saul): Focuses on marketing and virality.
- Risk (Mike): Focuses on threats and operations.

Current context:
${messages.map(m => `${m.name || m.getType()}: ${m.content}`).join("\n")}

Your goal is to foster a productive debate.
1. If a persona raised a critical point, ask another relevant persona to respond.
2. Ensure everyone gets a chance to speak.
3. If the discussion is going in circles, steer it to a new topic.
4. If the debate has reached a natural conclusion, output "FINISH".

Who should speak next? Return ONLY one of: "vc", "angel", "customer", "growth", "risk", or "FINISH".`;

    const response = await chairmanModel.invoke([
        new SystemMessage(systemPrompt),
        // We pass the last message as a "trigger" for the chairman to react to
        new HumanMessage("Who speaks next?"),
    ]);

    const rawDecision = response.content.toString().trim().toLowerCase();

    // Clean up potential extra text
    let nextSpeaker = "FINISH";
    if (rawDecision.includes("vc")) nextSpeaker = "vc";
    else if (rawDecision.includes("angel")) nextSpeaker = "angel";
    else if (rawDecision.includes("customer")) nextSpeaker = "customer";
    else if (rawDecision.includes("growth")) nextSpeaker = "growth";
    else if (rawDecision.includes("risk")) nextSpeaker = "risk";
    else if (rawDecision.includes("finish")) nextSpeaker = "FINISH";

    return { next_speaker: nextSpeaker };
}

// personaNode: Generates the persona's response
async function personaNode(state: BoardroomState, personaId: string, systemPrompt: string) {
    const { messages } = state;
    const model = getPersonaModel(personaId);

    // Filter recent messages for context (last 10 to avoid token limits if history grows)
    const recentContext = messages.slice(-10);

    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        ...recentContext
    ]);

    // Tag the message with the persona name
    const taggedMessage = new AIMessage({
        content: response.content,
        name: personaId
    });

    return {
        messages: [taggedMessage],
        round_count: state.round_count + 1
    };
}

// Specific wrappers for each persona
const vcNode = (state: BoardroomState) => personaNode(state, "vc",
    "You are Gus Fring (VC). Be professional, calculated, and skeptical. Focus on numbers.");
const angelNode = (state: BoardroomState) => personaNode(state, "angel",
    "You are Walter White (Angel). Be intense, visionary, and demanding. Focus on the product genius.");
const customerNode = (state: BoardroomState) => personaNode(state, "customer",
    "You are Jesse Pinkman (Customer). Be casual, slang-heavy, and honest about user experience. Use words like 'yo' and 'bitch'.");
const growthNode = (state: BoardroomState) => personaNode(state, "growth",
    "You are Saul Goodman (Growth). Be flashy, energetic, and look for marketing angles. S'all good man!");
const riskNode = (state: BoardroomState) => personaNode(state, "risk",
    "You are Mike Ehrmantraut (Risk). Be grumpy, concise, and focused on what could go wrong. No half measures.");

// 6. Graph Compilation
const workflow = new StateGraph<BoardroomState>({
    channels: {
        messages: {
            reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b),
            default: () => [],
        },
        next_speaker: {
            reducer: (a: string, b: string) => b,
            default: () => "chairman",
        },
        round_count: {
            reducer: (a: number, b: number) => b, // Replace with new count
            default: () => 0,
        }
    }
})
    .addNode("chairman", supervisorNode)
    .addNode("vc", vcNode)
    .addNode("angel", angelNode)
    .addNode("customer", customerNode)
    .addNode("growth", growthNode)
    .addNode("risk", riskNode)

    .addEdge(START, "chairman")
    .addConditionalEdges("chairman", (state) => state.next_speaker, {
        vc: "vc",
        angel: "angel",
        customer: "customer",
        growth: "growth",
        risk: "risk",
        FINISH: END
    })
    .addEdge("vc", "chairman")
    .addEdge("angel", "chairman")
    .addEdge("customer", "chairman")
    .addEdge("growth", "chairman")
    .addEdge("risk", "chairman");

// Use Memory Checkpointer for now
const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });


// 7. API Route Handler
export async function POST(req: NextRequest) {
    try {
        const { idea, threadId } = await req.json(); // threadId allows resuming

        if (!idea) {
            return NextResponse.json({ error: "Idea is required" }, { status: 400 });
        }

        const effectiveThreadId = threadId || Date.now().toString(); // Simple ID generation

        // If it's a new thread, seed it with the user's idea
        const initialInput = {
            messages: [new HumanMessage(idea)],
            round_count: 0,
        };

        // We use LangChainAdapter to stream the events to the client
        // Note: For LangGraph, standard streaming is "streamEvents" or "stream"
        // Integrating seamlessly with Vercel AI SDK needs a custom stream response.

        const stream = await app.stream(initialInput, {
            configurable: { thread_id: effectiveThreadId },
            streamMode: "updates" // Stream updates as nodes finish
        });

        const encoder = new TextEncoder();

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    // chunk is an object like { vc: { messages: [...] } }
                    // We need to verify what actually comes back.
                    // For "updates", it returns the state update from the node.

                    const nodeName = Object.keys(chunk)[0];
                    const nodeUpdate = chunk[nodeName];

                    if (nodeName === "chairman") {
                        // Supervisor just decided next speaker, maybe stream a status update?
                        // controller.enqueue(encoder.encode(`event: status\ndata: Chairman decided: ${nodeUpdate.next_speaker}\n\n`));
                    } else {
                        // Persona spoke
                        const messages = nodeUpdate.messages;
                        if (messages && messages.length > 0) {
                            const lastMsg = messages[messages.length - 1];
                            const payload = JSON.stringify({
                                speaker: nodeName, // "vc", "risk", etc.
                                text: lastMsg.content,
                                threadId: effectiveThreadId
                            });
                            controller.enqueue(encoder.encode(`${payload}\n`));
                        }
                    }
                }
                controller.close();
            }
        });

        return new Response(readableStream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

    } catch (e: any) {
        console.error("COUNCIL API ERROR:", e); // Log the actual error
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
