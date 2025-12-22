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

const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    requestOptions: { timeout: 60000 } 
});

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
    console.log(`\n🎨 Request: ${mode} | Prompt: "${userPrompt.substring(0, 30)}..."`);

    try {
        const parts = [];

        // 1. Image Handling
        if (base64Images && Array.isArray(base64Images) && base64Images.length > 0) {
            base64Images.forEach((base64String) => {
                try {
                    const base64Data = base64String.split(',')[1]; 
                    const mimeMatch = base64String.match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    if (base64Data) {
                        parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
                    }
                } catch (e) { /* ignore */ }
            });
        }

        // 2. THE UPGRADED "CREATIVE DIRECTOR" PROMPT
        let systemContext = "";
        
        if (mode === 'create') {
            systemContext = `
                ROLE: You are a World-Class Brand Designer & SVG Coder.
                TASK: Create a professional, high-impact vector logo.
                
                STRICT VISUAL RULES:
                1. IF THE USER ASKS FOR TEXT/NAME: Do NOT try to draw the letters with paths. Use the <text> tag.
                   - Example: <text x="50%" y="80%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="48" fill="#333">NAME</text>
                2. THE ICON: Create a unique, abstract mark using <path>. Do NOT use simple circles or squares. 
                   - Use gradients (<defs><linearGradient>...) to make it look premium.
                   - Use interference patterns, interlaced lines, or geometric abstractions.
                3. LAYOUT: Center the icon in the middle (approx y=200) and place the text below it (approx y=400).
                4. CANVAS: Use viewBox="0 0 512 512".
                5. COLOR: Use professional tech palettes (Deep Blue & Electric Blue, or Black & Gold).
                
                OUTPUT FORMAT:
                - Return ONLY the raw <svg>...</svg> code.
                - No markdown, no explanations.
            `;
        } else {
            systemContext = `
                ROLE: You are a Vectorizer. 
                TASK: Redraw the provided image as a clean, professional SVG logo.
                RULES:
                1. Trace the key shapes using <path>.
                2. Simplify messy details into clean geometry.
                3. Use gradients to add depth.
                4. Return ONLY raw SVG code.
            `;
        }

        parts.push({ text: `${systemContext}\n\nDESIGN BRIEF: ${userPrompt}` });

        console.log("   - Sending to AI...");
        const response = await generateWithRetry(parts);
        const text = response.text();

        // 3. Extraction
        const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);

        if (svgMatch) {
            const cleanSvg = svgMatch[0];
            const base64Svg = Buffer.from(cleanSvg).toString('base64');
            console.log("   ✅ Success! SVG generated.");
            return res.status(200).json({ image: `data:image/svg+xml;base64,${base64Svg}` });
        } else {
            console.error("   ❌ AI Failed. Response preview:", text.substring(0, 200)); 
            throw new Error("AI generated text instead of visual code.");
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