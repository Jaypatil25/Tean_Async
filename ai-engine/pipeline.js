import { addToRAG, retrieveContext } from "./rag/ragService.js";

import { buildPrompt } from "./scoring/scoringService.js";
import { callClaude } from "./llm/claudeService.js";
import contradictionDetector from "./analysis/contradictionDetector.js";
import ownershipGraph from "./analysis/ownershipGraph.js";
import { parsePDF } from "./parsers/pdfParser.js";

export const runPipeline = async (formData, files = {}, companyData = {}) => {
  try {
    console.log("\nStarting AI Credit Pipeline with Extended Analysis...\n");

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

    console.log("Analyzing financial data for contradictions...");
    
    const contradictionAnalysis = contradictionDetector.analyzeText(
      combinedText,
      formData.companyId || formData.pan
    );
    
    console.log(`Found ${contradictionAnalysis.summary.total} contradictions`);
    const contradictionRiskScore = contradictionDetector.generateRiskScore(contradictionAnalysis);
    console.log(`Contradiction Risk Score: ${contradictionRiskScore}/100`);

    console.log("Building company ownership graph...");
    
    let ownershipAnalysis = null;
    if (companyData.companyId || formData.pan) {
      const companyId = companyData.companyId || formData.pan;
      
      if (companyData) {
        ownershipGraph.addNode(companyId, {
          name: formData.companyName || companyData.name || '',
          pan: formData.pan || companyData.pan || '',
          cin: companyData.cin || '',
          registrationDate: companyData.registrationDate,
          directors: companyData.directors || [],
          nominees: companyData.nominees || [],
          shareholding: companyData.shareholding || {},
          turnover: parseFloat(formData.annualTurnover) || companyData.turnover || 0,
          employeeCount: companyData.employeeCount || 0,
          businessActivity: formData.businessType || companyData.businessActivity || ''
        });

        if (companyData.owners && Array.isArray(companyData.owners)) {
          companyData.owners.forEach(owner => {
            ownershipGraph.addOwnershipEdge(owner.id, companyId, {
              stake: owner.stake || 0,
              type: 'OWNERSHIP',
              role: owner.role
            });
          });
        }

        if (companyData.subsidiaries && Array.isArray(companyData.subsidiaries)) {
          companyData.subsidiaries.forEach(subsidiary => {
            ownershipGraph.addOwnershipEdge(companyId, subsidiary.id, {
              stake: subsidiary.stake || 0,
              type: 'OWNERSHIP'
            });
          });
        }
      }

      ownershipAnalysis = ownershipGraph.generateGraphReport(companyId);
      console.log("Company ownership graph analysis complete");
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

    console.log("Building enhanced LLM prompt with contradiction analysis...");

    const enhancedPrompt = buildPromptWithAnalysis(
      formData,
      combinedText,
      context,
      contradictionAnalysis,
      ownershipAnalysis
    );

    console.log("Calling Claude API for credit decision...");
    const llmResult = await callClaude(enhancedPrompt);

    console.log("AI Decision Generated\n");

    const finalResult = {
      decision: llmResult,
      analysis: {
        contradictions: contradictionAnalysis,
        ownership: ownershipAnalysis,
        risks: {
          contradictionScore: contradictionRiskScore,
          shellCompanyRisk: ownershipAnalysis?.risks?.shellCompanyAnalysis?.shellCompanyProbability || null
        }
      },
      metadata: {
        pipelineVersion: "2.0",
        timestamp: new Date().toISOString(),
        companyId: formData.companyId || formData.pan,
        filesProcessed: {
          pnl: !!files.pnl,
          bank: !!files.bank
        }
      }
    };

    return finalResult;

  } catch (err) {
    console.error("Pipeline Error:", err.message);
    return {
      error: true,
      message: err.message,
    };
  }
};


function buildPromptWithAnalysis(formData, extractedText, context, contradictionAnalysis, ownershipAnalysis) {
  let analysisSection = '';

  if (contradictionAnalysis && contradictionAnalysis.summary.total > 0) {
    analysisSection += `\nFINANCIAL CONTRADICTIONS DETECTED (${contradictionAnalysis.summary.total} total):\n`;
    analysisSection += `- Critical: ${contradictionAnalysis.summary.critical}\n`;
    analysisSection += `- High: ${contradictionAnalysis.summary.high}\n`;
    analysisSection += `- Medium: ${contradictionAnalysis.summary.medium}\n`;
    analysisSection += `- Risk Score: ${contradictionAnalysis.summary.total > 0 ? 'HIGH' : 'LOW'}\n\n`;
    
    contradictionAnalysis.contradictions.slice(0, 5).forEach(c => {
      analysisSection += `• [${c.severity}] ${c.message}\n`;
    });
  }

  if (ownershipAnalysis) {
    const shellRisk = ownershipAnalysis.risks.shellCompanyAnalysis;
    analysisSection += `\n\nCOMPANY OWNERSHIP ANALYSIS:\n`;
    analysisSection += `- Shell Company Probability: ${shellRisk.shellCompanyProbability}%\n`;
    analysisSection += `- Risk Level: ${shellRisk.riskLevel}\n`;
    analysisSection += `- Critical Indicators: ${shellRisk.summary.critical}\n`;
    analysisSection += `- Director Count: ${shellRisk.analysis.directorCount}\n`;
    analysisSection += `- Business Turnover: ₹${(shellRisk.analysis.turnover / 10000000).toFixed(2)}Cr\n`;
  }

  const enhancedPrompt = `
You are a senior credit risk officer with expertise in financial analysis and fraud detection.

FORM DATA:
${JSON.stringify(formData, null, 2)}

DOCUMENT DATA:
${extractedText}

INDUSTRY CONTEXT:
${context}

${analysisSection}

RED FLAG ANALYSIS:
Please consider the following in your analysis:
1. Financial Contradictions: Review the contradictions detected above
2. Company Shell Risk: Evaluate the shell company indicators
3. Ownership Transparency: Assess ownership structure complexity
4. Business Legitimacy: Cross-reference with extracted metrics

Tasks:
- Give risk score (0-100) incorporating contradiction and ownership risks
- Detect red flags (including contradictions and shell indicators)
- Check consistency in company information and ownership
- Final decision: APPROVE / REJECT / REVIEW
- Provide specific recommendations

Return STRICT JSON:
{
  "score": number,
  "decision": "",
  "reasons": [],
  "red_flags": [],
  "contradiction_analysis_incorporated": boolean,
  "ownership_analysis_incorporated": boolean,
  "recommendations": []
}
`;

  return enhancedPrompt;
}