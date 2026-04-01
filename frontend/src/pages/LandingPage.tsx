import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeIcon, EyeCloseIcon } from "../icons";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in right now"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-outfit">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/landing" className="flex items-center">
            <img src="/credify-logo.png" alt="Credify Logo" className="h-12" />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing", "About"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/signin" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Link>
            <Link to="/apply" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors">
              Apply Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero + Sign-in split ── */}
      <main className="pt-16 min-h-screen flex flex-col lg:flex-row">

        {/* Left — Hero */}
        <div className="flex-1 flex flex-col justify-center px-8 py-16 lg:px-16 xl:px-24 bg-white dark:bg-gray-900 relative overflow-hidden">

          {/* Background decoration */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-brand-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-6 border border-brand-100 dark:border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              AI-Powered Credit Intelligence
            </span>

            <h1 className="text-4xl sm:text-5xl xl:text-title-lg font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Next-Gen{" "}
              <span className="text-brand-500">Corporate</span>{" "}
              Credit Appraisal
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
              Bridge the intelligence gap with AI-driven credit scoring. Analyse financial documents, predict risk, and make smarter lending decisions — in seconds.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {[
                { value: "98%", label: "Accuracy" },
                { value: "3s", label: "Avg. Analysis" },
                { value: "10K+", label: "Reports Generated" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Dashboard CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl shadow-theme-sm transition-all hover:shadow-theme-md"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
                Apply for Credit
              </Link>
              <a href="#how" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors">
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Right — Sign-in card */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex items-center justify-center px-8 py-16 bg-gray-50 dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800">
          <div className="w-full max-w-sm">

            {/* Card header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your Credify account</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {isAuthenticated
                  ? `Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`
                  : "Welcome back"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isAuthenticated
                  ? "Your account is already active. Continue to the dashboard when you're ready."
                  : "Sign in to your CreditAI account"}
              </p>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M18.75 10.19c0-.72-.06-1.25-.19-1.79H10.18v3.25h4.92c-.1.81-.64 2.02-1.83 2.84l2.65 2.01c1.69-1.53 2.66-3.77 2.66-6.43-.01 0-.01 0-.01 0z" fill="#4285F4"/>
                  <path d="M10.18 18.75c2.41 0 4.43-.78 5.91-2.12l-2.65-2.01c-.75.51-1.76.87-3.09.87-2.36 0-4.37-1.53-5.08-3.63l-2.76 2.09C3.67 16.79 6.69 18.75 10.18 18.75z" fill="#34A853"/>
                  <path d="M5.1 11.73c-.19-.54-.3-1.12-.3-1.73s.11-.19.3-1.73L2.34 6.07A8.74 8.74 0 0 0 1.25 10c0 1.41.34 2.74.94 3.93l2.91-2.2z" fill="#FBBC05"/>
                  <path d="M10.18 4.63c1.68 0 2.81.71 3.45 1.3l2.52-2.41C14.6 2.12 12.59 1.25 10.18 1.25 6.69 1.25 3.67 3.21 2.2 6.07l2.76 2.09c.72-2.11 2.72-3.53 5.22-3.53z" fill="#EB4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <svg width="18" height="18" viewBox="0 0 21 20" fill="currentColor">
                  <path d="M15.67 1.875H18.43L12.4 8.758l7.085 9.367h-5.547l-4.345-5.681-4.972 5.681H1.867l6.442-7.362L1.512 1.875h5.688l3.928 5.192 4.542-5.192zm-1.967 14.6h1.527L6.37 3.438H4.731l8.972 13.037z"/>
                </svg>
                X / Twitter
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-gray-400 bg-gray-50 dark:bg-gray-950">or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-error-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword
                      ? <EyeIcon className="size-5 fill-gray-500" />
                      : <EyeCloseIcon className="size-5 fill-gray-500" />
                    }
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Keep me logged in</span>
                </label>
                <a href="#" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium">
                  Forgot password?
                </a>
              </div>

              {errorMessage ? (
                <p className="text-sm text-error-500">{errorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isAuthenticated}
                className="w-full h-11 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors shadow-theme-xs hover:shadow-theme-sm"
              >
                {isAuthenticated
                  ? "Already signed in"
                  : isSubmitting
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* ── Features strip ── */}
      <section id="how" className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-10">
            What Credify does for you
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                ),
                title: "Automated Appraisal",
                desc: "Upload financial documents and get a full credit appraisal report in under 5 seconds.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                ),
                title: "Predictive Scoring",
                desc: "ML models trained on thousands of corporate credit profiles predict default risk accurately.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                ),
                title: "Real-time Insights",
                desc: "Live dashboard with alerts, trends, and portfolio-level risk monitoring.",
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Credify</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Team Async · ADYPU Hackathon · Problem Statement #7</p>
          <Link to="/dashboard" className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Open Dashboard →
          </Link>
        </div>
      </footer>

    </div>
  );
}
