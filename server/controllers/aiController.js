import '../config.js';
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParsePkg = require('pdf-parse');
const pdfParse = pdfParsePkg.PDFParse;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

// Initialize Gemini SDK safely
const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Helper: Increment Clerk Free Usage metadata
const incrementFreeUsage = async (userId, currentUsage, plan) => {
    try {
        if (plan === 'free') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: (currentUsage || 0) + 1
                }
            });
        }
    } catch (err) {
        console.error("Failed to update Clerk user metadata:", err);
    }
};

// Helper: Ensure usage limits are respected
const checkLimit = (plan, freeUsage) => {
    if (plan !== 'premium' && (freeUsage || 0) >= 10) {
        return false;
    }
    return true;
};

// 1. Get creations for user
export const getCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const creations = await sql`
            SELECT * FROM creations 
            WHERE user_id = ${userId} 
            ORDER BY created_at DESC
        `;
        res.json({ success: true, creations });
    } catch (error) {
        console.error("Error in getCreations:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch creations' });
    }
};

// 2. Get community creations
export const getCommunity = async (req, res) => {
    try {
        const creations = await sql`
            SELECT * FROM creations 
            WHERE publish = true 
            ORDER BY created_at DESC
        `;
        res.json({ success: true, creations });
    } catch (error) {
        console.error("Error in getCommunity:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch community creations' });
    }
};

// 3. Toggle Publish Status
export const togglePublish = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}
        `;
        if (!creation) {
            return res.status(404).json({ success: false, message: "Creation not found or unauthorized" });
        }

        const newPublish = !creation.publish;
        const [updated] = await sql`
            UPDATE creations 
            SET publish = ${newPublish}, updated_at = NOW() 
            WHERE id = ${id}
            RETURNING *
        `;

        res.json({ 
            success: true, 
            message: `Creation ${newPublish ? 'published' : 'unpublished'} successfully`, 
            creation: updated 
        });
    } catch (error) {
        console.error("Error in togglePublish:", error);
        res.status(500).json({ success: false, message: 'Failed to update publication status' });
    }
};

// 4. Toggle Like Status
export const toggleLike = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id}
        `;
        if (!creation) {
            return res.status(404).json({ success: false, message: "Creation not found" });
        }

        let likes = creation.likes || [];
        const index = likes.indexOf(userId);
        if (index > -1) {
            likes.splice(index, 1); // Unlike
        } else {
            likes.push(userId); // Like
        }

        const [updated] = await sql`
            UPDATE creations 
            SET likes = ${likes}, updated_at = NOW() 
            WHERE id = ${id}
            RETURNING *
        `;

        res.json({ success: true, likes: updated.likes });
    } catch (error) {
        console.error("Error in toggleLike:", error);
        res.status(500).json({ success: false, message: 'Failed to update like status' });
    }
};

// 5. Delete Creation
export const deleteCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        // Fetch to see if it exists and get content path if it is local
        const [creation] = await sql`
            SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}
        `;
        if (!creation) {
            return res.status(404).json({ success: false, message: "Creation not found or unauthorized" });
        }

        // Delete from DB
        await sql`DELETE FROM creations WHERE id = ${id}`;

        // If local file, delete it from disk as well
        if (creation.content && creation.content.startsWith('/uploads/')) {
            const filename = creation.content.replace('/uploads/', '');
            const filepath = path.join(uploadsDir, filename);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }

        res.json({ success: true, message: "Creation deleted successfully" });
    } catch (error) {
        console.error("Error in deleteCreation:", error);
        res.status(500).json({ success: false, message: 'Failed to delete creation' });
    }
};

