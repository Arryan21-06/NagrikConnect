import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
const C = {
  saffron: "#e8621a",
  saffronLight: "rgba(232,98,26,0.10)",
  saffronBorder: "rgba(232,98,26,0.25)",
  saffronShadow: "rgba(232,98,26,0.35)",
  green: "#1a7a4a",
  greenLight: "rgba(26,122,74,0.10)",
  blue: "#1a4a8a",
  ink: "#0d0f14",
  paper: "#f5f2ec",
  light: "#faf8f4",
  muted: "#6b6560",
  border: "#e0dbd2",
};

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { font-family: 'DM Sans', sans-serif; background: ${C.paper}; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes floatDot {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-7px); }
      }
      @keyframes pulseRing {
        0%,100% { box-shadow: 0 0 0 0   rgba(232,98,26,0.35); }
        50%     { box-shadow: 0 0 0 10px rgba(232,98,26,0); }
      }

      .anim-fade-up  { animation: fadeUp 0.65s ease both; }
      .anim-fade-in  { animation: fadeIn 0.45s ease both; }
      .d1 { animation-delay: 0.07s; }
      .d2 { animation-delay: 0.14s; }
      .d3 { animation-delay: 0.21s; }
      .d4 { animation-delay: 0.28s; }
      .d5 { animation-delay: 0.35s; }

      input:-webkit-autofill,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0 1000px ${C.light} inset !important;
        -webkit-text-fill-color: ${C.ink} !important;
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

