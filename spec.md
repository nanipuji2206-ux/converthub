# ConvertHub

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- PDF to Image converter (JPG/PNG output)
- Image to PDF converter
- Image to Word converter (basic, client-side)
- PDF to Word converter (basic, client-side)
- Word to PDF converter (basic, client-side)
- Image Compressor (quality reduction)
- Image Resizer (width/height input)
- Merge PDFs (combine multiple PDFs)

### Modify
N/A

### Remove
N/A

## Implementation Plan
- All conversion tools are fully client-side using browser APIs and JS libraries (pdf-lib, pdf.js, canvas, etc.)
- No backend storage needed -- files are processed in the browser and downloaded directly
- Frontend-only app with a dark glassmorphism UI
- 8 tool cards on the landing/home page
- Each tool has its own page/section with drag & drop upload, progress feedback, and download button
- Animated gradient background, neon accent colors, smooth transitions

## UX Notes
- Dark glassmorphism design: semi-transparent cards, blurred backgrounds, neon glow effects
- Drag & drop file uploads with visual feedback
- Animated gradients in the background
- Neon accent colors (purple, cyan, pink)
- All processing is client-side -- no file uploads to any server
- Clear "your files never leave your browser" messaging
- Responsive layout for desktop and mobile
