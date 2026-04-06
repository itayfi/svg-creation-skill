require('dotenv').config();
const { fal } = require('@fal-ai/client');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const axios = require('axios');

async function downloadToTemp(url) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });
    const tempFile = path.join(os.tmpdir(), `fal-layer-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
    await fs.writeFile(tempFile, Buffer.from(response.data));
    return tempFile;
}

async function decomposeLayers(imagePath, numLayers = 4) {
    let imageUrl = imagePath;
    const isUrl = /^https?:\/\//i.test(imagePath);
    const isDataUrl = /^data:/i.test(imagePath);

    if (!isUrl && !isDataUrl) {
        // Read file and convert to base64 for fal.ai if it's a path
        const data = await fs.readFile(imagePath);
        imageUrl = `data:image/png;base64,${data.toString('base64')}`;
    }

    try {
        const result = await fal.subscribe("fal-ai/qwen-image-layered", {
            input: {
                image_url: imageUrl,
                layers: numLayers
            },
        });

        const layerImages = result.data.images || [];
        const layerPaths = [];

        for (const img of layerImages) {
            const p = await downloadToTemp(img.url);
            layerPaths.push(p);
        }

        return layerPaths;
    } catch (err) {
        if (err.message.includes('API key missing')) {
            throw new Error('Fal.ai API key is missing. Set FAL_KEY environment variable.');
        }
        throw err;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node decompose-layers.js <image-path-or-url> [num-layers]');
        process.exit(1);
    }

    const input = args[0];
    const layers = parseInt(args[1]) || 4;

    decomposeLayers(input, layers)
        .then(paths => console.log(JSON.stringify(paths)))
        .catch(err => {
            console.error(err.message);
            process.exit(1);
        });
}

module.exports = { decomposeLayers };
