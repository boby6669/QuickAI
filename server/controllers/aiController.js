// import OpenAI from "openai";
// import sql from "../config/db.js";
// import { clerkClient } from "@clerk/express";

// const AI = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });

// export const generateArticle = async (req, res) => {
//     try {
//         const { UserId } = req.UserId;
//         const { prompt, length } = req.body;
//         const plan = req.plan;
//         const free_usage = req.free_usage;

//         if (plan !== 'premium' && free_usage >= 10) {
//             return res.json({
//                 success: false,
//                 message: "Limit reached. Upgrade to continue."
//             })
//         }

//         const response = await AI.chat.completions.create({
//             model: "gemini-2.0-flash",
//             messages: [{
//                 role: "user",
//                 content: prompt,
//             },
//             ],
//             temperature: 0.7,
//             max_tokens: length,
//         });

//         const content = response.choices[0].message.content

//         await sql`INSERT INTO creations (user_id, prompt, content, type)
//                   VALUES (${UserId}, ${prompt}, ${content}, 'article')`;


//         if (plan !== 'premium') {
//             await clerkClient.users.updateUserMetadata(UserId, {
//                 privateMetadata: {
//                     free_usage: free_usage + 1
//                 }
//             })
//         }

//         res.json({
//             success: true,
//             content
//         })


//     } catch (error) {
//         console.log(error.message)
//         res.json({
//             success: false,
//             message: error.message
//         })
//     }
// }



