import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic Logging
console.log("-----------------------------------------");
console.log("Server starting...");
console.log("API Key found:", process.env.API_KEY ? "YES" : "NO");
console.log("-----------------------------------------");

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini with a specific Timeout Config
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    // UPGRADE 1: Increase timeout to 60 seconds
    requestOptions: { timeout: 60000 } 
});

// Helper: Simple retry logic
async function generateWithRetry(parts, retries = 1) {
    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
        });
        return await result.response;
    } catch (err) {
        if (retries > 0 && err.message.includes("fetch failed")) {
            console.log("   ⚠️ Network blip. Retrying...");
            return await generateWithRetry(parts, retries - 1);
        }
        throw err;
    }
}

app.post('/api/generate-logo', async (req, res) => {
    const { mode, userPrompt, base64Images } = req.body;
    console.log(`\n🎨 Request: ${mode} | Prompt: "${userPrompt.substring(0, 20)}..."`);

    try {
        const parts = [];

        // Image Handling
        if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
            base64Images.forEach((base64String, index) => {
                try {
                    const base64Data = base64String.split(',')[1]; 
                    const mimeMatch = base64String.match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    
                    if (base64Data) {
                        parts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        });
                        console.log(`   - Attached Image ${index + 1}`);
                    }
                } catch (e) { /* ignore bad images */ }
            });
        }

        const perfectionDirectives = `
            You are an expert Vector Logo Designer.
            TASK: Generate a ${mode === 'modernize' ? 'revamped' : 'new'} logo.
            CRITICAL: Return ONLY valid SVG code. Start with <svg and end with </svg>.
            NO markdown, NO text explanations. 
            Ensure the SVG uses a standard 512x512 viewbox, high contrast, and professional geometry.
        `;

        parts.push({ text: `${perfectionDirectives}\n\nUSER REQUEST: ${userPrompt}` });

        console.log("   - Sending to AI...");
        
        // UPGRADE 2: Use the retry function
        const response = await generateWithRetry(parts);
        const text = response.text();

        // Extract SVG
        const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
        if (svgMatch) {
            const base64Svg = Buffer.from(svgMatch[0]).toString('base64');
            console.log("   ✅ Success! SVG generated.");
            return res.status(200).json({ image: `data:image/svg+xml;base64,${base64Svg}` });
        } else {
            throw new Error("AI output text but no SVG code.");
        }

    } catch (err) {
        console.error("   ❌ Error:", err.message);
        
        let msg = "Generation failed.";
        if (err.message.includes("429")) msg = "Too many requests. Please wait 1 min.";
        if (err.message.includes("fetch failed")) msg = "Network timeout. Please check your internet.";

        return res.status(500).json({ message: msg, details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend ready on port ${PORT}`);
});