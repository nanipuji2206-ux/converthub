// File conversion utilities - all client-side

export async function pdfToImages(
  file: File,
  format: "jpg" | "png",
  onProgress?: (page: number, total: number) => void
): Promise<{ dataUrl: string; name: string }[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const results: { dataUrl: string; name: string }[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const dataUrl = canvas.toDataURL(mimeType, 0.92);
    results.push({
      dataUrl,
      name: `${file.name.replace(".pdf", "")}_page_${i}.${format}`,
    });

    onProgress?.(i, numPages);
  }

  return results;
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let image: Awaited<ReturnType<typeof pdfDoc.embedJpg>>;
    const type = file.type;

    if (type === "image/jpeg" || type === "image/jpg") {
      image = await pdfDoc.embedJpg(bytes);
    } else if (type === "image/png") {
      image = await pdfDoc.embedPng(bytes);
    } else {
      // Convert to PNG via canvas first
      const blob = await convertImageToFormat(file, "image/png");
      const buf = await blob.arrayBuffer();
      image = await pdfDoc.embedPng(new Uint8Array(buf));
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return pdfDoc.save();
}

export async function imageToDocx(file: File): Promise<Blob> {
  const { Document, Packer, Paragraph, ImageRun } = await import("docx");

  const arrayBuffer = await file.arrayBuffer();

  // Get image dimensions via canvas
  const dims = await getImageDimensions(file);
  const maxWidth = 600;
  const scale = Math.min(1, maxWidth / dims.width);
  const width = Math.round(dims.width * scale);
  const height = Math.round(dims.height * scale);

  const imageType = file.type === "image/png" ? "png" as const : "jpg" as const;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: arrayBuffer,
                transformation: { width, height },
                type: imageType,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function pdfToDocx(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<Blob> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const paragraphs: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      text: file.name.replace(".pdf", ""),
      heading: HeadingLevel.HEADING_1,
    }),
  ];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group items into lines
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    let currentY: number | null = null;
    let lineText = "";

    for (const item of items) {
      const y = Math.round(item.transform[5]);
      if (currentY === null) {
        currentY = y;
        lineText = item.str;
      } else if (Math.abs(y - currentY) < 5) {
        lineText += item.str;
      } else {
        if (lineText.trim()) {
          paragraphs.push(new Paragraph({ children: [new TextRun(lineText.trim())] }));
        }
        currentY = y;
        lineText = item.str;
      }
    }
    if (lineText.trim()) {
      paragraphs.push(new Paragraph({ children: [new TextRun(lineText.trim())] }));
    }

    // Page break between pages
    if (i < numPages) {
      paragraphs.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }

    onProgress?.(i, numPages);
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  return Packer.toBlob(doc);
}

export async function docxToPdf(file: File): Promise<Uint8Array> {
  const mammoth = await import("mammoth");
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = fontSize * 1.4;
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 60;
  const contentWidth = pageWidth - margin * 2;

  const lines = text.split("\n");
  const wrappedLines: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      wrappedLines.push("");
      continue;
    }
    const words = line.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > contentWidth && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);
  }

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  for (const line of wrappedLines) {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    if (line) {
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    }
    y -= lineHeight;
  }

  return pdfDoc.save();
}

export async function compressImage(
  file: File,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression failed"));
        },
        "image/jpeg",
        quality / 100
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Resize failed"));
        },
        mimeType,
        0.92
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    for (const page of pages) {
      mergedPdf.addPage(page);
    }
  }

  return mergedPdf.save();
}

// Helpers
async function convertImageToFormat(file: File, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Conversion failed"));
      }, mimeType);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error("Failed to get dimensions"));
    img.src = url;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
