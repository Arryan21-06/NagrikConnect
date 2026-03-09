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
    blueLight: "rgba(26,74,138,0.10)",
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
      @keyframes confettiFall {
        0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
        100% { transform: translateY(80px)  rotate(360deg); opacity: 0; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.5); opacity: 0; }
        to   { transform: scale(1);   opacity: 1; }
      }

      .anim-fade-up { animation: fadeUp 0.65s ease both; }
      .anim-fade-in { animation: fadeIn 0.45s ease both; }
      .d1 { animation-delay: 0.07s; }
      .d2 { animation-delay: 0.14s; }
      .d3 { animation-delay: 0.21s; }
      .d4 { animation-delay: 0.28s; }
      .d5 { animation-delay: 0.35s; }
      .d6 { animation-delay: 0.42s; }

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
function InputField({ label, type = "text", placeholder, value, onChange, icon, rightEl, error, hint }) {
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
            {hint && !error && (
                <p className="text-xs mt-1.5" style={{ color: C.muted }}>{hint}</p>
            )}
        </div>
    );
}

// ── Password strength meter ───────────────────────────────────
function PasswordStrength({ password }) {
    if (!password) return null;
    const checks = [
        { label: "8+ characters", pass: password.length >= 8 },
        { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
        { label: "Number", pass: /[0-9]/.test(password) },
        { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.pass).length;
    const meta = [
        { label: "Too short", color: C.saffron },
        { label: "Weak", color: C.saffron },
        { label: "Fair", color: "#f59e0b" },
        { label: "Good", color: "#84cc16" },
        { label: "Strong ✓", color: C.green },
    ];

    return (
        <div className="mb-5 -mt-3 px-0.5">
            {/* Bar */}
            <div className="flex gap-1.5 mb-2">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-400"
                        style={{ background: i <= score ? meta[score].color : C.border }}
                    />
                ))}
            </div>
            {/* Label + checklist */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: meta[score].color }}>
                    {meta[score].label}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {checks.map(c => (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs" style={{ color: c.pass ? C.green : C.muted }}>
                        <span>{c.pass ? "✓" : "○"}</span>
                        {c.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Left branding panel ───────────────────────────────────────
function LeftPanel() {
    const perks = [
        { icon: "🗣️", text: "Report in 22+ Indian languages" },
        { icon: "📍", text: "AI auto-detects location & routes complaint" },
        { icon: "📊", text: "Track status on live public dashboards" },
        { icon: "🔁", text: "Automatic escalation if ignored" },
        { icon: "⭐", text: "Build civic trust score over time" },
    ];

    return (
        <div
            className="relative flex flex-col justify-between p-10 overflow-hidden"
            style={{ background: C.ink, minHeight: "100vh" }}
        >
            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.18]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
                backgroundSize: "52px 52px",
            }} />
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(ellipse 65% 55% at 20% 30%, rgba(232,98,26,0.14) 0%, transparent 65%),
                     radial-gradient(ellipse 50% 45% at 85% 80%, rgba(26,74,138,0.11) 0%, transparent 60%)`,
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
                    Your voice.<br />
                    <span style={{ color: C.saffron }}>Your city.</span><br />
                    Your power.
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(245,242,236,0.52)", maxWidth: 310 }}>
                    Join thousands of citizens using AI to cut through red tape and get real civic issues fixed faster.
                </p>

                {/* Perks */}
                <div className="flex flex-col gap-3 mb-8">
                    {perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                style={{ background: C.saffronLight, border: `1px solid ${C.saffronBorder}` }}
                            >
                                {p.icon}
                            </div>
                            <span className="text-sm" style={{ color: "rgba(245,242,236,0.70)" }}>{p.text}</span>
                        </div>
                    ))}
                </div>

                {/* Social proof */}
                <div
                    className="flex items-center gap-3 rounded-xl p-3.5"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 320 }}
                >
                    <div className="flex -space-x-2 flex-shrink-0">
                        {["🧑", "👩", "👨", "🧕"].map((a, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2"
                                style={{ background: C.ink, borderColor: C.ink }}
                            >
                                {a}
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="text-xs font-bold" style={{ color: C.paper }}>12,400+ citizens joined</div>
                        <div className="text-xs" style={{ color: "rgba(245,242,236,0.45)" }}>across 18 Indian cities</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-xs" style={{ color: "rgba(245,242,236,0.28)" }}>
                Team UNIQUEBRAINS · Mudit Bansal · AWS Hackathon 2025
            </div>
        </div>
    );
}

// ── Signup Page ───────────────────────────────────────────────
export default function SignupPage({ onNavigateLogin }) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [agree, setAgree] = useState(false);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    function validate() {
        const e = {};
        if (!form.username.trim())
            e.username = "Username is required";
        else if (form.username.length < 3)
            e.username = "Minimum 3 characters";
        else if (/\s/.test(form.username))
            e.username = "No spaces allowed";

        if (!form.email.trim())
            e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Enter a valid email address";

        if (!form.password)
            e.password = "Password is required";
        else if (form.password.length < 8)
            e.password = "Minimum 8 characters";

        if (!form.confirm)
            e.confirm = "Please confirm your password";
        else if (form.confirm !== form.password)
            e.confirm = "Passwords don't match";

        if (!agree)
            e.agree = "You must accept the terms to continue";

        return e;
    }

    function handleSubmit() {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); setDone(true); }, 1900);
        try {
            const res = fetch("http://localhost:5004/user/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include"
            }
            )
        } catch (err) {
            console.error("Signup error:", err);
        }
    }

    // ── Success screen ────────────────────────────────────────
    if (done) {
        const confettiColors = [C.saffron, C.green, C.blue, "#d4a017", "#e84f6b"];
        return (
            <>
                <GlobalStyles />
                <div className="min-h-screen flex items-center justify-center overflow-hidden relative" style={{ background: C.paper }}>
                    {/* Confetti */}
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-sm pointer-events-none"
                            style={{
                                left: `${10 + i * 5.5}%`,
                                top: "10%",
                                background: confettiColors[i % confettiColors.length],
                                animation: `confettiFall ${1.2 + (i % 4) * 0.3}s ${i * 0.08}s ease-in forwards`,
                            }}
                        />
                    ))}

                    <div className="text-center relative z-10" style={{ maxWidth: 420, padding: "2rem" }}>
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
                            style={{ background: C.greenLight, border: `2px solid ${C.green}`, animation: "scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both" }}
                        >
                            🎉
                        </div>
                        <h3
                            className="font-black text-3xl mb-2 anim-fade-up"
                            style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}
                        >
                            Welcome, {form.username}!
                        </h3>
                        <p className="text-sm mb-1 font-medium anim-fade-up d1" style={{ color: C.muted }}>
                            Account created for <strong style={{ color: C.ink }}>{form.email}</strong>
                        </p>
                        <p className="text-xs mb-8 anim-fade-up d2" style={{ color: C.muted }}>
                            You're now part of India's AI-powered civic movement.
                        </p>

                        {/* Badges */}
                        <div className="flex justify-center gap-3 mb-8 anim-fade-up d3">
                            {["🛡️ Verified Citizen", "⭐ Trust Score: New", "📍 Location Ready"].map(b => (
                                <div key={b} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: C.saffronLight, color: C.saffron, border: `1px solid ${C.saffronBorder}` }}>
                                    {b}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onNavigateLogin}
                            className="px-10 py-3.5 rounded-xl font-bold text-white text-base anim-fade-up d4"
                            style={{ fontFamily: "'Syne', sans-serif", background: C.saffron, boxShadow: `0 4px 20px ${C.saffronShadow}` }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            Go to Sign In →
                        </button>
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
                <div className="flex-1 flex flex-col overflow-y-auto">
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
                            <span className="text-sm" style={{ color: C.muted }}>Already have an account?</span>{" "}
                            <button
                                onClick={onNavigateLogin}
                                className="text-sm font-bold"
                                style={{ color: C.saffron, background: "none", border: "none", cursor: "pointer" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >
                                Sign In →
                            </button>
                        </div>
                    </div>

                    {/* Form area */}
                    <div className="flex-1 flex items-start justify-center px-8 py-10 lg:px-16">
                        <div className="w-full" style={{ maxWidth: 440 }}>

                            {/* Heading */}
                            <div className="mb-7 anim-fade-up">
                                <div
                                    className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-4"
                                    style={{ background: C.saffronLight, color: C.saffron, border: `1px solid ${C.saffronBorder}` }}
                                >
                                    ✨ Free to Join
                                </div>
                                <h2
                                    className="font-black text-4xl tracking-tight mb-2"
                                    style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}
                                >
                                    Create Account
                                </h2>
                                <p className="text-sm" style={{ color: C.muted }}>
                                    Join thousands filing smarter civic complaints across India.
                                </p>
                            </div>

                            {/* Social buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-6 anim-fade-up d1">
                                {[
                                    { icon: "🟢", label: "Sign up with Google" },
                                    { icon: "📱", label: "Sign up with Phone" },
                                ].map(b => (
                                    <button
                                        key={b.label}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                                        style={{ border: `1.5px solid ${C.border}`, background: C.light, color: C.ink }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.saffron; e.currentTarget.style.background = C.saffronLight; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.light; }}
                                    >
                                        {b.icon} {b.label}
                                    </button>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6 anim-fade-up d1">
                                <div className="flex-1 h-px" style={{ background: C.border }} />
                                <span className="text-xs font-medium" style={{ color: C.muted }}>or sign up with email</span>
                                <div className="flex-1 h-px" style={{ background: C.border }} />
                            </div>

                            {/* ── Username ── */}
                            <div className="anim-fade-up d2">
                                <InputField
                                    label="Username"
                                    placeholder="e.g. priya_sharma"
                                    icon="👤"
                                    value={form.username}
                                    onChange={set("username")}
                                    error={errors.username}
                                    hint="3–20 characters, no spaces"
                                />
                            </div>

                            {/* ── Email ── */}
                            <div className="anim-fade-up d3">
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

                            {/* ── Password ── */}
                            <div className="anim-fade-up d4">
                                <InputField
                                    label="Password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Min. 8 characters"
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
                                <PasswordStrength password={form.password} />
                            </div>

                            {/* ── Confirm Password ── */}
                            <div className="anim-fade-up d5">
                                <InputField
                                    label="Confirm Password"
                                    type={showConf ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    icon="🔒"
                                    value={form.confirm}
                                    onChange={set("confirm")}
                                    error={errors.confirm}
                                    rightEl={
                                        <span
                                            onClick={() => setShowConf(p => !p)}
                                            className="text-sm"
                                            style={{ color: C.muted }}
                                        >
                                            {showConf ? "🙈" : "👁️"}
                                        </span>
                                    }
                                />
                            </div>

                            {/* ── Terms ── */}
                            <div className="mb-5 anim-fade-up d5">
                                <label className="flex items-start gap-3 cursor-pointer" onClick={() => setAgree(p => !p)}>
                                    <div
                                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                                        style={{
                                            background: agree ? C.saffron : "white",
                                            border: `1.5px solid ${errors.agree ? C.saffron : agree ? C.saffron : C.border}`,
                                            boxShadow: agree ? `0 0 0 3px ${C.saffronLight}` : "none",
                                        }}
                                    >
                                        {agree && <span className="text-white font-bold" style={{ fontSize: 11 }}>✓</span>}
                                    </div>
                                    <span className="text-xs leading-relaxed" style={{ color: C.muted }}>
                                        I agree to the{" "}
                                        <span className="font-bold cursor-pointer" style={{ color: C.saffron }}>Terms of Service</span>{" "}
                                        and{" "}
                                        <span className="font-bold cursor-pointer" style={{ color: C.saffron }}>Privacy Policy</span>.
                                        My data is protected under India's DPDP Act 2023.
                                    </span>
                                </label>
                                {errors.agree && (
                                    <p className="text-xs mt-1.5 font-semibold flex items-center gap-1" style={{ color: C.saffron }}>
                                        ⚠ {errors.agree}
                                    </p>
                                )}
                            </div>

                            {/* ── Submit ── */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 anim-fade-up d6"
                                style={{
                                    fontFamily: "'Syne', sans-serif",
                                    background: loading ? `${C.saffron}90` : C.saffron,
                                    boxShadow: loading ? "none" : `0 4px 20px ${C.saffronShadow}`,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 28px ${C.saffronShadow}`; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${C.saffronShadow}`; }}
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin 0.7s linear infinite" }} />
                                        Creating Account…
                                    </>
                                ) : "Create Account →"}
                            </button>

                            {/* Sign in link */}
                            <Link to="/login">
                                <p className="text-center text-sm mt-6 anim-fade-up d6" style={{ color: C.muted }}>
                                    Already have an account?{" "}
                                    <button
                                        onClick={onNavigateLogin}
                                        className="font-bold"
                                        style={{ color: C.saffron, background: "none", border: "none", cursor: "pointer" }}
                                    >
                                        Sign In
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