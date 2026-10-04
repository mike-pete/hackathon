import mammoth from "mammoth";
import { extractText } from "unpdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function extOf(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop()! : "";
}

/**
 * Parses an uploaded resume into plain text.
 * PDF via unpdf, DOCX via mammoth, everything else as UTF-8 text.
 * The client then runs the same bullet parser used for pasted text.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: `File is ${(file.size / 1e6).toFixed(1)} MB, over the 8 MB limit` },
      { status: 413 },
    );
  }

  const name = file.name || "resume";
  const ext = extOf(name);
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    if (ext === "pdf" || file.type === "application/pdf") {
      const { text, totalPages } = await extractText(new Uint8Array(buf), {
        mergePages: true,
      });
      return Response.json({
        text,
        filename: name,
        kind: "pdf",
        pages: totalPages,
      });
    }

    if (ext === "docx" || file.type.includes("wordprocessingml")) {
      const { value } = await mammoth.extractRawText({ buffer: buf });
      return Response.json({ text: value, filename: name, kind: "docx" });
    }

    if (
      ["txt", "md", "markdown", "rtf", "text"].includes(ext) ||
      file.type.startsWith("text/")
    ) {
      return Response.json({
        text: buf.toString("utf-8"),
        filename: name,
        kind: "text",
      });
    }

    // Last resort: try to read it as text.
    const asText = buf.toString("utf-8");
    if (asText.trim().length > 0) {
      return Response.json({ text: asText, filename: name, kind: "text" });
    }
    return Response.json(
      { error: `Unsupported file type: ${ext || file.type || "unknown"}` },
      { status: 415 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `Could not read ${name}: ${message}` },
      { status: 422 },
    );
  }
}
