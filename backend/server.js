import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Better Error Logging
console.log("-----------------------------------------");
console.log("Server starting...");
console.log("API Key found:", process.env.API_KEY ? "YES (Length: " + process.env.API_KEY.length + ")" : "NO - CHECK .ENV FILE");
console.log("-----------------------------------------");

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
// Change this line:
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
app.post('/api/generate-logo', async (req, res) => {
    if (!process.env.API_KEY) {
        console.error("❌ ERROR: API Key is missing.");
        return res.status(500).json({ message: "Server API Key not configured." });
    }

    const { mode, userPrompt, base64Images } = req.body;
    console.log(`\n🎨 New Request: ${mode} | Prompt: "${userPrompt.substring(0, 30)}..."`);

    try {
        const parts = [];

        // Image Handling
        if (base64Images && Array.isArray(base64Images)) {
            base64Images.forEach((base64String, index) => {
                try {
                    // Extract strictly the base64 data
                    const base64Data = base64String.split(',')[1]; 
                    // Extract mime type (e.g., image/png)
                    const mimeMatch = base64String.match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    
                    if (base64Data) {
                        parts.push({
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        });
                        console.log(`   - Attached Image ${index + 1} (${mimeType})`);
                    }
                } catch (imgErr) {
                    console.error("   ❌ Error processing image:", imgErr);
                }
            });
        }

        const perfectionDirectives = `
            You are an expert Logo Designer and SVG coder.
            TASK: Create a professional vector logo based on the user request.
            CRITICAL: Return ONLY valid SVG code. Do not output markdown code fences like \`\`\`xml. 
            Just start with <svg ... and end with </svg>.
            
            REQUIREMENTS:
            1. Use a standard 512x512 viewbox.
            2. Use professional, balanced geometry.
            3. Ensure high contrast and clean lines.
            4. Make it look modern and sleek.
        `;

        parts.push({ text: `${perfectionDirectives}\n\nUSER REQUEST: ${userPrompt}` });

        console.log("   - Sending request to Gemini...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
        });

        const response = await result.response;
        const text = response.text();
        console.log("   - Received response from Gemini.");

        // Robust SVG Extraction using Regex
        // This looks for <svg ... </svg> even if it's buried in text or markdown
        const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);

        if (svgMatch) {
            const svgContent = svgMatch[0];
            const base64Svg = Buffer.from(svgContent).toString('base64');
            const finalImage = `data:image/svg+xml;base64,${base64Svg}`;
            
            console.log("   ✅ Success! SVG generated.");
            return res.status(200).json({ image: finalImage });
        } else {
            console.error("   ❌ AI did not return SVG. Raw response preview:", text.substring(0, 200));
            throw new Error("AI generated a description but no visual code. Please try a simpler prompt.");
        }

    } catch (err) {
        console.error("❌ CRITICAL SERVER ERROR:", err);
        
        // Return a cleaner error to the frontend
        let message = "Error generating logo.";
        if (err.message.includes("429")) message = "Traffic Limit Reached. Please wait 60 seconds.";
        if (err.message.includes("SAFETY")) message = "The request was blocked by AI safety filters.";
        
        return res.status(500).json({ message: message, details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});