// ── Input field ───────────────────────────────────────────────
function InputField({ label, type = "text", placeholder, value, onChange, icon, rightEl, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-5">
      <label
        className="block text-xs font-bold uppercase tracking-widest mb-1.5"
        style={{ color: C.muted }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
            style={{ color: focused ? C.saffron : C.muted, transition: "color 0.2s" }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl text-sm outline-none transition-all"
          style={{
            padding: `0.75rem ${rightEl ? "2.8rem" : "0.95rem"} 0.75rem ${icon ? "2.5rem" : "0.95rem"}`,
            border: `1.5px solid ${error ? C.saffron : focused ? C.saffron : C.border}`,
            background: focused ? "white" : C.light,
            color: C.ink,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: focused ? `0 0 0 3px ${C.saffronLight}` : "none",
          }}
        />
        {rightEl && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none">
            {rightEl}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1.5 font-semibold flex items-center gap-1" style={{ color: C.saffron }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

// ── Left branding panel ───────────────────────────────────────
function LeftPanel() {
  const mockComplaints = [
    { dot: C.saffron, text: "Pothole on MG Road, Andheri",  badge: "New",      bg: C.saffronLight,              color: C.saffron },
    { dot: C.green,   text: "Water leak, Koramangala",       badge: "Resolved", bg: C.greenLight,                color: C.green   },
    { dot: "#d4a017", text: "Broken streetlight, Dadar",     badge: "Pending",  bg: "rgba(212,160,23,0.10)",     color: "#a07800" },
    { dot: C.blue,    text: "Park encroachment, Sector 18",  badge: "Verified", bg: "rgba(26,74,138,0.10)",      color: C.blue    },
  ];

  return (
    <div
      className="relative flex flex-col justify-between p-10 overflow-hidden"
      style={{ background: C.ink, minHeight: "100vh" }}
    >
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 65% 55% at 25% 35%, rgba(232,98,26,0.13) 0%, transparent 65%),
                     radial-gradient(ellipse 45% 40% at 85% 75%, rgba(26,74,138,0.10) 0%, transparent 60%)`,
      }} />

      {/* Logo */}
      <div className="relative z-10 anim-fade-in">
        <div className="font-black text-2xl tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif", color: C.paper }}>
          Nagrik<span style={{ color: C.saffron }}>Connect</span>
        </div>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase rounded-full px-3 py-1.5"
          style={{ background: C.saffronLight, color: C.saffron, border: `1px solid ${C.saffronBorder}` }}
        >
          🇮🇳 AI for Bharat Hackathon 2025
        </div>
      </div>

      {/* Main copy */}
      <div className="relative z-10 my-auto py-10">
        <h2
          className="font-black leading-none tracking-tight mb-4"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem,3vw,2.8rem)", color: C.paper }}
        >
          Good to have<br />you <span style={{ color: C.saffron }}>back.</span>
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(245,242,236,0.52)", maxWidth: 300 }}>
          Sign in and continue making a difference in your community through AI-powered civic action.
        </p>

        {/* Stats row */}
        <div className="flex gap-6 mb-8">
          {[
            { num: "1.5Cr+", lbl: "Complaints filed" },
            { num: "22+",    lbl: "Languages" },
            { num: "~60%",   lbl: "Faster routing" },
          ].map(s => (
            <div key={s.lbl}>
              <div className="font-black text-xl" style={{ fontFamily: "'Syne', sans-serif", color: C.saffron }}>{s.num}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(245,242,236,0.40)" }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Live feed card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 320 }}
        >
          <div className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "rgba(245,242,236,0.55)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: C.green, animation: "floatDot 2s ease-in-out infinite" }} />
            Live Complaint Activity
          </div>
          {mockComplaints.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 text-xs"
              style={{ borderBottom: i < mockComplaints.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              <div className="flex-1 font-medium" style={{ color: "rgba(245,242,236,0.72)" }}>{c.text}</div>
              <div className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: c.bg, color: c.color }}>{c.badge}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-xs" style={{ color: "rgba(245,242,236,0.28)" }}>
        Team UNIQUEBRAINS · Mudit Bansal · AWS Hackathon 2025
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────
export default function LoginPage({ onNavigateSignup }) {
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [remember, setRemember] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.password)
      e.password = "Password is required";
    return e;
  }
// <---------------------------------------Req to backend fro login --------------------->
  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1700);
    try{
      const res = fetch("http://localhost:5004/user/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
        credentials:"include"
      })
    }catch(err){
      console.log.error(err);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  // ── Success screen ────────────────────────────────────────
  if (done) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
          <div className="text-center anim-fade-up" style={{ maxWidth: 400, padding: "2rem" }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ background: C.greenLight, border: `2px solid ${C.green}`, animation: "pulseRing 2s ease-in-out infinite" }}
            >
              ✅
            </div>
            <h3
              className="font-black text-3xl mb-3"
              style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}
            >
              Welcome back!
            </h3>
            <p className="text-sm mb-2 font-medium" style={{ color: C.muted }}>
              Signed in as <strong style={{ color: C.ink }}>{form.email}</strong>
            </p>
            <p className="text-xs mb-8" style={{ color: C.muted }}>
              Redirecting you to your dashboard…
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setDone(false); setForm({ email: "", password: "" }); }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: `1.5px solid ${C.border}`, color: C.ink, background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.light; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                ← Back to Login
              </button>
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: C.saffron, boxShadow: `0 4px 16px ${C.saffronShadow}` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="flex min-h-screen" style={{ background: C.paper }}>

        {/* Left panel */}
        <div className="hidden lg:flex w-2/5 flex-shrink-0">
          <LeftPanel />
        </div>

        {/* Right — form */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-8 py-5 lg:px-12"
            style={{ borderBottom: `1px solid ${C.border}` }}
          >
            {/* Mobile logo */}
            <div className="font-black text-lg tracking-tight lg:hidden" style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}>
              Nagrik<span style={{ color: C.saffron }}>Connect</span>
            </div>
            <div className="ml-auto">
              <span className="text-sm" style={{ color: C.muted }}>Don't have an account?</span>{" "}
              <button
                onClick={onNavigateSignup}
                className="text-sm font-bold transition-colors"
                style={{ color: C.saffron, background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Sign Up →
              </button>
            </div>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16">
            <div className="w-full" style={{ maxWidth: 440 }}>

              {/* Heading */}
              <div className="mb-8 anim-fade-up">
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-4"
                  style={{ background: C.saffronLight, color: C.saffron, border: `1px solid ${C.saffronBorder}` }}
                >
                  🔐 Secure Sign In
                </div>
                <h2
                  className="font-black text-4xl tracking-tight mb-2"
                  style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}
                >
                  Welcome Back
                </h2>
                <p className="text-sm" style={{ color: C.muted }}>
                  Sign in to track and manage your civic complaints.
                </p>
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6 anim-fade-up d1">
                {[
                  { icon: "🟢", label: "Continue with Google" },
                  { icon: "📱", label: "Continue with Phone"  },
                ].map(b => (
                  <button
                    key={b.label}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{ border: `1.5px solid ${C.border}`, background: C.light, color: C.ink }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.saffron; e.currentTarget.style.background = C.saffronLight; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.background = C.light; }}
                  >
                    {b.icon} {b.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6 anim-fade-up d1">
                <div className="flex-1 h-px" style={{ background: C.border }} />
                <span className="text-xs font-medium" style={{ color: C.muted }}>or continue with email</span>
                <div className="flex-1 h-px" style={{ background: C.border }} />
              </div>

              {/* Email */}
              <div className="anim-fade-up d2" onKeyDown={handleKeyDown}>
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon="✉️"
                  value={form.email}
                  onChange={set("email")}
                  error={errors.email}
                />
              </div>

              {/* Password */}
              <div className="anim-fade-up d3" onKeyDown={handleKeyDown}>
                <InputField
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
                  icon="🔒"
                  value={form.password}
                  onChange={set("password")}
                  error={errors.password}
                  rightEl={
                    <span
                      onClick={() => setShowPass(p => !p)}
                      className="text-sm"
                      style={{ color: C.muted }}
                    >
                      {showPass ? "🙈" : "👁️"}
                    </span>
                  }
                />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mb-6 anim-fade-up d3">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(p => !p)}>
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{
                      background: remember ? C.saffron : "white",
                      border: `1.5px solid ${remember ? C.saffron : C.border}`,
                      boxShadow: remember ? `0 0 0 3px ${C.saffronLight}` : "none",
                    }}
                  >
                    {remember && <span className="text-white font-bold" style={{ fontSize: 11 }}>✓</span>}
                  </div>
                  <span className="text-xs font-medium" style={{ color: C.muted }}>Remember me</span>
                </label>
                <button
                  className="text-xs font-semibold"
                  style={{ color: C.saffron, background: "none", border: "none", cursor: "pointer" }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 anim-fade-up d4"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  background: loading ? `${C.saffron}90` : C.saffron,
                  boxShadow: loading ? "none" : `0 4px 20px ${C.saffronShadow}`,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 28px ${C.saffronShadow}`; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${C.saffronShadow}`; }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                    Signing In…
                  </>
                ) : "Sign In →"}
              </button>

              {/* Privacy note */}
              <div
                className="flex items-start gap-3 p-3.5 rounded-xl mt-5 anim-fade-up d5"
                style={{ background: C.saffronLight, border: `1px solid ${C.saffronBorder}` }}
              >
                <span className="text-base flex-shrink-0 mt-0.5">🔐</span>
                <p className="text-xs leading-relaxed" style={{ color: C.saffron }}>
                  Protected under India's DPDP Act 2023. We never sell or share your personal information.
                </p>
              </div>

              {/* Sign up link */}
              <Link to="/signup">
                <p className="text-center text-sm mt-6 anim-fade-up d5" style={{ color: C.muted }}>
                  Don't have an account?{" "}
                  <button
                    onClick={onNavigateSignup}
                    className="font-bold"
                    style={{ color: C.saffron, background: "none", border: "none", cursor: "pointer" }}
                >
                  Create one free →
                </button>
              </p>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-8 py-4 text-center text-xs"
            style={{ borderTop: `1px solid ${C.border}`, color: C.muted }}
          >
            © 2025 NagrikConnect · Built for{" "}
            <strong style={{ color: C.ink }}>AI for Bharat Hackathon</strong> · Team UNIQUEBRAINS
          </div>
        </div>
      </div>
    </>
  );
}