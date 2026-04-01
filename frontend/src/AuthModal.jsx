import { useState } from "react";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px 36px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
    position: "relative",
    animation: "slideUp 0.25s ease",
    fontFamily: "'DM Sans', sans-serif",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#f5f5f5",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#666",
    lineHeight: 1,
    transition: "background 0.15s",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "28px",
  },
  logoIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111",
    letterSpacing: "-0.4px",
  },
  tabs: {
    display: "flex",
    background: "#f4f4f5",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "28px",
    gap: "4px",
  },
  tab: (active) => ({
    flex: 1,
    padding: "9px",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s ease",
    background: active ? "#fff" : "transparent",
    color: active ? "#111" : "#888",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
  }),
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    background: "#fafafa",
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  submitBtn: {
    width: "100%",
    padding: "13px",
    marginTop: "8px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: "-0.2px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0",
    color: "#bbb",
    fontSize: "13px",
  },
  line: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  googleBtn: {
    width: "100%",
    padding: "11px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'DM Sans', sans-serif",
    color: "#333",
    transition: "background 0.15s",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "13px",
    color: "#888",
  },
  link: {
    color: "#6366f1",
    cursor: "pointer",
    fontWeight: "500",
    background: "none",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    padding: 0,
  },
  forgotLink: {
    fontSize: "13px",
    color: "#6366f1",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    padding: 0,
    fontWeight: "500",
    float: "right",
    marginTop: "-2px",
  },
};

const googleSVG = (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.6 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.1 0-9.6-3.2-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C36.9 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

function LoginForm({ onSwitch }) {
  return (
    <>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Email address</label>
        <input style={styles.input} type="email" placeholder="you@example.com" />
      </div>
      <div style={styles.fieldGroup}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <label style={styles.label}>Password</label>
          <button style={styles.forgotLink}>Forgot password?</button>
        </div>
        <input style={styles.input} type="password" placeholder="••••••••" />
      </div>
      <button
        style={styles.submitBtn}
        onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseOut={e => (e.currentTarget.style.opacity = "1")}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        Sign in
      </button>
      <div style={styles.divider}>
        <div style={styles.line} />
        or
        <div style={styles.line} />
      </div>
      <button
        style={styles.googleBtn}
        onMouseOver={e => (e.currentTarget.style.background = "#f9f9f9")}
        onMouseOut={e => (e.currentTarget.style.background = "#fff")}
      >
        {googleSVG} Continue with Google
      </button>
      <p style={styles.footer}>
        Don't have an account?{" "}
        <button style={styles.link} onClick={() => onSwitch("signup")}>Sign up</button>
      </p>
    </>
  );
}

function SignupForm({ onSwitch }) {
  return (
    <>
      <div style={{ ...styles.fieldGroup, ...styles.row }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>First name</label>
          <input style={styles.input} type="text" placeholder="Jane" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Last name</label>
          <input style={styles.input} type="text" placeholder="Doe" />
        </div>
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Email address</label>
        <input style={styles.input} type="email" placeholder="you@example.com" />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" placeholder="Min. 8 characters" />
      </div>
      <button
        style={styles.submitBtn}
        onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseOut={e => (e.currentTarget.style.opacity = "1")}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        Create account
      </button>
      <div style={styles.divider}>
        <div style={styles.line} />
        or
        <div style={styles.line} />
      </div>
      <button
        style={styles.googleBtn}
        onMouseOver={e => (e.currentTarget.style.background = "#f9f9f9")}
        onMouseOut={e => (e.currentTarget.style.background = "#fff")}
      >
        {googleSVG} Sign up with Google
      </button>
      <p style={styles.footer}>
        Already have an account?{" "}
        <button style={styles.link} onClick={() => onSwitch("login")}>Sign in</button>
      </p>
    </>
  );
}

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState("login");

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(18px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        input:focus { border-color: #6366f1 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
      `}</style>
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
        <div style={styles.modal}>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseOver={e => (e.currentTarget.style.background = "#ebebeb")}
            onMouseOut={e => (e.currentTarget.style.background = "#f5f5f5")}
          >
            
          </button>


          <div style={styles.tabs}>
            <button style={styles.tab(tab === "login")} onClick={() => setTab("login")}>Sign in</button>
            <button style={styles.tab(tab === "signup")} onClick={() => setTab("signup")}>Sign up</button>
          </div>

          {tab === "login"
            ? <LoginForm onSwitch={setTab} />
            : <SignupForm onSwitch={setTab} />
          }
        </div>
      </div>
    </>
  );
}


