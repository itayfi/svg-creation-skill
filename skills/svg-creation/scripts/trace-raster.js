require('dotenv').config();
const { ImageTracerNodejs } = require('@image-tracer-ts/nodejs');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const axios = require('axios');

async function downloadImage(url) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });
    const tempFile = path.join(os.tmpdir(), `trace-input-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.writeFile(tempFile, response.data);
    return tempFile;
}

async function trace(inputPath, options = {}) {
    let fileInput = inputPath;
    const isUrl = /^https?:\/\//i.test(inputPath);
    const isDataUrl = /^data:/i.test(inputPath);

    if (isUrl) {
        fileInput = await downloadImage(inputPath);
    } else if (isDataUrl) {
        const base64Data = inputPath.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        fileInput = path.join(os.tmpdir(), `trace-input-dataurl-${Date.now()}`);
        await fs.writeFile(fileInput, buffer);
    }

    const outFile = path.join(os.tmpdir(), `trace-output-${Date.now()}.svg`);

    // Using basic options or user-provided preset
    await ImageTracerNodejs.fromFileName(fileInput, {
        ...options,
        out: outFile
    });

    const svg = await fs.readFile(outFile, 'utf8');
    
    // Cleanup
    await fs.unlink(outFile).catch(() => {});
    if (isUrl || isDataUrl) {
        await fs.unlink(fileInput).catch(() => {});
    }

    return svg;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: node trace-raster.js <image-path-or-url> [options-json]');
        process.exit(1);
    }

    const input = args[0];
    let options = {};
    if (args[1]) {
        if (args[1].startsWith('{')) {
            options = JSON.parse(args[1]);
        } else {
            options = { preset: args[1] };
        }
    } else {
        options = { preset: 'default' };
    }

    trace(input, options)
        .then(async svg => {
            if (args[2]) {
                await fs.writeFile(args[2], svg);
                console.log(`SVG saved to ${args[2]}`);
            } else {
                console.log(svg);
            }
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { trace };
