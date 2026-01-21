import { NextRequest, NextResponse } from "next/server";
import { getPersonaById } from "@/lib/personas";

// Get Groq API key for a specific persona (or fallback to default)
function getApiKeyForPersona(personaId: string): string | null {
    const keyMap: Record<string, string | undefined> = {
        vc: process.env.GROQ_API_KEY_VC,
        angel: process.env.GROQ_API_KEY_ANGEL,
        customer: process.env.GROQ_API_KEY_CUSTOMER,
        growth: process.env.GROQ_API_KEY_GROWTH,
        risk: process.env.GROQ_API_KEY_RISK,
    };

    const specificKey = keyMap[personaId];
    const fallbackKey = process.env.GROQ_API_KEY;

    const key = specificKey || fallbackKey;

    if (!key || key.startsWith("your_")) {
        return null;
    }

    return key;
}

// POST /api/validate/persona
// Validates a startup idea against a SINGLE persona using Groq API
export async function POST(request: NextRequest) {
    try {
        const { idea, personaId } = await request.json();

        // Validate input
        if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
            return NextResponse.json(
                { error: "Idea is required" },
                { status: 400 }
            );
        }

        if (!personaId || typeof personaId !== "string") {
            return NextResponse.json(
                { error: "Persona ID is required" },
                { status: 400 }
            );
        }

        // Get persona config
        const persona = getPersonaById(personaId);
        if (!persona) {
            return NextResponse.json(
                { error: `Unknown persona: ${personaId}` },
                { status: 400 }
            );
        }

        // Get API key for this specific persona
        const apiKey = getApiKeyForPersona(personaId);
        if (!apiKey) {
            return NextResponse.json({
                personaId,
                success: false,
                error: `API key not configured for ${persona.name}. Add GROQ_API_KEY_${personaId.toUpperCase()} to .env.local`,
                response: null,
                scores: [],
                verdict: null,
            });
        }

        // Build the system prompt
        const systemPrompt = `You are ${persona.name}, a ${persona.role}. ${persona.description}.

${persona.systemPrompt}

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
    "analysis": "Your detailed evaluation (300-500 words, use markdown formatting)",
    "scores": [
        {"label": "Metric 1 Name", "value": 7},
        {"label": "Metric 2 Name", "value": 8},
        {"label": "Metric 3 Name", "value": 6}
    ],
    "verdict": "GO" or "NO GO"
}

Stay fully in character as ${persona.name}. Be specific, detailed, and provide actionable insights.`;

        const userPrompt = `Evaluate this startup idea:\n\n${idea.trim()}\n\nRespond with only the JSON object.`;

        // Groq API call (OpenAI-compatible format)
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2048,
                    response_format: { type: "json_object" },
                }),
            }
        );

        if (!groqResponse.ok) {
            const errorData = await groqResponse.json();
            console.error(`Groq API error for ${personaId}:`, errorData);
            return NextResponse.json({
                personaId,
                success: false,
                error: errorData.error?.message || "Failed to get response from Groq",
                response: null,
                scores: [],
                verdict: null,
            });
        }

        const data = await groqResponse.json();
        const responseText = data.choices?.[0]?.message?.content;

        if (!responseText) {
            return NextResponse.json({
                personaId,
                success: false,
                error: "No response generated",
                response: null,
                scores: [],
                verdict: null,
            });
        }

        // Parse the JSON response
        let parsedResponse: { analysis?: string; scores?: { label: string; value: number }[]; verdict?: string };
        try {
            let jsonString = responseText.trim();
            if (jsonString.startsWith("```json")) jsonString = jsonString.slice(7);
            else if (jsonString.startsWith("```")) jsonString = jsonString.slice(3);
            if (jsonString.endsWith("```")) jsonString = jsonString.slice(0, -3);
            parsedResponse = JSON.parse(jsonString.trim());
        } catch {
            console.error(`Failed to parse response for ${personaId}:`, responseText);
            return NextResponse.json({
                personaId,
                success: true,
                error: null,
                response: responseText,
                scores: [],
                verdict: responseText.toUpperCase().includes("NO GO") ? "NO GO" : "GO",
                goVerdict: persona.goVerdict,
                noGoVerdict: persona.noGoVerdict,
            });
        }

        const verdict = parsedResponse.verdict?.toUpperCase().includes("NO GO") ? "NO GO" :
            parsedResponse.verdict?.toUpperCase().includes("GO") ? "GO" : "NO GO";

        return NextResponse.json({
            personaId,
            success: true,
            error: null,
            response: parsedResponse.analysis || "",
            scores: Array.isArray(parsedResponse.scores) ? parsedResponse.scores : [],
            verdict: verdict,
            goVerdict: persona.goVerdict,
            noGoVerdict: persona.noGoVerdict,
        });

    } catch (error) {
        console.error("Persona validation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
