
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { AppMode } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Generates or regenerates a logo using Gemini 2.5 Flash Image.
 * Now supports multiple reference images.
 */
export async function generateAiLogo(
  mode: AppMode,
  userPrompt: string,
  base64Images: string[]
): Promise<string> {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure it is set in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const parts: Part[] = [];

  // Add all images provided as parts
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

  // Define System Contexts
  const modernizeSystemPrompt = `You are an expert brand restorer. 
  Take the provided reference image(s) and recreate it as a modern, high-definition 4K vector-style logo. 
  If multiple images are provided, use them to understand different angles or details of the same brand.
  PRESERVE the core identity, layout, and iconography. 
  Improve the typography, refine the geometry, and use professional gradients/colors.
  User instruction: ${userPrompt || "Recreate this logo with modern aesthetics."}`;

  const createSystemPrompt = `You are a world-class graphic designer. 
  Create a brand new, high-definition professional logo from scratch based on the following description.
  The design should be clean, iconic, and suitable for a modern tech startup or premium brand.
  ${base64Images.length > 0 ? `Use the provided ${base64Images.length} images as style, color, or layout references. Synthesize the best elements from all of them into one unique creation.` : "Design this from scratch."}
  Description: ${userPrompt || "A minimalist and modern professional logo."}`;

  parts.push({
    text: mode === 'modernize' ? modernizeSystemPrompt : createSystemPrompt
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: parts,
    },
  });

  // Extract the image part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("The AI did not return an image. " + (response.text || "No response."));
}
