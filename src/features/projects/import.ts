import { IMPORT_BYTE_LIMIT, PROJECT_TEXT_LIMIT, newBlock, newProject, type Project } from "./model";
export function validateImport(file: Pick<File, "name" | "size">) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["txt", "docx", "pdf"].includes(extension ?? "")) throw new Error("Choose a TXT, DOCX, or PDF file with selectable text.");
  if (file.size > IMPORT_BYTE_LIMIT) throw new Error("This document exceeds 20 MB. Split it into smaller files before importing.");
  if (!file.size) throw new Error("This file is empty. Choose a document containing text.");
  return extension;
}
export function validateExtractedText(text: string) {
  if (!text.trim()) throw new Error("No readable text was found. Scanned PDFs need OCR in another tool before importing.");
  if (text.length > PROJECT_TEXT_LIMIT) throw new Error("This document exceeds 100,000 characters. Split it into smaller documents; no text has been imported.");
  return text;
}
export async function extractDocument(file: File): Promise<string> {
  const extension = validateImport(file);
  const buffer = await file.arrayBuffer();
  if (extension === "txt") return validateExtractedText(new TextDecoder("utf-8").decode(buffer).replace(/\r\n?/g, "\n"));
  if (extension === "docx") {
    try {
      const mammoth = await import("mammoth/mammoth.browser");
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return validateExtractedText(result.value);
    } catch (error) {
      if (error instanceof Error && /100,000|No readable/.test(error.message)) throw error;
      throw new Error("This DOCX could not be read. Open it in your document editor and save a new DOCX or TXT copy.");
    }
  }
  const pdf = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdf.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
  const task = pdf.getDocument({ data: buffer, useSystemFonts: true });
  try {
    const document = await task.promise;
    return await readPdfText(document);
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") throw new Error("This PDF is password protected. Export an unlocked copy before importing.");
    if (error instanceof Error && /100,000|selectable text|No readable/.test(error.message)) throw error;
    throw new Error("This PDF could not be read. Export a new PDF with selectable text, or use TXT or DOCX.");
  } finally { await task.destroy(); }
}
// Explicit heading syntax makes chapter boundaries reviewable before any project is saved.
export function projectFromText(owner: string, title: string, source: string): Project {
  validateExtractedText(source);
  const project = newProject(owner, title.trim() || "Imported document");
  const sections: { title: string; lines: string[] }[] = [];
  let section = { title: "Chapter 1", lines: [] as string[] };
  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^#\s+\S/.test(line)) {
      if (section.lines.some(value => value.trim())) sections.push(section);
      section = { title: line.replace(/^#\s+/, "").trim(), lines: [] };
    } else section.lines.push(line);
  }
  if (section.lines.some(value => value.trim())) sections.push(section);
  if (!sections.length) throw new Error("Add some script text below your chapter headings.");
  project.chapters = sections.map(section => ({ id: crypto.randomUUID(), title: section.title, blocks: section.lines.join("\n").trim().split(/\n\s*\n/).filter(text => text.trim()).map(text => newBlock(project.speakers[0], text)) }));
  return project;
}

export async function readPdfText(document: {
  numPages: number;
  getPage: (number: number) => Promise<{ getTextContent: () => Promise<{ items: ({ str: string; hasEOL?: boolean } | object)[] }>; cleanup: () => unknown }>;
}): Promise<string> {
  let text = "";
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join("").trim();
    page.cleanup();
    if (!pageText) throw new Error(`Page ${pageNumber} has no selectable text. Use OCR in another tool or remove image-only pages, then retry.`);
    text += (text ? "\n\n" : "") + pageText;
    if (text.length > PROJECT_TEXT_LIMIT) throw new Error("This document exceeds 100,000 characters. Split it into smaller documents; no text has been imported.");
  }
  return validateExtractedText(text);
}
