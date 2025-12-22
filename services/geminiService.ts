
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppMode } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Generates or regenerates a logo using Gemini 2.5 Flash Image.
 * Acts as a senior brand consultant for high-end results.
 */
export async function generateAiLogo(
  mode: AppMode,
  userPrompt: string,
  base64Images: string[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error("Missing Studio API Access. Please contact support.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const parts: Part[] = [];

  base64Images.forEach((base64Image) => {
    const match = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          data: match[2],
          mimeType: match[1],
        },
      });
    }
  });

  const modernizeSystemPrompt = `You are a Senior Brand Strategist and Master Illustrator.
  MISSION: Perform a "Brand Revival" on the provided logo(s).
  CORE RULES:
  1. PRESERVE BRAND DNA: Keep the core shapes and fundamental identity intact.
  2. HD EVOLUTION: Render the output as a sharp, high-definition 4K professional logo.
  3. GEOMETRIC PERFECTION: Fix any wobbly lines or blurry artifacts. Use mathematically precise vectors.
  4. TYPEFACE UPGRADE: If text exists, use a premium, modern, and legible typeface that matches the original intent but feels contemporary.
  5. COLOR DEPTH: Apply sophisticated color theory. Use professional gradients if requested or appropriate.
  CONTEXT: ${userPrompt || "Modernize this brand with timeless elegance."}`;

  const createSystemPrompt = `You are an Award-Winning Logo Designer and Visionary Artist.
  MISSION: Forge a new brand identity from the provided brief and references.
  CORE RULES:
  1. ICONIC SYMBOLISM: Create a mark that is simple, memorable, and unique.
  2. SYNTHESIS: If reference images are provided, blend their style, palette, and geometric language into one cohesive new design.
  3. PROFESSIONAL FINISH: The output must look like a multi-million dollar branding package.
  4. VERSATILITY: Ensure the logo works well on both light and dark backgrounds.
  5. CREATIVE BRIEF: ${userPrompt || "A minimalist and iconic professional logo."}`;

  parts.push({
    text: mode === 'modernize' ? modernizeSystemPrompt : createSystemPrompt
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("The creative engine failed to render an image. Let's try adjusting the brief.");
}