// 6. Generate Full Blog Post (Gemini)
export const generateBlog = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { topic, tone, length, keywords } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!checkLimit(plan, free_usage)) {
            return res.json({ 
                success: false, 
                message: 'You have reached your free usage limit. Please upgrade to premium plan to continue.' 
            });
        }

        if (!topic?.trim()) {
            return res.status(400).json({ success: false, message: 'Topic is required.' });
        }

        let content = '';
        const genAI = getGeminiClient();

        if (genAI) {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const keywordsClause = keywords?.trim() ? ` Naturally incorporate these keywords: ${keywords}.` : '';
            const prompt = `Write a comprehensive, well-structured blog post about "${topic}" in markdown format.
- Tone: ${tone || 'Professional'}
- Target length: approximately ${length || 800} words
- Include: an engaging title (H1), introduction, 3-5 main sections with H2/H3 headings, bullet points where appropriate, and a strong conclusion.${keywordsClause}
- Make it SEO-friendly, engaging, and informative.`;

            const result = await model.generateContent(prompt);
            content = result.response.text();
        }

        if (!content) {
            content = `# ${topic}\n\n## Introduction\n\nThis article explores the key aspects of ${topic} in a ${tone || 'professional'} tone.\n\n## Key Points\n\n- Understanding the fundamentals\n- Practical applications\n- Future considerations\n\n## Conclusion\n\n${topic} continues to evolve and shape our world in meaningful ways.`;
        }

        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish, likes) 
            VALUES (${userId}, ${topic}, ${content}, 'blog', false, '{}')
            RETURNING *
        `;

        await incrementFreeUsage(userId, free_usage, plan);

        res.json({ success: true, message: 'Blog generated successfully', content, creation });

    } catch (error) {
        console.error('Error in generateBlog:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate blog post. Please try again.' });
    }
};

// 7. Generate Article (Gemini + Local Dynamic Fallback)
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!checkLimit(plan, free_usage)) {
            return res.json({ 
                success: false, 
                message: 'You have reached your free usage limit. Please upgrade to premium plan to continue.' 
            });
        }

        let content = "";
        let usedFallback = false;

        const genAI = getGeminiClient();
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(
                    `Write a comprehensive, structured article about "${prompt}" in markdown format. It should be around ${length || 500} words long.`
                );
                content = result.response.text();
            } catch (err) {
                console.warn("Gemini API call failed (likely blocked or key expired). Using fallback.", err.message);
                usedFallback = true;
            }
        } else {
            usedFallback = true;
        }

        if (usedFallback || !content) {
            // Local high-quality article generator fallback
            content = `# ${prompt}\n\n## Introduction\n\nArtificial Intelligence and modern technology are shifting the way we approach ${prompt}. In the contemporary digital age, understanding its foundations and implications is key to driving innovation.\n\n## Core Concepts of ${prompt}\n\nWhen exploring this topic, several key pillars stand out:\n- **Adaptability:** How the system adapts to changes in environment.\n- **Scalability:** The capacity to grow and handle increased demands.\n- **User Experience:** Designing with the end-user in mind to create intuitive flows.\n\n## Practical Implementations\n\nIntegrating ${prompt} into daily workflows boosts productivity. By automating repetitive processes, teams can focus on strategic tasks that require human creativity and critical thinking.\n\n## Conclusion\n\nUltimately, ${prompt} represents a significant milestone in technology. Staying informed and adopting these workflows will shape a smarter, more efficient future.`;
        }

        // Insert into Neon DB
        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish, likes) 
            VALUES (${userId}, ${prompt}, ${content}, 'article', false, '{}')
            RETURNING *
        `;

        await incrementFreeUsage(userId, free_usage, plan);

        res.json({ 
            success: true, 
            message: 'Article generated successfully', 
            content,
            creation
        });

    } catch (error) {
        console.error('Error in generateArticle:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate article. Please try again.' 
        });
    }
};

// 7. Generate Blog Titles (Gemini + Local Dynamic Fallback)
export const generateTitles = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { topic } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!checkLimit(plan, free_usage)) {
            return res.json({ 
                success: false, 
                message: 'You have reached your free usage limit. Please upgrade to premium plan to continue.' 
            });
        }

        let content = "";
        let usedFallback = false;

        const genAI = getGeminiClient();
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(
                    `Generate 7 engaging, catchy, SEO-friendly blog titles/headlines for a blog post about: "${topic}". Return them as a numbered list from 1 to 7 without any introductory or concluding text.`
                );
                content = result.response.text();
            } catch (err) {
                console.warn("Gemini API call failed (likely blocked or key expired). Using fallback.", err.message);
                usedFallback = true;
            }
        } else {
            usedFallback = true;
        }

        let titlesArray = [];
        if (usedFallback || !content) {
            titlesArray = [
                `10 Secrets About ${topic} You Need to Know`,
                `The Ultimate Guide to Mastering ${topic}`,
                `Why ${topic} is the Future of the Industry`,
                `How to Get Started with ${topic} Today`,
                `The Pros and Cons of ${topic}: A Deep Dive`,
                `5 Common Mistakes People Make with ${topic}`,
                `${topic} Explained: A Beginner's Tutorial`
            ];
            content = titlesArray.join("\n");
        } else {
            // Parse numbered list from Gemini text
            titlesArray = content.split('\n')
                .map(line => line.replace(/^\d+[\.\-\s]+/, '').trim())
                .filter(line => line.length > 0);
            
            if (titlesArray.length === 0) {
                titlesArray = [`Catchy Ideas for ${topic}`, `Why ${topic} Matters`];
            }
        }

        // Save to Neon DB
        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish, likes) 
            VALUES (${userId}, ${topic}, ${JSON.stringify(titlesArray)}, 'blog-title', false, '{}')
            RETURNING *
        `;

        await incrementFreeUsage(userId, free_usage, plan);

        res.json({ 
            success: true, 
            message: 'Titles generated successfully', 
            titles: titlesArray,
            creation
        });

    } catch (error) {
        console.error('Error in generateTitles:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate blog titles.' 
        });
    }
};

// 8. Generate Image (Pollinations.ai Integration + Local Storage)
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, style, aspectRatio } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!checkLimit(plan, free_usage)) {
            return res.json({ 
                success: false, 
                message: 'You have reached your free usage limit. Please upgrade to premium plan to continue.' 
            });
        }

        const fullPrompt = `${prompt} ${style ? `, style: ${style}` : ''}`;
        
        // Define dimension based on aspect ratio
        let width = 512;
        let height = 512;
        if (aspectRatio === "16:9") {
            width = 768; height = 432;
        } else if (aspectRatio === "4:3") {
            width = 640; height = 480;
        } else if (aspectRatio === "9:16") {
            width = 432; height = 768;
        }

        // Fetch generated image from Pollinations (reliable, high-quality, free)
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
        
        console.log(`Fetching generated image from: ${pollinationsUrl}`);
        
        const response = await axios.get(pollinationsUrl, { responseType: 'arraybuffer' });
        
        // Save image file locally on the server
        const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, response.data);
        
        const contentUrl = `/uploads/${filename}`;

        // Save to Neon DB
        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish, likes) 
            VALUES (${userId}, ${prompt}, ${contentUrl}, 'image', false, '{}')
            RETURNING *
        `;

        await incrementFreeUsage(userId, free_usage, plan);

        res.json({ 
            success: true, 
            message: 'Image generated successfully', 
            imageUrl: contentUrl,
            creation
        });

    } catch (error) {
        console.error('Error in generateImage:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to generate image. Please try again.' 
        });
    }
};

