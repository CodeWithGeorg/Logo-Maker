
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppMode } from "../types";

/**
 * Generates or regenerates a logo using Gemini 2.5 Flash Image.
 * Enhanced with a 'Precision Architectural Framework' to ensure world-class branding output.
 */
export async function generateAiLogo(
  mode: AppMode,
  userPrompt: string,
  base64Images: string[]
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing Studio API Access. Please contact support.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const parts: Part[] = [];
  base64Images.forEach((base64Image) => {
    const match = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: { data: match[2], mimeType: match[1] },
      });
    }
  });

  /**
   * STRICT BRANDING DIRECTIVES:
   * These rules are designed to minimize AI hallucinations and maximize professional quality.
   */
  const perfectionDirectives = `
    ESTABLISH ARCHITECTURAL BRAND PERFECTION:
    1. SYMBOLISM OVER ILLUSTRATION: Create a distinct, iconic mark. Avoid complex, busy illustrations or photorealistic scenes.
    2. ZERO GIBBERISH: Do not generate random characters, fake words, or "AI text" unless explicitly asked for specific letters.
    3. GEOMETRIC PRECISION: Use mathematically balanced shapes, perfect circles, and clean vectors. Ensure visual weight is centered.
    4. FLAT AESTHETIC: Prioritize solid colors and clean negative space. No fuzzy edges, no messy gradients, and no over-detailed textures.
    5. LEGIBILITY: The mark must be high-contrast and recognizable at all scales (from mobile icons to billboards).
    6. ENVIRONMENT: Output the logo clearly centered on a solid, clean, high-contrast monochrome background.
    7. SCALE: Render in absolute high-fidelity 4K quality with crisp boundaries.
  `;

  const systemPrompt = mode === 'modernize' 
    ? `TASK: BRAND REVIVAL & MODERNIZATION. 
       ${perfectionDirectives}
       INSTRUCTION: Analyze the visual DNA of the provided reference. 
       Reconstruct it into a modern, high-fidelity professional logo that feels timeless and premium. 
       Eliminate all noise, blur, and dated artifacts. 
       BRIEF: ${userPrompt}`
    : `TASK: FORGE NEW IDENTITY. 
       ${perfectionDirectives}
       INSTRUCTION: Based on the creative brief, synthesize a groundbreaking, symbolic brand mark. 
       Focus on high-concept visual metaphors and professional symmetry. 
       BRIEF: ${userPrompt}`;

  parts.push({ text: systemPrompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: parts },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("The creative engine failed to render a visual output. Please refine your brief.");

  } catch (err: any) {
    const errorMsg = err.message?.toLowerCase() || "";
    
    // Specific handling for rate limits and quota
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("too many requests")) {
      throw new Error("High-fidelity engine limit reached. Our studio is currently processing a high volume of requests. Please wait 60 seconds and try again.");
    }
    
    throw err;
  }
}
