import { runPipeline } from "./pipeline.js";

const test = async () => {
  const formData = {
    companyName: "ABC Pvt Ltd",
    loanAmount: "5000000",
    businessType: "Manufacturing",
    yearsInBusiness: 5,
    existingLoans: "1000000 EMI ongoing",
    collateral: "Property worth 1Cr",
    purpose: "Working capital",
  };

  const result = await runPipeline(formData, {
  });

  console.log("\nFINAL RESULT:\n");
  console.log(result);
};

test();