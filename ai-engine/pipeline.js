import { parsePDF } from "./parsers/pdfParser.js";
import { addToRAG, retrieveContext } from "./rag/ragService.js";
import { callClaude } from "./llm/claudeService.js";
import { buildPrompt } from "./scoring/scoringService.js";

/**
 *main AI Pipeline
 * @param {Object} formData
 * @param {Object} files { pnl: path, bank: path }
 */
export const runPipeline = async (formData, files = {}) => {
  try {
    console.log("\nStarting AI Credit Pipeline...\n");

    console.log("Parsing PDFs...");

    const pnlText = files.pnl
      ? await parsePDF(files.pnl)
      : "";

    const bankText = files.bank
      ? await parsePDF(files.bank)
      : "";

    const combinedText = `${pnlText}\n${bankText}`;

    if (!combinedText.trim()) {
      console.warn("No document data found.");
    } else {
      console.log("PDF data extracted");
    }
    if (combinedText.trim()) {
      console.log("Indexing data into RAG...");
      addToRAG(combinedText);
    }
    console.log("Retrieving relevant context...");

    const query = `
      ${formData.businessType || ""} 
      loan risk 
      ${formData.loanAmount || ""}
      financial stability creditworthiness
    `;

    const context = retrieveContext(query);

    if (!context) {
      console.warn("No RAG context retrieved");
    } else {
      console.log("Context retrieved from RAG");
    }

    console.log("Building LLM prompt...");

    const prompt = buildPrompt(
      formData,
      combinedText,
      context
    );
    console.log("Calling claude API");
    const result = await callClaude(prompt);

    console.log("AI Decision Generated\n");

    return result;

  } catch (err) {
    console.error("Pipeline Error:", err.message);
    return {
      error: true,
      message: err.message,
    };
  }
};