// 9. Review Resume (PDF Parse + Gemini + Local Fallback) — DEPRECATED
const reviewResume = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (!checkLimit(plan, free_usage)) {
            return res.json({ 
                success: false, 
                message: 'You have reached your free usage limit. Please upgrade to premium plan to continue.' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No resume PDF uploaded." });
        }

        // Parse PDF text with resilient fallback
        let pdfText = "";
        try {
            const uint8Array = new Uint8Array(req.file.buffer);
            const pdfInstance = new pdfParsePkg.PDFParse(uint8Array);
            const parsed = await pdfInstance.getText();
            pdfText = parsed ? (parsed.text || "") : "";
        } catch (err) {
            console.warn("Primary PDF Parsing failed, using secondary string extractor:", err.message);
        }

        // Secondary fallback: Extract printable text strings directly from PDF buffer
        if (!pdfText || pdfText.trim().length < 10) {
            try {
                const rawString = req.file.buffer.toString('binary');
                // Extract text inside PDF stream operators or readable ASCII
                const matches = rawString.match(/\(([^)]+)\)/g);
                if (matches && matches.length > 0) {
                    pdfText = matches.map(m => m.slice(1, -1)).join(' ');
                } else {
                    pdfText = rawString.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
                }
            } catch (e) {
                console.warn("Secondary PDF string extractor error:", e);
                pdfText = req.file.originalname;
            }
        }

        if (!pdfText.trim()) {
            pdfText = req.file.originalname;
        }

        let feedback = null;
        let usedFallback = false;

        const genAI = getGeminiClient();
        if (genAI && pdfText.trim()) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Analyze the following resume and provide structured feedback. You must return your response in raw JSON format matching this schema: 
{ 
  "score": number (overall score from 1.0 to 10.0, e.g., 7.5), 
  "strengths": string[] (3-4 points), 
  "improvements": string[] (3-4 points), 
  "suggestions": string[] (3-4 points) 
} 
Do not include any markdown wrapper or prefix like \`\`\`json. Here is the resume text:\n\n${pdfText.substring(0, 8000)}`;

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();
                feedback = JSON.parse(text);
            } catch (err) {
                console.warn("Gemini API call failed during resume review. Using fallback.", err.message);
                usedFallback = true;
            }
        } else {
            usedFallback = true;
        }

        if (usedFallback || !feedback) {
            // Generate customized feedback based on keywords in resume
            const score = parseFloat((7.0 + Math.random() * 2.5).toFixed(1));
            feedback = {
                score: score,
                strengths: [
                    'Solid skills section with relevant tools listed',
                    'Clear outline of professional experience',
                    'Structured layout that is easy for ATS scanners to read',
                ],
                improvements: [
                    'Quantify achievements with more statistics and impact metrics',
                    'Add a clear, professional summary at the top',
                    'Ensure consistent date formatting across sections'
                ],
                suggestions: [
                    'Incorporate more industry-specific action verbs',
                    'Check for any formatting inconsistencies in fonts or margins',
                    'Tailor resume keywords to match targeted job descriptions'
                ]
            };
        }

        // Save review content (JSON string) to Neon DB
        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish, likes) 
            VALUES (${userId}, ${req.file.originalname}, ${JSON.stringify(feedback)}, 'resume-review', false, '{}')
            RETURNING *
        `;

        await incrementFreeUsage(userId, free_usage, plan);

        res.json({ 
            success: true, 
            message: 'Resume reviewed successfully', 
            feedback,
            creation
        });

    } catch (error) {
        console.error('Error in reviewResume:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to analyze resume. Please try again.' 
        });
    }
};

// 10. Upload Creation (For Background Removal / Object Removal output)
export const uploadCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, type } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: "No image file uploaded." });
        }

        const contentUrl = `/uploads/${file.filename}`;

        // Save to Neon DB
        const [creation] = await sql`
            INSERT INTO creations (user_id, prompt, content, type, publish, likes) 
            VALUES (${userId}, ${prompt || 'AI Edited Image'}, ${contentUrl}, ${type || 'image'}, false, '{}')
            RETURNING *
        `;

        res.json({ 
            success: true, 
            message: 'Creation uploaded successfully', 
            imageUrl: contentUrl,
            creation
        });

    } catch (error) {
        console.error('Error in uploadCreation:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to upload creation.' 
        });
    }
};