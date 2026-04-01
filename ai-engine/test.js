import { runPipeline } from "./pipeline.js";

const test = async () => {
  const mockFormData = {
    companyName: "ABC Pvt Ltd",
    loanAmount: "50,00,000",
    businessType: "Manufacturing",
    yearsInBusiness: 5,
    existingLoans: "10,00,000 EMI ongoing",
    collateral: "Property worth 1Cr",
    purpose: "Working capital",
  };

  const result = await runPipeline(mockFormData, {
    // optional: add real pdf paths here
    // pnl: "./sample/pnl.pdf",
    // bank: "./sample/bank.pdf",
  });

  console.log("\n🔥 AI DECISION RESULT:\n");
  console.log(result);
};

test();