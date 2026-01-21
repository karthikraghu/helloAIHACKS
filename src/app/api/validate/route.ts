import { NextRequest, NextResponse } from "next/server";
import { getPersonasByIds } from "@/lib/personas";

// POST /api/validate
// Validates a startup idea against ALL selected personas in ONE Gemini API call
export async function POST(request: NextRequest) {
    try {
        const { idea, personaIds } = await request.json();

        // Validate input
        if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
            return NextResponse.json(
                { error: "Idea is required" },
                { status: 400 }
            );
        }

        if (!personaIds || !Array.isArray(personaIds) || personaIds.length === 0) {
            return NextResponse.json(
                { error: "At least one persona must be selected" },
                { status: 400 }
            );
        }

        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        // Get selected personas
        const selectedPersonas = getPersonasByIds(personaIds);
        if (selectedPersonas.length === 0) {
            return NextResponse.json(
                { error: "No valid personas selected" },
                { status: 400 }
            );
        }

        // Build persona descriptions
        const personaDescriptions = selectedPersonas.map(p =>
            `**${p.id}** - ${p.name} (${p.role}): ${p.systemPrompt}`
        ).join("\n\n");

        // Build expected JSON structure with scores
        const jsonStructure: Record<string, { analysis: string; scores: { label: string; value: number }[]; verdict: string }> = {};
        selectedPersonas.forEach(p => {
            jsonStructure[p.id] = {
                analysis: `[${p.name}'s detailed evaluation]`,
                scores: [
                    { label: "Score 1", value: 7 },
                    { label: "Score 2", value: 8 },
                    { label: "Score 3", value: 6 }
                ],
                verdict: "GO or NO GO"
            };
        });

        const combinedPrompt = `Evaluate this startup idea from multiple expert perspectives.

STARTUP IDEA:
${idea.trim()}

EVALUATORS:
${personaDescriptions}

INSTRUCTIONS:
1. For each evaluator, provide their detailed evaluation
2. Include 3 scores relevant to their expertise (each 1-10)
3. Each verdict MUST be exactly "GO" or "NO GO"
4. Return JSON with this structure:

${JSON.stringify(jsonStructure, null, 2)}

The analysis should be detailed (200-300 words). Scores should reflect the persona's key metrics. Return ONLY the JSON object.`;

        // Model: Gemini 2.5 Flash Lite
        const MODEL = "gemini-2.5-flash-lite";

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: combinedPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json",
                    }
                }),
            }
        );

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            console.error("Gemini API error:", errorData);
            return NextResponse.json({
                success: false,
                error: errorData.error?.message || "Failed to get response from Gemini",
                responses: [],
            });
        }

        const data = await geminiResponse.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log("Raw Gemini response:", responseText);

        if (!responseText) {
            return NextResponse.json({
                success: false,
                error: "No response generated",
                responses: [],
            });
        }

        // Parse the JSON response
        let parsedResponse: Record<string, { analysis?: string; scores?: { label: string; value: number }[]; verdict?: string } | string>;
        try {
            let jsonString = responseText.trim();
            if (jsonString.startsWith("```json")) jsonString = jsonString.slice(7);
            else if (jsonString.startsWith("```")) jsonString = jsonString.slice(3);
            if (jsonString.endsWith("```")) jsonString = jsonString.slice(0, -3);
            parsedResponse = JSON.parse(jsonString.trim());
        } catch {
            console.error("Failed to parse Gemini response:", responseText);
            return NextResponse.json({
                success: false,
                error: "Failed to parse AI response. Please try again.",
                responses: [],
            });
        }

        // Transform to expected format
        const formattedResponses = selectedPersonas.map(persona => {
            const personaData = parsedResponse[persona.id];

            let analysis = "";
            let scores: { label: string; value: number }[] = [];
            let verdict = "NO GO";

            if (typeof personaData === "string") {
                analysis = personaData;
                verdict = personaData.toUpperCase().includes("VERDICT: GO") &&
                    !personaData.toUpperCase().includes("NO GO") ? "GO" : "NO GO";
            } else if (personaData && typeof personaData === "object") {
                analysis = personaData.analysis || "";
                scores = Array.isArray(personaData.scores) ? personaData.scores : [];
                verdict = personaData.verdict?.toUpperCase().includes("GO") &&
                    !personaData.verdict?.toUpperCase().includes("NO GO") ? "GO" : "NO GO";
            }

            return {
                personaId: persona.id,
                success: !!analysis,
                error: analysis ? null : "No response for this persona",
                response: analysis,
                scores: scores,
                verdict: verdict,
                goVerdict: persona.goVerdict,
                noGoVerdict: persona.noGoVerdict,
            };
        });

        const hasAnySuccess = formattedResponses.some(r => r.success);

        return NextResponse.json({
            success: hasAnySuccess,
            idea: idea.trim(),
            responses: formattedResponses,
            error: hasAnySuccess ? null : "No valid responses received",
        });

    } catch (error) {
        console.error("Validation API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
