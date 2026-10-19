import { NextRequest, NextResponse } from "next/server";
import { CLUB_SYSTEM_PROMPT, getSmartFallbackResponse } from "@/lib/chatbot-data";
import fs from "fs";
import path from "path";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function resolveGeminiApiKey(clientKey?: string): string | undefined {
  if (clientKey && clientKey.trim()) return clientKey.trim();
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim()) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim();
  }

  // Fallback: Read directly from .env file from disk (handles cases where next dev was started prior to adding the key)
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/GEMINI_API_KEY\s*=\s*(["']?)([^"'\r\n]+)\1/);
      if (match && match[2] && match[2].trim()) {
        return match[2].trim();
      }
    }
  } catch (err) {
    console.warn("Could not read .env from disk:", err);
  }

  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const clientGeminiKey: string | undefined = body?.apiKey;

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const userQuery = lastUserMessage?.content || "";
    const persona: "mentor" | "guide" | "coach" = body?.persona || "mentor";

    const personaPrompt =
      persona === "mentor"
        ? `${CLUB_SYSTEM_PROMPT}\n\nSPECIAL FOCUS [CODE MENTOR MODE]: Prioritize code solutions, algorithmic rigor, complexity analysis, clean syntax, and idiomatic practices. Answer any question the user asks with technical depth and clarity.`
        : persona === "coach"
        ? `${CLUB_SYSTEM_PROMPT}\n\nSPECIAL FOCUS [HACKATHON & CAREER COACH MODE]: Focus on project architecture, pitch strategies, interview prep, resumes, and winning hackathon frameworks. Answer any question the user asks thoroughly.`
        : `${CLUB_SYSTEM_PROMPT}\n\nSPECIAL FOCUS [CLUB GUIDE MODE]: Guide the user on campus events, courses, certificates, team coordinators, university navigation, and any general knowledge or technical question the user asks.`;

    const geminiApiKey = resolveGeminiApiKey(clientGeminiKey);

    // 1. Google Gemini Generative AI Call
    if (geminiApiKey) {
      try {
        // Find first user message so conversation starts with user (required by Gemini multi-turn API)
        const firstUserIdx = messages.findIndex((m) => m.role === "user");
        const activeMessages = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : messages;

        // Build valid alternating contents
        const geminiContents: Array<{
          role: "user" | "model";
          parts: Array<{ text: string }>;
        }> = [];

        for (const msg of activeMessages) {
          const role: "user" | "model" = msg.role === "assistant" ? "model" : "user";
          const text = msg.content?.trim();
          if (!text) continue;

          // Merge consecutive identical roles
          if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
            geminiContents[geminiContents.length - 1].parts[0].text += `\n\n${text}`;
          } else {
            geminiContents.push({
              role,
              parts: [{ text }],
            });
          }
        }

        // Most reliable models in verified order: gemini-3.8-flash, gemini-3.5-flash, gemini-3.7-flash, gemini-3.6-flash, gemini-3.1-flash-lite, gemini-3-flash-preview, gemini-flash-latest
        const modelsToTry = [
          "gemini-3.8-flash",
          "gemini-3.5-flash",
          "gemini-3.7-flash",
          "gemini-3.6-flash",
          "gemini-3.1-flash-lite",
          "gemini-3-flash-preview",
          "gemini-flash-latest",
        ];

        let generatedText: string | null = null;

        for (const model of modelsToTry) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: personaPrompt }],
                  },
                  contents: geminiContents,
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const parts = geminiData.candidates?.[0]?.content?.parts || [];
              const reply = parts
                .map((p: { text?: string }) => p.text)
                .filter(Boolean)
                .join("\n")
                .trim();

              if (reply) {
                generatedText = reply;
                break;
              }
            } else {
              const errBody = await geminiRes.text();
              console.warn(`Gemini model ${model} status ${geminiRes.status}:`, errBody);
            }
          } catch (modelErr) {
            console.warn(`Error connecting to Gemini model ${model}:`, modelErr);
          }
        }

        if (generatedText) {
          return NextResponse.json({
            success: true,
            provider: "ai",
            model: "Coding Club AI",
            message: {
              role: "assistant",
              content: generatedText,
            },
            suggestedFollowUps: generateFollowUpSuggestions(userQuery),
          });
        }
      } catch (geminiError) {
        console.error("AI API call failed:", geminiError);
      }
    }

    // 2. Intelligent dynamic fallback if API key is pending or network error
    const fallbackResponse = getSmartFallbackResponse(userQuery);

    return NextResponse.json({
      success: true,
      provider: "assistant",
      message: {
        role: "assistant",
        content: fallbackResponse.content,
      },
      suggestedFollowUps: fallbackResponse.suggestedFollowUps,
    });
  } catch (err) {
    console.error("Chat API route error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: {
          role: "assistant",
          content:
            "I encountered a temporary issue. Please explore our [Events](/events), [Courses](/courses), or [Certificate Verification](/verify)!",
        },
      },
      { status: 500 }
    );
  }
}

function generateFollowUpSuggestions(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes("code") || q.includes("program") || q.includes("python") || q.includes("c++") || q.includes("java")) {
    return [
      "Can you explain the time complexity?",
      "How can I optimize this code?",
      "What programming courses does the club offer?",
    ];
  }
  if (q.includes("certif") || q.includes("verify")) {
    return [
      "How to download the certificate PDF?",
      "What if my Certificate ID is not found?",
      "What courses provide certificates?",
    ];
  }
  if (q.includes("event") || q.includes("hackathon")) {
    return [
      "How can I register for the hackathon?",
      "Who can participate?",
      "Tell me about past club events",
    ];
  }
  if (q.includes("join") || q.includes("member")) {
    return [
      "Who is the faculty coordinator?",
      "Are there recruitment drives for teams?",
      "What projects has the club built?",
    ];
  }
  return [
    "Tell me about upcoming club events",
    "How to verify a certificate?",
    "What courses and bootcamps are available?",
  ];
}
