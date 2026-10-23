/**
 * Text-formatting utility to strip hardcoded numbers, labels, or colons
 * from the beginning of aptitude question text strings (e.g., "11. ", "2: ", "1. Question: ").
 */
export function cleanQuestionText(rawText: string): string {
  if (!rawText) return "";
  let text = rawText.trim();
  let prev = "";

  // Strip leading hardcoded index prefixes iteratively until clean
  while (text !== prev) {
    prev = text;
    // 1. Strip patterns like "Question 1:", "Q1.", "Q.1:"
    text = text.replace(/^(?:question|q)\s*\.?\s*\d+\s*[\.\:\-\)]*\s*/i, "");
    // 2. Strip patterns like "11. Question: ", "11. ", "2: ", "1) ", "1 - ", "1. Question - "
    text = text.replace(/^\(?\d+\)?\s*[\.\:\-\)]+\s*(?:question\s*[\:\.\-]?\s*)?/i, "");
    // 3. Strip standalone leftover leading punctuation
    text = text.replace(/^[\:\-\.]\s*/, "").trim();
  }

  return text;
}
