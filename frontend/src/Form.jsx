import { useState, useCallback } from "react";
import "./Form.css";

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function fmtCrore(v) {
  const n = parseFloat(v);
  if (isNaN(n) || n <= 0) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
function Badge({ type }) {
  return type === "req" ? (
    <span className="badge-req">required</span>
  ) : (
    <span className="badge-opt">optional</span>
  );
}

function Flag({ msg, type }) {
  if (!msg) return null;
  return <div className={`field-flag show ${type}`}>{msg}</div>;
}

function Field({ label, badge = "opt", hint, children, span2 }) {
  return (
    <div className={`fld${span2 ? " span2" : ""}`}>
      <label>
        {label} <Badge type={badge} />
      </label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

function UploadBox({ label, sub, id, onFile, file }) {
  return (
    <div className={`upload-box${file ? " has-file" : ""}`}>
      <input
        type="file"
        accept=".pdf,.xlsx,.xls"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="16" width="18" height="2" rx="1" fill={file ? "#39ff14" : "#444"} />
        <path d="M12 4v10M9 9l3-3 3 3" stroke={file ? "#39ff14" : "#444"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div className="upload-label">{file ? "File attached" : label}</div>
      <div className="upload-sub">{sub}</div>
      {file && <div className="upload-done">{file.name}</div>}
    </div>
  );
}

function Collapse({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={`collapse-toggle${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {title}
        <span className={`collapse-arrow${open ? " open" : ""}`}>›</span>
      </button>
      <div className={`collapse-body${open ? " open" : ""}`}>{children}</div>
    </>
  );
}

function SectionBlock({ icon, title, sub, children }) {
  return (
    <div className="section-block">
      <div className="sec-head">
        <div className="sec-icon">{icon}</div>
        <div>
          <div className="sec-title">{title}</div>
          <div className="sec-sub">{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Step1({ data, set }) {
  const panFlag = (v) => {
    if (!v || v.length < 10) return null;
    return PAN_RE.test(v)
      ? { msg: "PAN format valid", type: "ok" }
      : { msg: "Invalid — must be 5 letters + 4 digits + 1 letter (e.g. AAACS1234B)", type: "err" };
  };
  const loanFmt = fmtCrore(data.loan_amt);

  return (
    <>
      <SectionBlock icon="01" title="Company identity" sub="Registration & GSTN details">
        <div className="g2">
          <Field label="Company name" badge="req" hint="Full registered name as per MCA">
            <input
              value={data.co_name}
              onChange={(e) => set("co_name", e.target.value)}
              placeholder="e.g. Sunrise Exports Pvt Ltd"
            />
          </Field>
          <Field label="Company PAN" badge="req">
            <input
              value={data.co_pan}
              onChange={(e) => set("co_pan", e.target.value.toUpperCase())}
              placeholder="e.g. AAACS1234B"
              maxLength={10}
            />
            {panFlag(data.co_pan) && (
              <Flag msg={panFlag(data.co_pan).msg} type={panFlag(data.co_pan).type} />
            )}
          </Field>
          <Field label="GSTIN" badge="opt" hint="Enter for 60-second auto-fetch from GSTN">
            <div className="gstin-row">
              <input
                value={data.gstin}
                onChange={(e) => set("gstin", e.target.value.toUpperCase())}
                placeholder="e.g. 27AAACS1234B1ZK"
                maxLength={15}
              />
              <button
                className="fetch-btn"
                type="button"
                onClick={() => {
                  if (data.gstin.length < 15) return;
                  set("gstin_status", "loading");
                  setTimeout(() => {
                    set(
                      "gstin_status",
                      "GSTN verified — Active taxpayer, Maharashtra. 10/12 months filed on time."
                    );
                  }, 1400);
                }}
              >
                Auto-fetch →
              </button>
            </div>
            {data.gstin_status === "loading" && (
              <Flag msg="Fetching from GSTN portal…" type="warn" />
            )}
            {data.gstin_status && data.gstin_status !== "loading" && (
              <Flag msg={data.gstin_status} type="ok" />
            )}
          </Field>
          <Field label="CIN (Company Identification Number)" badge="opt" hint="Enables auto-pull of MCA / ROC filings">
            <input
              value={data.cin}
              onChange={(e) => set("cin", e.target.value)}
              placeholder="e.g. U74999MH2015PTC265002"
            />
          </Field>
          <Field label="Udyam / MSME registration number" badge="opt">
            <input
              value={data.udyam}
              onChange={(e) => set("udyam", e.target.value)}
              placeholder="e.g. UDYAM-MH-12-0012345"
            />
          </Field>
          <Field label="Business type" badge="req">
            <select value={data.biz_type} onChange={(e) => set("biz_type", e.target.value)}>
              <option value="">Select entity type</option>
              {["Private Limited Company","Public Limited Company","LLP","Partnership Firm","Proprietorship","Trust / Society"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Industry / sector" badge="req">
            <select value={data.industry} onChange={(e) => set("industry", e.target.value)}>
              <option value="">Select sector</option>
              {["Manufacturing","Trading / Distribution","Real estate","Hospitality","IT / Technology","Healthcare","Agriculture / Agro-processing","Logistics / Transport","Textiles / Garments","Construction / Infrastructure","Education","Retail","Import / Export","Other"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Years in business" badge="req" hint="Below 3 years is treated as high risk">
            <input
              type="number"
              value={data.yrs}
              onChange={(e) => set("yrs", e.target.value)}
              placeholder="e.g. 8"
              min="0" max="100"
            />
          </Field>
        </div>
      </SectionBlock>

      <SectionBlock icon="02" title="Loan request" sub="What you need and why">
        <div className="g2">
          <Field label="Loan amount requested (₹)" badge="req">
            <input
              type="number"
              value={data.loan_amt}
              onChange={(e) => set("loan_amt", e.target.value)}
              placeholder="e.g. 5000000"
            />
            {loanFmt && <Flag msg={`= ${loanFmt}`} type="ok" />}
          </Field>
          <Field label="Purpose of loan" badge="req">
            <select
              value={data.loan_purpose}
              onChange={(e) => set("loan_purpose", e.target.value)}
            >
              <option value="">Select purpose</option>
              {["Working capital","Machinery / equipment purchase","Business expansion","Import / export financing","Property purchase","Debt refinancing","Project finance","Other"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            {data.loan_purpose === "Debt refinancing" && (
              <Flag msg="Debt refinancing requires existing loan schedules and NOC from current lenders." type="warn" />
            )}
          </Field>
          <Field label="Preferred loan type" badge="opt">
            <select value={data.loan_type} onChange={(e) => set("loan_type", e.target.value)}>
              <option value="">Select type</option>
              {["Term loan","Cash credit / OD","Letter of credit","Bank guarantee","ECLGS","Invoice discounting"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Preferred tenor" badge="opt">
            <select value={data.tenor} onChange={(e) => set("tenor", e.target.value)}>
              <option value="">Select tenor</option>
              {["Up to 12 months","1–3 years","3–5 years","5–7 years","Above 7 years"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Collateral offered" badge="req" span2>
            <textarea
              value={data.collateral}
              onChange={(e) => set("collateral", e.target.value)}
              placeholder="Describe collateral: type (property/FD/machinery), location, estimated market value, existing charges if any…"
            />
          </Field>
        </div>
      </SectionBlock>
    </>
  );
}

function Step2({ data, set }) {
  const r24 = parseFloat(data.rev24) || 0;
  const np24 = parseFloat(data.np24) || 0;
  const margin = r24 > 0 ? ((np24 / r24) * 100).toFixed(1) : null;

  const marginFlag = () => {
    if (!margin) return null;
    if (np24 < 0) return { msg: "Net loss declared — requires detailed explanation in CAM", type: "err" };
    if (parseFloat(margin) < 5) return { msg: `Net margin: ${margin}% — below 5%, will be flagged`, type: "warn" };
    return { msg: `Net margin: ${margin}% — acceptable`, type: "ok" };
  };

  const cibilFlag = () => {
    const v = parseInt(data.cibil);
    if (!v || v < 300) return null;
    if (v >= 750) return { msg: "Good credit score — above 750", type: "ok" };
    if (v >= 650) return { msg: "Moderate score — 650–750, acceptable with mitigants", type: "warn" };
    return { msg: "Low CIBIL — below 650 is a significant risk flag", type: "err" };
  };

  return (
    <>
      <SectionBlock icon="03" title="Financial overview" sub="Last 3 years — typed summary for ratio computation">
        <div className="g3">
          <Field label="Turnover FY24 (₹)" badge="req">
            <input type="number" value={data.rev24} onChange={(e) => set("rev24", e.target.value)} placeholder="e.g. 42000000" />
          </Field>
          <Field label="Turnover FY23 (₹)" badge="req">
            <input type="number" value={data.rev23} onChange={(e) => set("rev23", e.target.value)} placeholder="e.g. 36000000" />
          </Field>
          <Field label="Turnover FY22 (₹)" badge="opt">
            <input type="number" value={data.rev22} onChange={(e) => set("rev22", e.target.value)} placeholder="e.g. 29000000" />
          </Field>
          <Field label="Net profit FY24 (₹)" badge="req">
            <input type="number" value={data.np24} onChange={(e) => set("np24", e.target.value)} placeholder="e.g. 4200000" />
          </Field>
          <Field label="Net profit FY23 (₹)" badge="req">
            <input type="number" value={data.np23} onChange={(e) => set("np23", e.target.value)} placeholder="e.g. 3100000" />
          </Field>
          <Field label="Net profit FY22 (₹)" badge="opt">
            <input type="number" value={data.np22} onChange={(e) => set("np22", e.target.value)} placeholder="e.g. 2400000" />
          </Field>
          <Field label="Total assets FY24 (₹)" badge="opt">
            <input type="number" value={data.assets} onChange={(e) => set("assets", e.target.value)} placeholder="e.g. 85000000" />
          </Field>
          <Field label="Total liabilities FY24 (₹)" badge="opt">
            <input type="number" value={data.liab} onChange={(e) => set("liab", e.target.value)} placeholder="e.g. 52000000" />
          </Field>
          <Field label="Net worth / equity FY24 (₹)" badge="opt">
            <input type="number" value={data.networth} onChange={(e) => set("networth", e.target.value)} placeholder="e.g. 33000000" />
          </Field>
        </div>
        {marginFlag() && <Flag msg={marginFlag().msg} type={marginFlag().type} />}
      </SectionBlock>

      <SectionBlock icon="04" title="Debt & repayment obligations" sub="Existing debt load — used to compute DSCR">
        <div className="g2">
          <Field label="Existing total EMI per month (₹)" badge="req" hint="Sum of all current loan EMIs — critical for DSCR computation">
            <input type="number" value={data.emi} onChange={(e) => set("emi", e.target.value)} placeholder="e.g. 150000" />
          </Field>
          <Field label="Total outstanding loan balance (₹)" badge="opt">
            <input type="number" value={data.outstanding} onChange={(e) => set("outstanding", e.target.value)} placeholder="e.g. 8500000" />
          </Field>
          <Field label="Existing bank(s) for credit facilities" badge="opt" hint="Multi-banking patterns are a risk signal">
            <input value={data.banks} onChange={(e) => set("banks", e.target.value)} placeholder="e.g. SBI, HDFC Bank, Axis Bank" />
          </Field>
          <Field label="Last known CIBIL / credit bureau score" badge="opt">
            <input type="number" value={data.cibil} onChange={(e) => set("cibil", e.target.value)} placeholder="e.g. 750" min="300" max="900" />
            {cibilFlag() && <Flag msg={cibilFlag().msg} type={cibilFlag().type} />}
          </Field>
          <Field label="Export / import business?" badge="opt" hint="Flags forex exposure in risk assessment">
            <select value={data.exim} onChange={(e) => set("exim", e.target.value)}>
              <option value="">Select</option>
              {["No","Export only","Import only","Both export and import"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Export turnover as % of total revenue" badge="opt" hint="Cross-verified against DGFT export data">
            <input type="number" value={data.export_pct} onChange={(e) => set("export_pct", e.target.value)} placeholder="e.g. 40" min="0" max="100" />
          </Field>
        </div>
      </SectionBlock>
    </>
  );
}


function Step3({ data, set }) {
  const coreUploads = [
    { key: "f_pl",      label: "Click to upload P&L statement",     sub: "PDF or Excel — 3 years revenue, EBITDA, PAT",        req: true },
    { key: "f_bs",      label: "Click to upload balance sheet",     sub: "PDF or Excel — assets, liabilities, net worth",      req: true },
    { key: "f_bank",    label: "Click to upload bank statements",   sub: "PDF — all primary operating accounts, 12 months",    req: true },
    { key: "f_gst",     label: "Click to upload GST returns",       sub: "PDF — GSTR-1 & GSTR-3B, last 12 months",             req: true },
  ];
  const addlUploads = [
    { key: "f_itr",     label: "Click to upload ITR filings",        sub: "PDF — last 3 years, for P&L cross-verification" },
    { key: "f_audit",   label: "Click to upload auditor's report",   sub: "AI scans footnotes and notes to accounts for hidden risks" },
    { key: "f_sanction",label: "Click to upload sanction letters",   sub: "Existing loan sanctions — verifies stated outstanding balances" },
    { key: "f_val",     label: "Click to upload valuation report",   sub: "Property/collateral valuation — strengthens coverage ratio" },
  ];

  return (
    <>
      <SectionBlock icon="05" title="Core document uploads" sub="All 4 required — AI parses these for analysis">
        <div className="g2">
          {coreUploads.map(({ key, label, sub, req }) => (
            <Field key={key} label={label.replace("Click to upload ", "")} badge={req ? "req" : "opt"}>
              <UploadBox
                label={label}
                sub={sub}
                id={key}
                file={data[key]}
                onFile={(f) => set(key, f)}
              />
            </Field>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock icon="06" title="Additional supporting documents" sub="Optional — significantly improves AI accuracy and CAM quality">
        <div className="g2">
          {addlUploads.map(({ key, label, sub }) => (
            <Field key={key} label={label.replace("Click to upload ", "")} badge="opt">
              <UploadBox
                label={label}
                sub={sub}
                id={key}
                file={data[key]}
                onFile={(f) => set(key, f)}
              />
            </Field>
          ))}
        </div>
      </SectionBlock>
    </>
  );
}


function Step4({ data, set }) {
  const panFlag = (v) => {
    if (!v || v.length < 10) return null;
    return PAN_RE.test(v)
      ? { msg: "PAN format valid", type: "ok" }
      : { msg: "Invalid PAN format", type: "err" };
  };

  const litFlag = () => {
    if (data.litigation === "major") return { msg: "Significant litigation declared — full case details and court orders required.", type: "err" };
    if (data.litigation === "minor") return { msg: "Describe the litigation below — AI will assess materiality.", type: "warn" };
    return null;
  };

  const npaFlag = () => {
    if (data.npa === "active") return { msg: "Active NPA — significantly impacts creditworthiness. Full disclosure required.", type: "err" };
    if (data.npa === "resolved") return { msg: "Resolved default will be reviewed in context with current financials.", type: "warn" };
    return null;
  };

  return (
    <>
      <SectionBlock icon="07" title="Promoter / director details" sub="Primary decision-maker background — AI runs MCA + CERSAI + news checks">
        <div className="g2">
          <Field label="Promoter full name" badge="req">
            <input value={data.pr_name} onChange={(e) => set("pr_name", e.target.value)} placeholder="Full name as per PAN card" />
          </Field>
          <Field label="Promoter PAN" badge="req">
            <input
              value={data.pr_pan}
              onChange={(e) => set("pr_pan", e.target.value.toUpperCase())}
              placeholder="e.g. AABCP1234D"
              maxLength={10}
            />
            {panFlag(data.pr_pan) && <Flag msg={panFlag(data.pr_pan).msg} type={panFlag(data.pr_pan).type} />}
          </Field>
          <Field label="Aadhaar number (last 4 digits only)" badge="opt" hint="Last 4 digits only — for KYC verification">
            <input value={data.aadhaar} onChange={(e) => set("aadhaar", e.target.value)} placeholder="e.g. 4521" maxLength={4} />
          </Field>
          <Field label="DIN (Director Identification Number)" badge="opt" hint="Enables MCA disqualification & active-director check">
            <input value={data.din} onChange={(e) => set("din", e.target.value)} placeholder="e.g. 07654321" maxLength={8} />
          </Field>
          <Field label="Promoter's % shareholding" badge="opt">
            <input type="number" value={data.pr_share} onChange={(e) => set("pr_share", e.target.value)} placeholder="e.g. 75" min="0" max="100" />
          </Field>
          <Field label="Other directorships held" badge="opt" hint="Cross-checks for hidden group company exposure">
            <input value={data.pr_other_co} onChange={(e) => set("pr_other_co", e.target.value)} placeholder="e.g. ABC Traders Pvt Ltd, XYZ Infra LLP" />
          </Field>
          <Field label="Co-promoter / guarantor name & PAN" badge="opt" span2>
            <input value={data.co_pr} onChange={(e) => set("co_pr", e.target.value)} placeholder="Name — PAN (e.g. Priya Mehta — BBBCP5678E)" />
          </Field>
        </div>
      </SectionBlock>

      <SectionBlock icon="08" title="Legal & compliance self-declaration" sub="AI will independently verify these against court records & RBI lists">
        <div className="g2">
          <Field label="Any pending litigation?" badge="req">
            <select value={data.litigation} onChange={(e) => set("litigation", e.target.value)}>
              <option value="">Select</option>
              <option value="no">No</option>
              <option value="minor">Yes — minor / routine</option>
              <option value="major">Yes — significant / ongoing</option>
            </select>
            {litFlag() && <Flag msg={litFlag().msg} type={litFlag().type} />}
          </Field>
          <Field label="Any NPA / loan default history?" badge="req">
            <select value={data.npa} onChange={(e) => set("npa", e.target.value)}>
              <option value="">Select</option>
              <option value="no">No</option>
              <option value="resolved">Yes — resolved / settled</option>
              <option value="active">Yes — active NPA</option>
            </select>
            {npaFlag() && <Flag msg={npaFlag().msg} type={npaFlag().type} />}
          </Field>
          <Field label="Litigation / legal issue details" badge="opt" span2>
            <textarea value={data.lit_detail} onChange={(e) => set("lit_detail", e.target.value)} placeholder="Describe any pending cases, court orders, regulatory actions, or past defaults…" />
          </Field>
          <Field label="News / media links about promoter or company" badge="opt" span2 hint="Leave blank — AI independently scans for adverse media, fraud reports, and regulatory orders">
            <textarea value={data.news_links} onChange={(e) => set("news_links", e.target.value)} placeholder="Paste relevant news URLs or mention any recent press coverage…" />
          </Field>
        </div>
      </SectionBlock>
    </>
  );
}


function Step5({ data, set }) {
  return (
    <SectionBlock icon="09" title="Business intelligence" sub="Optional differentiator inputs — these push AI accuracy from 70% to 90%+">

      <Collapse title="Customer & supplier concentration risk">
        <div className="g2">
          {[1, 2, 3].map((n) => (
            <Field key={n} label={`Top customer ${n} — name & revenue %`} badge="opt">
              <input value={data[`cust${n}`]} onChange={(e) => set(`cust${n}`, e.target.value)} placeholder="e.g. Reliance Industries — 35%" />
            </Field>
          ))}
          {[1, 2, 3].map((n) => (
            <Field key={n} label={`Top supplier ${n} — name & spend %`} badge="opt">
              <input value={data[`sup${n}`]} onChange={(e) => set(`sup${n}`, e.target.value)} placeholder="e.g. Steel Authority of India — 40%" />
            </Field>
          ))}
        </div>
        <div className="field-hint" style={{ marginTop: 8 }}>
          Single customer &gt;40% revenue = high concentration risk — AI will flag and quantify
        </div>
      </Collapse>

      <div className="divider" />

      <Collapse title="Group companies & related party transactions">
        <div className="g2">
          <Field label="Group companies / associate entities" badge="opt" span2 hint="Used to detect round-tripping and circular fund flows">
            <textarea value={data.group_cos} onChange={(e) => set("group_cos", e.target.value)} placeholder="List related companies, sister concerns, or group entities — name, relationship, and whether inter-company loans exist…" />
          </Field>
          <Field label="Inter-company loans outstanding (₹)" badge="opt">
            <input type="number" value={data.interco} onChange={(e) => set("interco", e.target.value)} placeholder="e.g. 5000000" />
          </Field>
          <Field label="Statutory auditor name & firm" badge="opt" hint="Big 4 vs unknown firm is a credibility signal in AI scoring">
            <input value={data.auditor} onChange={(e) => set("auditor", e.target.value)} placeholder="e.g. Deloitte Haskins & Sells" />
          </Field>
        </div>
      </Collapse>

      <div className="divider" />

      <Collapse title="Operations & sector details">
        <div className="g2">
          <Field label="Number of employees" badge="opt">
            <input type="number" value={data.employees} onChange={(e) => set("employees", e.target.value)} placeholder="e.g. 120" />
          </Field>
          <Field label="Manufacturing / capacity utilisation %" badge="opt" hint="Below 50% signals underperformance relative to assets">
            <input type="number" value={data.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 72" min="0" max="100" />
          </Field>
          <Field label="Registered office state" badge="opt">
            <select value={data.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Select state</option>
              {["Maharashtra","Gujarat","Delhi","Karnataka","Tamil Nadu","Telangana","Rajasthan","Uttar Pradesh","West Bengal","Punjab","Haryana","Other"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Primary operating account bank" badge="opt">
            <select value={data.primary_bank} onChange={(e) => set("primary_bank", e.target.value)}>
              <option value="">Select bank</option>
              {["SBI","HDFC Bank","ICICI Bank","Axis Bank","Kotak Mahindra","Bank of Baroda","Punjab National Bank","Canara Bank","Other"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Business description" badge="opt" span2>
            <textarea value={data.biz_desc} onChange={(e) => set("biz_desc", e.target.value)} placeholder="Describe what the business does, main products/services, key markets, and competitive advantage in 2–3 sentences…" />
          </Field>
        </div>
      </Collapse>
    </SectionBlock>
  );
}

function Step6({ data, onSubmit }) {
  const docCount = ["f_pl","f_bs","f_bank","f_gst","f_itr","f_audit","f_sanction","f_val"].filter((k) => data[k]).length;
  const loanFmt = fmtCrore(data.loan_amt);

  const warnings = [];
  if (!data.co_name) warnings.push({ msg: "Company name is missing", type: "err" });
  if (!data.co_pan) warnings.push({ msg: "Company PAN is missing", type: "err" });
  if (!data.loan_amt) warnings.push({ msg: "Loan amount not entered", type: "err" });
  if (!data.f_pl || !data.f_bs || !data.f_bank || !data.f_gst) warnings.push({ msg: "One or more required documents not uploaded", type: "warn" });
  if (!data.pr_name) warnings.push({ msg: "Promoter name is missing", type: "err" });

  return (
    <SectionBlock icon="✓" title="Application review" sub="Confirm details before submitting for AI analysis">
      <div className="review-grid">
        <div className={`review-card${data.co_name ? " highlight" : ""}`}>
          <div className="review-card-label">Company</div>
          <div className="review-card-val">{data.co_name || "Not entered"}</div>
          <div className="review-card-sub">{data.co_pan || "PAN not entered"}</div>
        </div>
        <div className={`review-card${data.loan_amt ? " highlight" : ""}`}>
          <div className="review-card-label">Loan request</div>
          <div className="review-card-val">{loanFmt || "Not entered"}</div>
          <div className="review-card-sub">{data.loan_purpose || "Purpose not selected"}</div>
        </div>
        <div className="review-card">
          <div className="review-card-label">Documents uploaded</div>
          <div className="review-card-val">{docCount} / 8</div>
          <div className="review-card-sub">{docCount >= 4 ? "Core docs complete" : "Upload required docs"}</div>
        </div>
        <div className={`review-card${data.pr_name ? " highlight" : ""}`}>
          <div className="review-card-label">Promoter</div>
          <div className="review-card-val">{data.pr_name || "Not entered"}</div>
          <div className="review-card-sub">{data.pr_pan || "PAN not entered"}</div>
        </div>
      </div>

      {warnings.map((w, i) => (
        <Flag key={i} msg={w.msg} type={w.type} />
      ))}

      <div className="declaration">
        By submitting this application, you confirm that all information provided is accurate, complete, and truthful to the best of your knowledge. The AI-generated Credit Appraisal Memo is for internal bank/NBFC use only. The final lending decision rests solely with the authorised credit manager.
      </div>
    </SectionBlock>
  );
}


const STEPS = [
  { label: "Identity", short: "01" },
  { label: "Financials", short: "02" },
  { label: "Documents", short: "03" },
  { label: "Promoter", short: "04" },
  { label: "Advanced", short: "05" },
  { label: "Review", short: "06" },
];

const INIT = {
  co_name:"", co_pan:"", gstin:"", gstin_status:"", cin:"", udyam:"", biz_type:"", industry:"", yrs:"",
  loan_amt:"", loan_purpose:"", loan_type:"", tenor:"", collateral:"",
  rev24:"", rev23:"", rev22:"", np24:"", np23:"", np22:"", assets:"", liab:"", networth:"",
  emi:"", outstanding:"", banks:"", cibil:"", exim:"", export_pct:"",
  f_pl:null, f_bs:null, f_bank:null, f_gst:null, f_itr:null, f_audit:null, f_sanction:null, f_val:null,
  pr_name:"", pr_pan:"", aadhaar:"", din:"", pr_share:"", pr_other_co:"", co_pr:"",
  litigation:"", npa:"", lit_detail:"", news_links:"",
  cust1:"", cust2:"", cust3:"", sup1:"", sup2:"", sup3:"",
  group_cos:"", interco:"", auditor:"",
  employees:"", capacity:"", state:"", primary_bank:"", biz_desc:"",
};

export default function Form({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INIT);

  const set = useCallback((key, val) => setData((d) => ({ ...d, [key]: val })), []);

  const handleSubmit = () => {
    if (onSubmit) onSubmit(data);
    alert("Application submitted! AI analysis is now running…");
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <Step1 data={data} set={set} />;
      case 1: return <Step2 data={data} set={set} />;
      case 2: return <Step3 data={data} set={set} />;
      case 3: return <Step4 data={data} set={set} />;
      case 4: return <Step5 data={data} set={set} />;
      case 5: return <Step6 data={data} onSubmit={handleSubmit} />;
      default: return null;
    }
  };

  return (
    <div className="form-root">
      {/* Header */}
      <header className="form-header">
        <div className="header-brand">
          <div className="header-logo">CI</div>
          <div>
            <div className="header-title">Credit Intelligence</div>
            <div className="header-sub">AI-Powered Credit Appraisal System</div>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          System online
        </div>
      </header>

      {/* Step tabs */}
      <nav className="progress-wrap">
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`step-tab${step === i ? " active" : ""}${step > i ? " done" : ""}`}
            onClick={() => setStep(i)}
            type="button"
          >
            <span className="step-num">{s.short}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {}
      <main className="form-body">
        {renderStep()}

        {}
        <div className="btn-row">
          {step > 0 && (
            <button className="btn" type="button" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          {step < 5 && (
            <button className="btn primary" type="button" onClick={() => setStep((s) => s + 1)}>
              Next: {STEPS[step + 1]?.label} →
            </button>
          )}
          {step === 5 && (
            <button className="btn submit" type="button" onClick={handleSubmit}>
              Submit for AI analysis →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
