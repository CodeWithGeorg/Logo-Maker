import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);
  
  try {
    console.log("Checking available models for your API Key...");
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get client
    
    // Actually fetching the list
    // We use a lower-level fetch because the SDK simplifies this out sometimes
    const apiKey = process.env.API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ AVAILABLE MODELS:");
      const visionModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
      visionModels.forEach(m => {
        console.log(`   - ${m.name.replace('models/', '')}`);
      });
      console.log("\n👉 Use one of the names above in your server.js line 22.");
    } else {
      console.error("❌ No models found. Response:", data);
    }

  } catch (error) {
    console.error("❌ Error listing models:", error.message);
  }
}

listModels();