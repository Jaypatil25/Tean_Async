import { parsePDF } from "./parsers/pdfParser.js";
import { retrieveContext } from "./rag/ragService.js";
import { callClaude } from "./llm/claudeService.js";
import { buildPrompt } from "./scoring/scoringService.js";

export const runPipeline = async (formData, files = {}) => {
  try {
    const pnlText = files.pnl ? await parsePDF(files.pnl) : "";
    const bankText = files.bank ? await parsePDF(files.bank) : "";

    const context = retrieveContext(
  `${formData.businessType} loan risk ${formData.loanAmount}`
);

    const prompt = buildPrompt(
      formData,
      pnlText + "\n" + bankText,
      context
    );

    const result = await callClaude(prompt);

    return result;
  } catch (err) {
    console.error("Pipeline Error:", err);
    return null;
  }
};