import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import FormData from 'form-data';

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export const generateArticle = async (req, res) => {
    try {
        const userId = req.userId; // middleware से लिया
        if(!userId){
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 100) {
            return res.json({
                success: false,
                message: "Limit reached. Upgrade to continue."
            });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: parseInt(length) || 500,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const generateBlogTitle = async (req, res) => {
    try {
        const userId = req.userId; // middleware से लिया
        if(!userId){
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { prompt, length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 100) {
            return res.json({
                success: false,
                message: "Limit reached. Upgrade to continue."
            });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: parseInt(length) || 500,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const generateImage = async (req, res) => {
    try {
        const userId = req.userId; // middleware से लिया
        if(!userId){
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { prompt, publish } = req.body;
        const plan = req.plan;

        // if (plan !== 'premium') {
        //     return res.json({
        //         success: false,
        //         message: "This feature is only available for premium subscription"
        //     });
        // }

       const formData = new FormData()
       formData.append('prompt', prompt)
       const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", 
        formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            responseType: "arraybuffer",
       })

       const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`; 

       const {secure_url} = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
                  VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${ publish ?? false })`;

        
        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}



export const removeImageBackground = async (req, res) => {
    try {
        const userId = req.userId; // middleware से लिया
        if(!userId){
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const Image = req.file;
        const plan = req.plan;

        // if (plan !== 'premium') {
        //     return res.json({success: false, mess age: "This feature is only available for premium subscription"});
        // }

       

       const {secure_url} = await cloudinary.uploader.upload(Image.path, {
        transformation: [
            {
                effect: 'background_removal',
                background_removal: 'remove_the_background'
            }
        ]
       })

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish)
                  VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image', false )`;

        
        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}



export const removeImageObject = async (req, res) => {
    try {
        const userId = req.userId; // middleware से लिया
        
        const { object } = req.body;

        const Image = req.file;
        const plan = req.plan;

        // if (plan !== 'premium') {
        //     return res.json({success: false, message: "This feature is only available for premium subscription"});
        // }

       

       const {public_id} = await cloudinary.uploader.upload(Image.path)

       const imageUrl = cloudinary.url(public_id, {
        transformation: [{effect: `gen_remove:${object}`}],
        response_type: 'image'
       }) 

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

        
        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}



export const resumeReview = async (req, res) => {
    try {
        const userId = req.userId; // middleware से लिया

        const { length } = req.body;
        const resume = req.file;
        const plan = req.plan;

        // if (plan !== 'premium') {
        //     return res.json({success: false, mess age: "This feature is only available for premium subscription"});
        // }

        if(resume.size > 5 * 1024 * 1024){
            return res.json({success: false, message: "Resume file size exceeds allowed size (5MB)." })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        const prompt =`Review the following resume and provide constructive feedback on its strengths, weaknesses, and area for improvement. 
        Resume Content:\n\n${pdfData.text}`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: parseInt(length) || 1000,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

        
        res.json({ success: true, content});

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const downloadCreation = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { id } = req.params;

        // Get the creation from database
        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}`;

        if (!creation) {
            return res.status(404).json({ success: false, message: "Creation not found" });
        }

        const { type, content, prompt, created_at } = creation;
        
        // Generate filename based on type and timestamp
        const timestamp = new Date(created_at).toISOString().slice(0, 19).replace(/:/g, '-');
        let filename;
        let mimeType;
        let fileContent;

        switch (type) {
            case 'article':
            case 'blog-title':
                // For articles and blog titles, create markdown files
                filename = `${type}-${timestamp}.md`;
                mimeType = 'text/markdown';
                fileContent = `# ${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}\n\n`;
                if (prompt) {
                    fileContent += `**Prompt:** ${prompt}\n\n---\n\n`;
                }
                fileContent += content;
                break;

            case 'resume-review':
                // For resume reviews, create PDF would be ideal, but for now use formatted text
                filename = `resume-review-${timestamp}.txt`;
                mimeType = 'text/plain';
                fileContent = `RESUME REVIEW REPORT\n`;
                fileContent += `Generated on: ${new Date(created_at).toLocaleDateString()}\n`;
                fileContent += `${'='.repeat(50)}\n\n`;
                if (prompt) {
                    fileContent += `Original Request: ${prompt}\n\n`;
                }
                fileContent += `REVIEW CONTENT:\n\n${content}`;
                break;

            case 'image':
                // For images, fetch the actual image file
                try {
                    console.log('Downloading image from:', content);
                    console.log('Image URL type:', typeof content);
                    
                    const imageResponse = await axios.get(content, { 
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    console.log('Image response headers:', imageResponse.headers);
                    console.log('Image response data length:', imageResponse.data.length);
                    
                    // Better image format detection
                    let imageExtension = 'jpg'; // default for Cloudinary
                    let mimeTypeImage = 'image/jpeg';
                    
                    // Check response headers for content type first (more reliable)
                    const responseContentType = imageResponse.headers['content-type'];
                    console.log('Response Content-Type:', responseContentType);
                    
                    if (responseContentType) {
                        if (responseContentType.includes('png')) {
                            imageExtension = 'png';
                            mimeTypeImage = 'image/png';
                        } else if (responseContentType.includes('jpeg') || responseContentType.includes('jpg')) {
                            imageExtension = 'jpg';
                            mimeTypeImage = 'image/jpeg';
                        } else if (responseContentType.includes('gif')) {
                            imageExtension = 'gif';
                            mimeTypeImage = 'image/gif';
                        } else if (responseContentType.includes('webp')) {
                            imageExtension = 'webp';
                            mimeTypeImage = 'image/webp';
                        }
                    } else {
                        // Fallback to URL checking
                        if (content.includes('.png')) {
                            imageExtension = 'png';
                            mimeTypeImage = 'image/png';
                        } else if (content.includes('.gif')) {
                            imageExtension = 'gif';
                            mimeTypeImage = 'image/gif';
                        } else if (content.includes('.webp')) {
                            imageExtension = 'webp';
                            mimeTypeImage = 'image/webp';
                        }
                        // Default remains jpg for Cloudinary
                    }
                    
                    filename = `generated-image-${timestamp}.${imageExtension}`;
                    
                    console.log('Final filename:', filename);
                    console.log('Final mime type:', mimeTypeImage);
                    
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                    res.setHeader('Content-Type', mimeTypeImage);
                    res.setHeader('Content-Length', imageResponse.data.length);
                    
                    // Ensure we're sending the binary data correctly
                    const buffer = Buffer.isBuffer(imageResponse.data) ? 
                                   imageResponse.data : 
                                   Buffer.from(imageResponse.data);
                    
                    console.log('Sending buffer of length:', buffer.length);
                    return res.send(buffer);
                } catch (error) {
                    console.error('Image download error:', error);
                    return res.status(400).json({ 
                        success: false, 
                        message: "Failed to download image: " + error.message 
                    });
                }

            default:
                filename = `creation-${timestamp}.txt`;
                mimeType = 'text/plain';
                fileContent = content;
        }

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', mimeType);
        
        // Send the file content
        res.send(fileContent);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
