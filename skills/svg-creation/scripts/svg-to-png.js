const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs').promises;
const path = require('path');

async function convert(svgContent, outputPath, options = {}) {
    const resvg = new Resvg(svgContent, {
        fitTo: {
            mode: 'width',
            value: 800,
        },
        ...options
    });

    const pngBuffer = resvg.render().asPng();
    await fs.writeFile(outputPath, pngBuffer);
    return outputPath;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node svg-to-png.js <svg-path-or-file> <output-png-path>');
        process.exit(1);
    }

    const input = args[0];
    const output = args[1];

    (async () => {
        let content = input;
        if (input.endsWith('.svg') || (await fs.stat(input).catch(() => null))?.isFile()) {
            content = await fs.readFile(input, 'utf8');
        }
        await convert(content, output);
        console.log(`Saved PNG to ${output}`);
    })().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { convert };
