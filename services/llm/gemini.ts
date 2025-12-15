// services/llm/gemini.ts
import fetch from "node-fetch";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";
const GEMINI_MODEL = "gemini-3-pro-preview";

export async function callGemini(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 未配置");
  }

  const res = await fetch(
    `${GEMINI_BASE_URL}/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini API 错误 ${res.status}: ${t}`);
  }

  const json = await res.json();
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini 返回内容为空");
  }

  return JSON.parse(text);
}
