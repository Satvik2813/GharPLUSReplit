import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

function getAI() {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "placeholder";
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  return new GoogleGenAI({
    apiKey,
    ...(baseUrl ? { baseUrl } : {}),
  });
}

async function runPrompt(prompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });
  return response.text ?? "";
}

// Meal Plan
router.post("/gharplus/meal-plan", async (req, res) => {
  const { region, diet } = req.body as { region: string; diet: string };
  const prompt = `Generate a 7-day Indian meal plan for a family from ${region} preferring ${diet} diet.
Return ONLY valid JSON array, no markdown, no explanation.
Format: [{"day":1,"dayName":"Monday","meals":{"breakfast":"...","lunch":"...","dinner":"..."}}]
Make meals authentic Indian dishes appropriate for ${region} cuisine and ${diet} diet.`;
  const result = await runPrompt(prompt);
  res.json({ result });
});

// Analyze fridge/pantry image
router.post("/gharplus/analyze-image", async (req, res) => {
  const { base64, mimeType } = req.body as { base64: string; mimeType: string };
  const ai = getAI();
  const prompt = `Analyze this image of a fridge/pantry. Identify all visible food items and estimate quantities.
Return ONLY valid JSON array, no markdown, no explanation.
Format: [{"name":"Milk","quantity":"1 litre"},{"name":"Tomatoes","quantity":"6 pieces"}]`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    config: { maxOutputTokens: 8192 },
  });
  res.json({ result: response.text ?? "[]" });
});

// Categorize groceries
router.post("/gharplus/categorize", async (req, res) => {
  const { items } = req.body as { items: string[] };
  const prompt = `Categorize these grocery items into Indian grocery store categories.
Items: ${items.join(", ")}
Categories: Produce, Dairy, Grains & Pulses, Spices & Masalas, Oils & Condiments, Snacks, Beverages, Frozen, Personal Care, Household
Return ONLY valid JSON array, no markdown.
Format: [{"name":"Milk","category":"Dairy"},{"name":"Tomatoes","category":"Produce"}]`;
  const result = await runPrompt(prompt);
  res.json({ result });
});

// Smart swap
router.post("/gharplus/smart-swap", async (req, res) => {
  const { item, diet } = req.body as { item: string; diet: string };
  const prompt = `Suggest a healthier or more economical Indian alternative for "${item}" for a ${diet} family.
Return ONLY valid JSON object, no markdown.
Format: {"alternative":"Brown Rice","reason":"Higher fiber content, better for health","savings":"Similar price, more nutritious"}`;
  const result = await runPrompt(prompt);
  res.json({ result });
});

// Minani AI chat
router.post("/gharplus/minani", async (req, res) => {
  const { messages, newMessage } = req.body as {
    messages: Array<{ role: "user" | "model"; content: string }>;
    newMessage: string;
  };
  const systemPrompt = `You are Minani, a warm and helpful Indian household manager assistant. 
You help Indian families with meal planning, recipes, grocery tips, stain removal, home remedies, budget advice, and general household management.
Be concise, practical, and culturally aware of Indian households. Use simple English.`;

  const ai = getAI();
  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    { role: "model" as const, parts: [{ text: "Namaste! I'm Minani, your household assistant. How can I help you today?" }] },
    ...messages.map((m) => ({
      role: m.role as "user" | "model",
      parts: [{ text: m.content }],
    })),
    { role: "user" as const, parts: [{ text: newMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: { maxOutputTokens: 8192 },
  });
  res.json({ result: response.text ?? "Sorry, I couldn't understand that. Please try again." });
});

export default router;
