import crypto from 'crypto';

class ContradictionDetector {
  constructor() {
    this.extractedMetrics = new Map();
    this.contradictions = [];
    this.analysisCache = new Map();
    this.thresholds = {
      percentageDeviation: 5,      
      absoluteDeviation: 100000,   
      reliabilityScore: 0.7        
    };
  }


  extractMetrics(text) {
    const metrics = {
      revenue: [],
      expenses: [],
      netProfit: [],
      totalAssets: [],
      totalLiabilities: [],
      cashFlow: [],
      taxPaid: [],
      inventory: [],
      receivables: [],
      payables: []
    };

    const patterns = {
      revenue: [
        /(?:total\s+)?(?:revenue|sales|income|turnover|receipts?)[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh|m|million)?/gi,
        /(?:revenue|sales)[\s:]*₹?\s*([\d,\.]+)/gi
      ],
      expenses: [
        /(?:total\s+)?(?:expenses?|costs?|operating\s+expenses?)[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh)?/gi,
        /(?:cost\s+of\s+goods?\s+sold|cogs)[\s:]*₹?\s*([\d,\.]+)/gi
      ],
      netProfit: [
        /(?:net\s+)?(?:profit|income|earnings)[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh)?/gi,
        /(?:pbt|pat|ebitda)[\s:]*₹?\s*([\d,\.]+)/gi
      ],
      totalAssets: [
        /(?:total\s+)?assets?[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh)?/gi
      ],
      totalLiabilities: [
        /(?:total\s+)?liabilities?[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh)?/gi
      ],
      cashFlow: [
        /(?:cash\s+flow|operating\s+cash\s+flow)[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh)?/gi
      ],
      taxPaid: [
        /(?:tax(?:es)?\s+paid|income\s+tax)[\s:]*₹?\s*([\d,\.]+)\s*(?:cr|crore|l|lakh)?/gi
      ]
    };

    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      for (const [metricType, patternList] of Object.entries(patterns)) {
        patternList.forEach(pattern => {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const value = this.normalizeValue(match[1]);
            if (value !== null) {
              metrics[metricType].push({
                value,
                context: line.substring(Math.max(0, match.index - 50), match.index + 100),
                lineNumber: idx + 1,
                rawMatch: match[1]
              });
            }
          }
        });
      }
    });

    return metrics;
  }


  normalizeValue(value) {
    if (!value) return null;
    
    let num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) return null;

    const upperVal = value.toUpperCase();
    if (upperVal.includes('CR') || upperVal.includes('CRORE')) num *= 10000000;
    else if (upperVal.includes('L') || upperVal.includes('LAKH')) num *= 100000;
    else if (upperVal.includes('M') || upperVal.includes('MILLION')) num *= 1000000;
    else if (upperVal.includes('K') || upperVal.includes('THOUSAND')) num *= 1000;

    return num;
  }


  checkAccountingIdentity(metrics) {
    const issues = [];
    
    if (metrics.totalAssets.length > 0 && metrics.totalLiabilities.length > 0) {
      const assets = metrics.totalAssets.map(m => m.value);
      const liabilities = metrics.totalLiabilities.map(m => m.value);
      

      assets.forEach((assetVal, aIdx) => {
        liabilities.forEach((liabVal, lIdx) => {
          const deviation = Math.abs(assetVal - liabVal);
          const percentDev = (deviation / Math.max(assetVal, liabVal)) * 100;
          
          if (percentDev > this.thresholds.percentageDeviation && 
              deviation > this.thresholds.absoluteDeviation) {
            issues.push({
              type: 'ACCOUNTING_IDENTITY',
              severity: percentDev > 20 ? 'CRITICAL' : 'HIGH',
              message: `Assets (₹${(assetVal/10000000).toFixed(2)}Cr) vs Liabilities (₹${(liabVal/10000000).toFixed(2)}Cr) deviation: ${percentDev.toFixed(1)}%`,
              deviation: percentDev,
              assetContext: metrics.totalAssets[aIdx].context,
              liabilityContext: metrics.totalLiabilities[lIdx].context
            });
          }
        });
      });
    }

    return issues;
  }


  checkProfitReconciliation(metrics) {
    const issues = [];

    if (metrics.revenue.length > 0 && metrics.expenses.length > 0 && metrics.netProfit.length > 0) {
      metrics.revenue.forEach((rev, rIdx) => {
        metrics.expenses.forEach((exp, eIdx) => {
          metrics.netProfit.forEach((profit, pIdx) => {
            const calculated = rev.value - exp.value;
            const reported = profit.value;
            const deviation = Math.abs(calculated - reported);
            const percentDev = (deviation / Math.max(Math.abs(calculated), Math.abs(reported), 1)) * 100;

            if (percentDev > this.thresholds.percentageDeviation && 
                deviation > this.thresholds.absoluteDeviation) {
              issues.push({
                type: 'PROFIT_RECONCILIATION',
                severity: percentDev > 15 ? 'CRITICAL' : 'MEDIUM',
                message: `Calculated profit (₹${(calculated/10000000).toFixed(2)}Cr) != Reported profit (₹${(reported/10000000).toFixed(2)}Cr): ${percentDev.toFixed(1)}%`,
                calculatedProfit: calculated,
                reportedProfit: reported,
                deviation: percentDev,
                revenueContext: rev.context,
                expenseContext: exp.context,
                profitContext: profit.context
              });
            }
          });
        });
      });
    }

    return issues;
  }


  checkTaxAnomalies(metrics) {
    const issues = [];

    if (metrics.netProfit.length > 0 && metrics.taxPaid.length > 0) {
      metrics.netProfit.forEach((profit, pIdx) => {
        metrics.taxPaid.forEach((tax, tIdx) => {
          if (profit.value > 0) {
            const taxRatio = (tax.value / profit.value) * 100;
            
            if (taxRatio > 50 || (taxRatio > 0 && profit.value > 0 && taxRatio < 5)) {
              issues.push({
                type: 'TAX_ANOMALY',
                severity: taxRatio > 100 ? 'CRITICAL' : 'MEDIUM',
                message: `Unusual tax ratio: ${taxRatio.toFixed(1)}% of profit (expected ~20-30%)`,
                taxRatio,
                profit: profit.value,
                tax: tax.value,
                taxContext: tax.context,
                profitContext: profit.context
              });
            }
          }
        });
      });
    }

    return issues;
  }

  checkCashFlowConsistency(metrics) {
    const issues = [];

    if (metrics.cashFlow.length > 0 && metrics.netProfit.length > 0) {
      metrics.cashFlow.forEach((cf, cfIdx) => {
        metrics.netProfit.forEach((profit, pIdx) => {
          const deviation = Math.abs(cf.value - profit.value);
          const percentDev = (deviation / Math.max(Math.abs(cf.value), Math.abs(profit.value), 1)) * 100;

          if (percentDev > 40 && Math.abs(cf.value) > 1000000) {
            issues.push({
              type: 'CASH_FLOW_ANOMALY',
              severity: percentDev > 100 ? 'HIGH' : 'MEDIUM',
              message: `Cash flow (₹${(cf.value/10000000).toFixed(2)}Cr) significantly differs from Net Profit (₹${(profit.value/10000000).toFixed(2)}Cr): ${percentDev.toFixed(1)}%`,
              cashFlow: cf.value,
              netProfit: profit.value,
              deviation: percentDev,
              cashFlowContext: cf.context,
              profitContext: profit.context
            });
          }
        });
      });
    }

    return issues;
  }

  detectDuplicates(metrics) {
    const duplicates = [];
    const tolerance = 0.01; 

    const allValues = [];
    for (const [key, values] of Object.entries(metrics)) {
      values.forEach(v => {
        allValues.push({ metric: key, ...v });
      });
    }

    for (let i = 0; i < allValues.length; i++) {
      for (let j = i + 1; j < allValues.length; j++) {
        const val1 = allValues[i];
        const val2 = allValues[j];
        
        if (val1.metric !== val2.metric) {
          const diff = Math.abs(val1.value - val2.value);
          const percentDiff = (diff / Math.max(val1.value, val2.value)) * 100;

          if (percentDiff < tolerance && val1.value > 100000) {
            duplicates.push({
              type: 'DUPLICATE_VALUE',
              severity: 'LOW',
              message: `Same value ₹${(val1.value/10000000).toFixed(2)}Cr appears for ${val1.metric} and ${val2.metric}`,
              metric1: val1.metric,
              metric2: val2.metric,
              value: val1.value,
              context1: val1.context,
              context2: val2.context,
              lines: `${val1.lineNumber}, ${val2.lineNumber}`
            });
          }
        }
      }
    }

    return duplicates;
  }

  analyzeText(text, documentId = null) {
    const cacheKey = documentId || crypto.createHash('md5').update(text).digest('hex');
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    const metrics = this.extractMetrics(text);
    const contradictions = [];

    contradictions.push(...this.checkAccountingIdentity(metrics));
    contradictions.push(...this.checkProfitReconciliation(metrics));
    contradictions.push(...this.checkTaxAnomalies(metrics));
    contradictions.push(...this.checkCashFlowConsistency(metrics));
    contradictions.push(...this.detectDuplicates(metrics));


    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    contradictions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const result = {
      documentId: cacheKey,
      timestamp: new Date().toISOString(),
      metricsExtracted: {
        revenue: metrics.revenue.length,
        expenses: metrics.expenses.length,
        profit: metrics.netProfit.length,
        assets: metrics.totalAssets.length,
        liabilities: metrics.totalLiabilities.length
      },
      contradictions,
      summary: {
        total: contradictions.length,
        critical: contradictions.filter(c => c.severity === 'CRITICAL').length,
        high: contradictions.filter(c => c.severity === 'HIGH').length,
        medium: contradictions.filter(c => c.severity === 'MEDIUM').length,
        low: contradictions.filter(c => c.severity === 'LOW').length
      },
      metrics
    };

    this.analysisCache.set(cacheKey, result);
    return result;
  }

  getSuggestions(contradictions) {
    return contradictions.map(contradiction => {
      const suggestions = [];

      switch (contradiction.type) {
        case 'ACCOUNTING_IDENTITY':
          suggestions.push('Verify total assets and liabilities in balance sheet');
          suggestions.push('Check for missed assets or liabilities');
          suggestions.push('Verify equity calculation');
          break;

        case 'PROFIT_RECONCILIATION':
          suggestions.push('Verify revenue and expense figures match all sections');
          suggestions.push('Check for one-time gains/losses not included');
          suggestions.push('Verify depreciation and amortization adjustments');
          break;

        case 'TAX_ANOMALY':
          suggestions.push('Verify tax computation with applicable tax rates');
          suggestions.push('Check for tax credits and exemptions applied');
          suggestions.push('Verify tax loss carryforwards if applicable');
          break;

        case 'CASH_FLOW_ANOMALY':
          suggestions.push('Verify working capital changes are included');
          suggestions.push('Check depreciation add-backs');
          suggestions.push('Verify changes in receivables and payables');
          break;

        case 'DUPLICATE_VALUE':
          suggestions.push('Verify this value is not accidentally duplicated');
          suggestions.push('Check if different metrics share same underlying figure');
          break;
      }

      return {
        contradiction,
        suggestions
      };
    });
  }

  generateRiskScore(analysisResult) {
    const { summary } = analysisResult;
    
    let score = 0;
    score += summary.critical * 25;      
    score += summary.high * 12;         
    score += summary.medium * 5;         
    score += summary.low * 1;            

    return Math.min(score, 100);
  }


  clearCache() {
    this.analysisCache.clear();
  }
}

export default new ContradictionDetector();
