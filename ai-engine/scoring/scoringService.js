export const buildPrompt = (formData, extractedText, context) => {
  return `
You are a senior credit risk officer.

FORM DATA:
${JSON.stringify(formData, null, 2)}

DOCUMENT DATA:
${extractedText}

INDUSTRY CONTEXT:
${context}

Tasks:
- Give risk score (0-100)
- Detect red flags
- Check inconsistencies
- Final decision: APPROVE / REJECT / REVIEW

Return STRICT JSON:
{
  "score": number,
  "decision": "",
  "reasons": [],
  "red_flags": []
}
`;
};