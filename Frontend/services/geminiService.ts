import { AppMode } from "../types";

export async function generateAiLogo(
  mode: AppMode,
  userPrompt: string,
  base64Images: string[]
): Promise<string> {
  
  try {
    // Pointing to your local backend
    const response = await fetch('http://localhost:3001/api/generate-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        userPrompt,
        base64Images,
      }),
    });

    // Handle Rate Limiting (429) specifically
    if (response.status === 429) {
      throw new Error("Global Usage Limit Reached. Please wait 60 seconds.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.image) {
      throw new Error("No image data received from server.");
    }

    return data.image;

  } catch (err: any) {
    console.error("Service Error:", err);
    throw err;
  }
}