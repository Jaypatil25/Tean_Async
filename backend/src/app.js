const express = require('express');
// const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const { pathToFileURL } = require('url');

const authRoutes = require('./routes/auth.routes');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  ...(process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
    : [])
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

const loadPipeline = async () => {
  const pipelinePath = path.resolve(__dirname, '../../ai-engine/pipeline.js');
  const pipelineModule = await import(pathToFileURL(pipelinePath).href);
  return pipelineModule.runPipeline;
};

const parseJsonField = (value, fallback = {}) => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const toNumeric = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDecisionPayload = (decision) => {
  if (!decision) {
    return {};
  }

  if (typeof decision === 'object') {
    return decision;
  }

  if (typeof decision === 'string') {
    try {
      return JSON.parse(decision);
    } catch (error) {
      return {
        decision: 'REVIEW',
        reasons: [decision],
        recommendations: [],
        red_flags: [],
      };
    }
  }

  return {};
};

const extractFactors = ({ formData, rawDecision, contradictionAnalysis, ownershipAnalysis, contradictionScore }) => {
  const factors = [];

  const yearsInBusiness = toNumeric(formData.yrs);
  if (yearsInBusiness > 0) {
    factors.push({
      title: 'Years in business',
      impact: yearsInBusiness < 3 ? 'negative' : 'positive',
      detail:
        yearsInBusiness < 3
          ? `${yearsInBusiness} years in business increases execution risk.`
          : `${yearsInBusiness} years in business supports operating stability.`,
    });
  }

  const cibilScore = toNumeric(formData.cibil);
  if (cibilScore > 0) {
    factors.push({
      title: 'Credit bureau score',
      impact: cibilScore >= 750 ? 'positive' : cibilScore >= 650 ? 'neutral' : 'negative',
      detail:
        cibilScore >= 750
          ? `CIBIL score ${cibilScore} is a strong repayment indicator.`
          : cibilScore >= 650
            ? `CIBIL score ${cibilScore} is acceptable but not strong.`
            : `CIBIL score ${cibilScore} is below the comfort threshold.`,
    });
  }

  const revenue = toNumeric(formData.rev24);
  const profit = toNumeric(formData.np24);
  if (revenue > 0) {
    const margin = (profit / revenue) * 100;
    factors.push({
      title: 'Profitability',
      impact: margin >= 5 ? 'positive' : margin >= 0 ? 'neutral' : 'negative',
      detail:
        margin < 0
          ? `Net profit margin is ${margin.toFixed(1)}%, indicating a loss-making year.`
          : margin < 5
            ? `Net profit margin is ${margin.toFixed(1)}%, which is thin for credit comfort.`
            : `Net profit margin is ${margin.toFixed(1)}%, supporting repayment capacity.`,
    });
  }

  const monthlyEmi = toNumeric(formData.emi);
  if (monthlyEmi > 0) {
    factors.push({
      title: 'Existing repayment burden',
      impact: monthlyEmi > 250000 ? 'negative' : 'neutral',
      detail: `Declared existing EMI obligation is Rs. ${monthlyEmi.toLocaleString('en-IN')} per month.`,
    });
  }

  if (formData.litigation && formData.litigation !== 'no') {
    factors.push({
      title: 'Litigation disclosure',
      impact: 'negative',
      detail: 'Pending or historical litigation was declared and needs manual review.',
    });
  }

  if (formData.npa && formData.npa !== 'no') {
    factors.push({
      title: 'NPA / default history',
      impact: 'negative',
      detail:
        formData.npa === 'active'
          ? 'Active NPA history is a major credit risk trigger.'
          : 'Resolved default history still weighs on the application.',
    });
  }

  if ((contradictionAnalysis?.summary?.total || 0) > 0) {
    factors.push({
      title: 'Document contradictions',
      impact: contradictionScore >= 50 ? 'negative' : 'neutral',
      detail: `${contradictionAnalysis.summary.total} contradiction(s) were detected across uploaded documents.`,
    });
  }

  const shellRisk = ownershipAnalysis?.risks?.shellCompanyAnalysis?.shellCompanyProbability;
  if (typeof shellRisk === 'number') {
    factors.push({
      title: 'Ownership / shell-company risk',
      impact: shellRisk >= 50 ? 'negative' : shellRisk >= 25 ? 'neutral' : 'positive',
      detail: `Ownership analysis estimated shell-company risk at ${shellRisk.toFixed(0)}%.`,
    });
  }

  if (Array.isArray(rawDecision?.red_flags) && rawDecision.red_flags.length > 0) {
    rawDecision.red_flags.slice(0, 4).forEach((flag) => {
      factors.push({
        title: 'AI red flag',
        impact: 'negative',
        detail: String(flag),
      });
    });
  }

  return factors;
};

const buildAssessmentResponse = ({ result, formData }) => {
  const rawDecision = parseDecisionPayload(result?.decision);
  const contradictionAnalysis = result?.analysis?.contradictions || null;
  const ownershipAnalysis = result?.analysis?.ownership || null;
  const contradictionScore = result?.analysis?.risks?.contradictionScore ?? 0;
  const score = Math.max(0, Math.min(100, Number(rawDecision.score) || 0));
  const moveToAdmin = score > 50;
  const reasons = Array.isArray(rawDecision.reasons) ? rawDecision.reasons : [];
  const recommendations = Array.isArray(rawDecision.recommendations)
    ? rawDecision.recommendations
    : [];
  const factors = extractFactors({
    formData,
    rawDecision,
    contradictionAnalysis,
    ownershipAnalysis,
    contradictionScore,
  });

  return {
    score,
    decision: rawDecision.decision || (moveToAdmin ? 'REVIEW' : 'REJECT'),
    moveToAdmin,
    reviewStatus: moveToAdmin ? 'ADMIN_REVIEW' : 'REJECTED_BELOW_THRESHOLD',
    threshold: 50,
    summary: moveToAdmin
      ? 'Score is above 50%, so the application should move to admin review.'
      : 'Score is 50% or below, so the application should not move to admin review yet.',
    reasons,
    recommendations,
    redFlags: Array.isArray(rawDecision.red_flags) ? rawDecision.red_flags : [],
    factors,
    analysis: {
      contradictions: contradictionAnalysis,
      ownership: ownershipAnalysis,
      contradictionRiskScore: contradictionScore,
      shellCompanyRisk:
        ownershipAnalysis?.risks?.shellCompanyAnalysis || null,
    },
    metadata: result?.metadata || {},
  };
};

app.post(
  '/api/assess',
  upload.fields([
    { name: 'pnl', maxCount: 1 },
    { name: 'bank', maxCount: 1 },
    { name: 'balanceSheet', maxCount: 1 },
    { name: 'gst', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const formData = req.body || {};
      const companyData = parseJsonField(req.body.companyData, {});
      const uploadedFiles = req.files || {};
      const runPipeline = await loadPipeline();

      const result = await runPipeline(
        formData,
        {
          pnl: uploadedFiles.pnl?.[0] || uploadedFiles.balanceSheet?.[0],
          bank: uploadedFiles.bank?.[0] || uploadedFiles.gst?.[0],
        },
        companyData
      );

      if (result?.error) {
        return res.status(500).json({
          message: result.message || 'AI assessment failed.',
        });
      }

      return res.json(buildAssessmentResponse({ result, formData }));
    } catch (error) {
      console.error('Assessment route failed:', error);
      return res.status(500).json({
        message: error.message || 'Unable to run AI assessment.',
      });
    }
  }
);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
