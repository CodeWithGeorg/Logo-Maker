import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Logging
console.log("-----------------------------------------");
console.log("Server starting...");
console.log("API Key found:", process.env.API_KEY ? "YES" : "NO");
console.log("-----------------------------------------");

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Use the robust Flash model with a long timeout
const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    requestOptions: { timeout: 60000 } 
});

// Retry Logic
async function generateWithRetry(parts, retries = 1) {
    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
        });
        return await result.response;
    } catch (err) {
        if (retries > 0 && (err.message.includes("fetch failed") || err.message.includes("503"))) {
            console.log("   ⚠️ Network/Server blip. Retrying...");
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

        // 1. Image Handling (Only for modernize mode)
        if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
            base64Images.forEach((base64String, index) => {
                try {
                    const base64Data = base64String.split(',')[1]; 
                    const mimeMatch = base64String.match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    if (base64Data) {
                        parts.push({
                            inlineData: { data: base64Data, mimeType: mimeType }
                        });
                        console.log(`   - Attached Image ${index + 1}`);
                    }
                } catch (e) { /* ignore */ }
            });
        }

        // 2. THE FIX: Strict "Nuclear" Prompt
        // We give different instructions for "Create" vs "Modernize"
        let systemContext = "";
        
        if (mode === 'create') {
            systemContext = `
                ROLE: You are a pure SVG Rendering Engine. 
                INPUT: A text description of a logo.
                OUTPUT: ONLY raw SVG XML code.
                RULES:
                1. DO NOT write explanations.
                2. DO NOT use markdown code blocks (no \`\`\`xml).
                3. START immediately with <svg ...
                4. END immediately with </svg>.
                5. Use a standard 512x512 viewBox.
                6. Make the design thick, bold, and high-contrast (Vector Style).
                7. If the user prompt is vague (e.g., "generate a logo"), invent a modern abstract geometric shape.
            `;
        } else {
            systemContext = `
                ROLE: You are a Vectorizer. 
                TASK: Convert the attached image reference into a clean, modern SVG logo.
                OUTPUT: ONLY raw SVG XML code.
                RULES:
                1. Simplify the design into geometric shapes.
                2. Remove noise and text artifacts.
                3. Return ONLY the <svg>...</svg> code.
            `;
        }

        // Combine prompt
        parts.push({ text: `${systemContext}\n\nUSER INSTRUCTION: ${userPrompt}` });

        console.log("   - Sending to AI...");
        const response = await generateWithRetry(parts);
        const text = response.text();

        // 3. Robust Extraction
        // We accept the code even if it's wrapped in markdown, or if it has text before/after
        const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);

        if (svgMatch) {
            const cleanSvg = svgMatch[0];
            const base64Svg = Buffer.from(cleanSvg).toString('base64');
            console.log("   ✅ Success! SVG generated.");
            return res.status(200).json({ image: `data:image/svg+xml;base64,${base64Svg}` });
        } else {
            // DEBUG: Log what the AI actually said so we can fix it if it happens again
            console.error("   ❌ AI Failed to output SVG. AI Response preview:");
            console.error(text.substring(0, 200) + "..."); 
            throw new Error("AI generated a text description instead of an image code.");
        }

    } catch (err) {
        console.error("   ❌ Error:", err.message);
        let msg = "Generation failed.";
        if (err.message.includes("429")) msg = "Too many requests. Please wait 1 min.";
        return res.status(500).json({ message: msg, details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend ready on port ${PORT}`);
});