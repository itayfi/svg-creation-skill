# svg-creation skill

An AI agent skill that generates high-quality, editable SVG illustrations from text prompts.

## What it does

1. **Generates** a raster image using Gemini 3.1 Flash Image Preview (Google AI Studio)
2. **Removes the background** using an AI model (`@imgly/background-removal-node`)
3. **Traces** the result to a clean SVG using `imagetracer-ts`
4. **Verifies** the output visually using the agent's vision capabilities

## Installation

```bash
npx skills add itayfi/svg-creation-skill
```

## Usage

Once installed, trigger the skill by asking your agent:

- "Generate an SVG of a pelican riding a bike"
- "Create a vector illustration of a mountain landscape"
- "Make me an SVG icon of a coffee cup"

## Setup

Set your Google AI Studio API key:

```bash
# In your project .env or shell profile
GOOGLE_API_KEY=your_key_here
```

Get a key at: https://aistudio.google.com/app/apikey

## Scripts

All scripts live in `skills/svg-creation/scripts/` and can also be run directly:

| Script                        | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `generate-raster.js`          | Generate a raster image from a text prompt           |
| `remove-raster-background.js` | Remove background from a raster image                |
| `trace-raster.js`             | Trace a raster image to SVG                          |
| `svg-to-png.js`               | Convert SVG to PNG for preview/verification          |
| `decompose-layers.js`         | Split an image into layers (optional, needs FAL_KEY) |

## License

MIT
