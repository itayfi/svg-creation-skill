const { removeBackground } = require("@imgly/background-removal-node");
const fs = require('fs');

async function processImage(inputPath, outputPath) {
    console.log(`Removing background from ${inputPath}...`);
    try {
        const config = {
            model: 'medium',
            progress: (key, current, total) => {
                // Throttle progress logs
                if (current === total || current % 10000 === 0) {
                    console.log(`Model progress [${key}]: ${Math.round(current/total * 100)}%`);
                }
            }
        };

        const blob = await removeBackground(inputPath, config);
        const buffer = Buffer.from(await blob.arrayBuffer());
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`Saved background-removed image to ${outputPath}`);
    } catch (err) {
        console.error("Error during background removal:", err);
        throw err;
    }
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: node remove-raster-background.js <input-raster> <output-raster>");
    process.exit(1);
}

processImage(args[0], args[1]).catch(err => {
    process.exit(1);
});
