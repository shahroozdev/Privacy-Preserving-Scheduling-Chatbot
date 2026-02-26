import { features, templates, times } from "../constant";

export function generateRandomHarnessQueries(count: number): string[] {
  const generated: string[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const n = Math.floor(Math.random() * 20) + 1;
    const f1 = features[Math.floor(Math.random() * features.length)];
    const f2 = features[Math.floor(Math.random() * features.length)];
    const t = times[Math.floor(Math.random() * times.length)];

    generated.push(
      template
        .replace("{N}", String(n))
        .replace("{F}", f1)
        .replace("{F2}", f2)
        .replace("{T}", t),
    );
  }

  return generated;
}

 export const fetchMatch = async (text: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const res = await fetch(`${normalizedBase}match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.json();
  };