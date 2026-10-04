/**
 * Best-effort extraction of a name and contact line from the raw Big CV text.
 * Keeps the PDF header populated without asking the user for extra fields.
 */
export type ResumeProfile = {
  name: string;
  contacts: string[];
};

export function extractProfile(rawCV: string): ResumeProfile {
  const lines = rawCV
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const head = lines[0] ?? "";
  const name =
    head
      .split(/\s+[—–|·:]\s+/)[0]
      .replace(/[|,].*$/, "")
      .trim() || "Your Name";

  const email = rawCV.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const phone = rawCV.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim();
  const linkedin = rawCV.match(/linkedin\.com\/[^\s|,)]+/i)?.[0];
  const site = rawCV.match(/https?:\/\/(?!.*linkedin)[^\s|,)]+/i)?.[0];
  const location = rawCV.match(
    /([A-Z][a-z]+(?: [A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s+\d{5})?)/,
  )?.[1];

  const contacts = [location, phone, email, linkedin, site].filter(
    (v): v is string => Boolean(v),
  );

  return { name, contacts };
}
