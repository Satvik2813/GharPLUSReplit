const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/gharplus`;

async function callGeminiAPI(endpoint: string, body: object): Promise<string> {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${err}`);
  }
  const data = await response.json() as { result: string };
  return data.result;
}

export async function generateMealPlan(
  region: string,
  diet: string
): Promise<
  Array<{ day: number; dayName: string; meals: { breakfast: string; lunch: string; dinner: string } }>
> {
  const text = await callGeminiAPI("meal-plan", { region, diet });
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Invalid meal plan response");
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.map(
    (item: { day: number; dayName?: string; meals: { breakfast: string; lunch: string; dinner: string } }, i: number) => ({
      day: item.day || i + 1,
      dayName: item.dayName || dayNames[i] || `Day ${i + 1}`,
      meals: item.meals,
    })
  );
}

export async function analyzePantryImage(
  base64: string,
  mimeType: string
): Promise<Array<{ name: string; quantity: string }>> {
  const text = await callGeminiAPI("analyze-image", { base64, mimeType });
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  return JSON.parse(jsonMatch[0]);
}

export async function categorizeGroceries(
  items: string[]
): Promise<Array<{ name: string; category: string }>> {
  const text = await callGeminiAPI("categorize", { items });
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return items.map((n) => ({ name: n, category: "Other" }));
  return JSON.parse(jsonMatch[0]);
}

export async function getSmartSwap(
  item: string,
  diet: string
): Promise<{ alternative: string; reason: string; savings: string }> {
  const text = await callGeminiAPI("smart-swap", { item, diet });
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch)
    return { alternative: item, reason: "No swap found", savings: "Same price" };
  return JSON.parse(jsonMatch[0]);
}

export async function chatWithMinani(
  messages: Array<{ role: "user" | "model"; content: string }>,
  newMessage: string
): Promise<string> {
  return await callGeminiAPI("minani", { messages, newMessage });
}
