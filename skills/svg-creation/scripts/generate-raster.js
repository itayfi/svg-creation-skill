require('dotenv').config({ override: true });
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

async function main(prompt, apiKey, aspectRatio = "1:1") {
  const mime = (await import('mime')).default;
  const finalKey = apiKey || process.env['GOOGLE_API_KEY'] || process.env['GEMINI_API_KEY'];
  
  if (!finalKey) {
    console.error("DEBUG: No API key found in args or process.env");
  } else {
    console.log(`DEBUG: API key found (length: ${finalKey.length}, starts with: ${finalKey.substring(0, 4)}...)`);
  }

  const ai = new GoogleGenAI({
    apiKey: finalKey,
  });

  const config = {
    imageConfig: {
      aspectRatio: aspectRatio,
      imageSize: "1K",
    },
    responseModalities: [
        'IMAGE',
        'TEXT',
    ],
  };

  const model = 'gemini-3.1-flash-image-preview';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let lastPath = '';
    let fileIndex = 0;

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }

      for (const part of chunk.candidates[0].content.parts) {
        if (part.inlineData) {
          const fileName = `generated-${Date.now()}-${fileIndex++}`;
          const inlineData = part.inlineData;
          const fileExtension = mime.getExtension(inlineData.mimeType || 'image/png');
          const buffer = Buffer.from(inlineData.data || '', 'base64');
          const fullPath = path.join(process.cwd(), `${fileName}.${fileExtension}`);
          
          fs.writeFileSync(fullPath, buffer);
          console.log(`File ${fullPath} saved.`);
          lastPath = fullPath;
        } else if (part.text) {
          console.log("Model response text:", part.text);
        }
      }
    }
    
    if (lastPath) {
      console.log(JSON.stringify({ path: lastPath }));
    } else {
      console.error("No image was generated in the response.");
    }
  } catch (err) {
    console.error("Error during generation:", err.message);
    if (err.response) {
      console.error("Response data:", JSON.stringify(err.response.data));
    }
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node generate-raster.js <prompt> [aspect-ratio] [api-key]');
        process.exit(1);
    }

    const prompt = args[0];
    let aspectRatio = "1:1";
    let apiKey = null;

    if (args[1]) {
      // Very naive check: aspect ratio usually has ':' or is short
      if (args[1].includes(':') || args[1].length < 10) {
        aspectRatio = args[1];
        apiKey = args[2];
      } else {
        apiKey = args[1];
        aspectRatio = args[2] || "1:1";
      }
    }

    main(prompt, apiKey, aspectRatio);
}

module.exports = { main };
