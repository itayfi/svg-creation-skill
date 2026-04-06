---
name: svg-creation
description: Generate high-quality, editable SVG illustrations from text prompts. Uses Gemini 3.1 Flash Image Preview to generate rasters, removes backgrounds with AI, and traces to clean vector SVGs. Triggers on requests like "create an SVG of X", "generate a vector illustration of X", "make me an SVG icon of X".
---

# SVG Creation Skill

This skill generates high-quality, editable SVG images from a text prompt using a multi-step pipeline:
1. Generate a raster image (Gemini 3.1 Flash Image Preview)
2. Remove the background (AI-powered)
3. Trace to a clean SVG
4. Verify visually via PNG preview

## Target Audience: Designers
Written for creative professionals. If tools aren't configured, explain setup clearly.

---

## 🛠️ Setup

### Required: Google AI Studio API Key
Used to generate raster images with `gemini-3.1-flash-image-preview`.
- **Get Key**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Setup**: Add `GOOGLE_API_KEY=your_key` to your project `.env` file

### Optional: Fal.ai API Key
Only needed for layer decomposition on complex images.
- **Get Key**: [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
- **Setup**: Add `FAL_KEY=your_key` to your project `.env` file

---

## 🎨 Workflow

### Step 1: Generate Raster
Generate a high-quality raster image from the user's description:
```bash
node skills/svg-creation/scripts/generate-raster.js "<prompt>" [aspect-ratio]
```
- Aspect ratio options: `1:1` (default), `16:9`, `9:16`, `4:3`, `3:4`
- **Prompt tips**: Aim for flat illustration style, solid colors, simple shapes. Example: `"A clean flat vector illustration of a pelican riding a bicycle, solid colors, white background, minimalist"`

### Step 2: Remove Background
Remove the white/solid background from the raster:
```bash
node skills/svg-creation/scripts/remove-raster-background.js <input.jpg> <output.png>
```
- Output must be `.png` to preserve transparency
- First run downloads the AI model (~50MB, cached after that)

### Step 3: Trace to SVG
Convert the background-free PNG to a vector SVG:
```bash
node skills/svg-creation/scripts/trace-raster.js <input.png> <preset> <output.svg>
```
- **Presets**: `default`, `sharp`, `curvy`, `detailed`, `posterized1`, `grayscale`
- Recommended: `sharp` for illustrations with clean edges

### Step 4: Verify with Vision
Convert SVG to PNG and visually inspect with your multimodal capabilities:
```bash
node skills/svg-creation/scripts/svg-to-png.js <input.svg> <output.png>
```
Then use `view_file` on the PNG to check for quality issues. Iterate and refine if needed.

### Step 5 (Optional): Layer Decomposition
For complex multi-element images, split into layers first:
```bash
node skills/svg-creation/scripts/decompose-layers.js <input.jpg> [num_layers]
```
Then trace each layer individually and composite in SVG.

---

## 💡 Best Practices
- **Add text as SVG elements**: Never include text in the prompt — add editable `<text>` elements directly to the SVG after tracing.
- **Add gradients in SVG**: Traced SVGs use flat color fills; add `<linearGradient>` or `<radialGradient>` manually for richer results.
- **Group elements**: Use `<g id="group-name">` to group related paths for easy editing in Illustrator or Figma.
- **Solid colors trace best**: If the raster has gradients, colors will be approximated. Prompt for flat/solid fills.
