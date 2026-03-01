import { useState, useEffect, useRef } from "react";

// ── Brand tokens ──────────────────────────────────────────────
const C = {
  saffron: "#e8621a",
  saffronLight: "rgba(232,98,26,0.10)",
  saffronBorder: "rgba(232,98,26,0.25)",
  saffronShadow: "rgba(232,98,26,0.35)",
  green: "#1a7a4a",
  greenLight: "rgba(26,122,74,0.10)",
  blue: "#1a4a8a",
  blueLight: "rgba(26,74,138,0.10)",
  gold: "#d4a017",
  goldLight: "rgba(212,160,23,0.10)",
  ink: "#0d0f14",
  paper: "#f5f2ec",
  light: "#faf8f4",
  muted: "#6b6560",
  border: "#e0dbd2",
  borderDark: "rgba(255,255,255,0.08)",
};

// ── Seed data ─────────────────────────────────────────────────
const SEED_COMPLAINTS = [
  { id: "NC-2025-11042", lat: 28.6139, lng: 77.209,  title: "🕳️ Pothole on Rajpath",           status: "verified", dept: "PWD",    area: "New Delhi",       ago: "2 hrs ago" },
  { id: "NC-2025-28731", lat: 19.0556, lng: 72.8295, title: "🗑️ Garbage overflow near Station", status: "new",      dept: "BMC",    area: "Bandra, Mumbai",  ago: "4 hrs ago" },
  { id: "NC-2025-39154", lat: 12.9716, lng: 77.5946, title: "💡 Broken Streetlight on MG Road", status: "resolved", dept: "BESCOM", area: "Bengaluru",        ago: "1 day ago" },
];

const FEATURES = [
  { icon: "🗣️", title: "Multilingual Voice Reporting",    desc: "File complaints in Hindi, Tamil, Bengali, Telugu and 10+ regional languages. No typing needed." },
  { icon: "🤖", title: "AI Complaint Understanding",       desc: "NLP extracts category, location, severity from unstructured input. Citizens don't pick departments." },
  { icon: "🖼️", title: "Image Verification",              desc: "Metadata analysis + reverse similarity + edit anomaly detection catches fabricated evidence." },
  { icon: "📍", title: "Geofenced Duplicate Detection",    desc: "Clusters similar complaints within a 15-metre geofence to prevent spam flooding the system." },
  { icon: "⭐", title: "Civic Trust Scoring",              desc: "Dynamic trust scores adjust based on reporting history. Reliable citizens get faster processing." },
  { icon: "🔁", title: "Smart Escalation",                 desc: "72 hr → 7-day → 14-day escalation ladder. Departments must give reasons for rejections." },
  { icon: "📊", title: "Transparency Dashboards",          desc: "Public hotspot maps, authority performance metrics, verified vs unverified resolution tracking." },
  { icon: "📱", title: "SMS / WhatsApp Fallback",          desc: "Works without internet. Ensures access for rural and low-bandwidth regions across India." },
  { icon: "👥", title: "Community Verification",           desc: "Suspicious reports trigger neighbourhood validation — turning citizens into watchdogs." },
];

const STEPS = [
  { n: 1, title: "Citizen Submits",  desc: "Voice, text, image via WhatsApp, SMS, or web" },
  { n: 2, title: "AI Normalises",    desc: "Language translation, entity extraction, classification" },
  { n: 3, title: "Verification",     desc: "Image auth, GPS check, duplicate geofence scan" },
  { n: 4, title: "Trust Scoring",    desc: "AI assigns confidence + routes based on user history" },
  { n: 5, title: "Smart Routing",    desc: "Correct dept auto-assigned — no citizen input needed" },
  { n: 6, title: "SLA Tracking",     desc: "Deadlines enforced with automatic escalation ladder" },
  { n: 7, title: "Transparency",     desc: "Status visible to citizen, public dashboard updated" },
  { n: 8, title: "Closure",          desc: "Hybrid passive + active closure with citizen confirmation" },
];

const CATEGORIES = [
  { emoji: "🕳️", label: "Pothole",      dept: "Public Works Dept (PWD)" },
  { emoji: "💡", label: "Streetlight",   dept: "Municipal Electricity Board" },
  { emoji: "🗑️", label: "Garbage",      dept: "Municipal Corporation" },
  { emoji: "💧", label: "Water",         dept: "Jal Board" },
  { emoji: "🌳", label: "Parks",         dept: "Horticulture Dept" },
  { emoji: "🚧", label: "Road",          dept: "Public Works Dept (PWD)" },
  { emoji: "🏚️", label: "Encroachment", dept: "Town Planning Dept" },
  { emoji: "⚡", label: "Electricity",   dept: "State Electricity Board" },
];

const STATUS_STYLE = {
  new:      { bg: C.saffronLight, color: C.saffron },
  verified: { bg: C.blueLight,    color: C.blue    },
  resolved: { bg: C.greenLight,   color: C.green   },
  pending:  { bg: C.goldLight,    color: "#a07800" },
};

// ── Tiny reusable helpers ─────────────────────────────────────
function SectionTag({ children }) {
  return (
    <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.saffron }}>
      {children}
    </span>
  );
}

function SectionTitle({ children, light }) {
  return (
    <h2
      className="font-black leading-none tracking-tight mb-4"
      style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem,4vw,3rem)", color: light ? C.paper : C.ink }}
    >
      {children}
    </h2>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.new;
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar({ onPortalClick }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 transition-all"
      style={{
        background: scrolled ? "rgba(245,242,236,0.94)" : "rgba(245,242,236,0.80)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div className="font-black text-xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}>
        Nagrik<span style={{ color: C.saffron }}>Connect</span>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <a href="#features" className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: C.ink, textDecoration: "none" }}>Features</a>
        <a href="#how"      className="text-sm font-medium transition-colors hover:opacity-70" style={{ color: C.ink, textDecoration: "none" }}>How It Works</a>
        <button
          onClick={onPortalClick}
          className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
          style={{ background: C.ink, color: C.paper }}
          onMouseEnter={e => { e.currentTarget.style.background = C.saffron; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.ink; }}
        >
          File a Complaint →
        </button>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero({ onPortalClick }) {
  return (
    <section
      id="hero"
      className="min-h-screen grid gap-12 items-center pt-28 pb-16 px-10 relative overflow-hidden"
      style={{ gridTemplateColumns: "1fr 1fr", background: C.paper }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 50% at 80% 50%, rgba(232,98,26,0.07) 0%, transparent 70%),
                     radial-gradient(ellipse 40% 60% at 10% 80%, rgba(26,74,138,0.06) 0%, transparent 60%)`,
      }} />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{
        backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Left */}
      <div className="relative z-10" style={{ animation: "fadeUp 0.8s ease both" }}>
        <div
          className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase rounded-full px-3 py-1.5 mb-6"
          style={{ background: C.saffronLight, color: C.saffron, border: `1px solid ${C.saffronBorder}` }}
        >
          🇮🇳 AI for Bharat Hackathon 2025
        </div>
        <h1
          className="font-black leading-none tracking-tight mb-6"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.8rem,5vw,4.5rem)", color: C.ink }}
        >
          Civic Access<br />
          <span style={{ color: C.saffron }}>Reimagined</span><br />
          for India
        </h1>
        <p className="text-base leading-relaxed mb-8 max-w-xl" style={{ color: C.muted }}>
          NagrikConnect converts unstructured citizen input — voice, text, image — into verified, routed, and trackable governance actions. No forms. No jargon. No barriers.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onPortalClick}
            className="px-7 py-3.5 rounded-lg font-bold text-white text-base transition-all"
            style={{ background: C.saffron, boxShadow: `0 4px 20px ${C.saffronShadow}` }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${C.saffronShadow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";   e.currentTarget.style.boxShadow = `0 4px 20px ${C.saffronShadow}`; }}
          >
            File a Complaint →
          </button>
          <a
            href="#features"
            className="px-7 py-3.5 rounded-lg font-bold text-base transition-all"
            style={{ border: `1.5px solid ${C.border}`, color: C.ink, textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.ink; e.currentTarget.style.color = C.paper; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.ink; }}
          >
            Explore Features
          </a>
        </div>
        {/* Stats */}
        <div className="flex gap-8 mt-10 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
          {[
            { num: "1.5Cr+", lbl: "Civic complaints/year" },
            { num: "~30%",   lbl: "Currently resolved" },
            { num: "60%",    lbl: "Duplicate reduction" },
          ].map(s => (
            <div key={s.lbl}>
              <div className="font-black text-2xl" style={{ fontFamily: "'Syne', sans-serif", color: C.saffron }}>{s.num}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: C.muted }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right – preview card */}
      <div className="relative z-10 hidden md:flex justify-center" style={{ animation: "fadeUp 0.8s 0.2s ease both" }}>
        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  const rows = [
    { dot: C.saffron, text: "Pothole on MG Road, Andheri",    badge: "New",       badgeBg: C.saffronLight, badgeColor: C.saffron },
    { dot: C.gold,    text: "Broken streetlight, Dadar",       badge: "In Review", badgeBg: C.goldLight,    badgeColor: "#a07800" },
    { dot: C.green,   text: "Garbage overflow, Bandra West",   badge: "Resolved",  badgeBg: C.greenLight,   badgeColor: C.green   },
    { dot: C.gold,    text: "Water pipe leak, Kurla",          badge: "Routed",    badgeBg: C.goldLight,    badgeColor: "#a07800" },
  ];
  return (
    <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: C.saffronLight }}>📍</div>
        <div>
          <div className="font-bold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>Live Complaint Map</div>
          <div className="text-xs" style={{ color: C.muted }}>Mumbai Region • Today</div>
        </div>
      </div>
      {/* Mini map */}
      <div className="rounded-xl mb-4 relative overflow-hidden flex items-center justify-center" style={{ height: 120, background: "linear-gradient(135deg,#e8f4e8,#d4ebd4)" }}>
        <div className="relative" style={{ width: 32, height: 32, background: C.saffron, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", boxShadow: `0 4px 12px ${C.saffronShadow}`, animation: "pulsePin 2s ease-in-out infinite" }}>
          <div className="absolute rounded-full bg-white" style={{ width: 12, height: 12, top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(45deg)" }} />
        </div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3 py-2 text-sm" style={{ borderBottom: i < rows.length - 1 ? `1px solid rgba(0,0,0,0.05)` : "none" }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.dot }} />
          <div className="flex-1 font-medium text-xs" style={{ color: C.ink }}>{r.text}</div>
          <div className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: r.badgeBg, color: r.badgeColor }}>{r.badge}</div>
        </div>
      ))}
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="py-24 px-10" style={{ background: C.ink }}>
      <SectionTag>Why NagrikConnect</SectionTag>
      <SectionTitle light>Built Different.<br />Built for Bharat.</SectionTitle>
      <p className="text-base leading-relaxed max-w-xl mb-12" style={{ color: "rgba(245,242,236,0.55)" }}>
        Every feature is designed around real-world barriers citizens face — not ideal users who are digitally fluent and know government structures.
      </p>
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-xl p-6 transition-all duration-300"
      style={{
        background: hovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? "rgba(232,98,26,0.30)" : "rgba(255,255,255,0.08)"}`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: C.saffronLight }}>
        {icon}
      </div>
      <div className="font-bold text-base mb-2" style={{ fontFamily: "'Syne', sans-serif", color: C.paper }}>{title}</div>
      <div className="text-sm leading-relaxed" style={{ color: "rgba(245,242,236,0.50)" }}>{desc}</div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how" className="py-24 px-10" style={{ background: C.light }}>
      <SectionTag>Process Flow</SectionTag>
      <SectionTitle>How a Complaint Travels</SectionTitle>
      <div className="relative grid gap-8 mt-12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        <div className="absolute h-0.5 left-0 right-0 pointer-events-none" style={{ top: 32, background: `linear-gradient(90deg, transparent, ${C.saffron}, transparent)`, zIndex: 0 }} />
        {STEPS.map(s => <StepCard key={s.n} {...s} />)}
      </div>
    </section>
  );
}

function StepCard({ n, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="text-center relative z-10 px-2" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-4 transition-all duration-300"
        style={{
          fontFamily: "'Syne', sans-serif",
          background: hovered ? C.saffron : C.paper,
          color: hovered ? "white" : C.saffron,
          border: `2px solid ${hovered ? C.saffron : C.border}`,
          transform: hovered ? "scale(1.1)" : "scale(1)",
          boxShadow: hovered ? `0 8px 24px ${C.saffronShadow}` : "none",
        }}
      >
        {n}
      </div>
      <div className="font-bold text-sm mb-1" style={{ fontFamily: "'Syne', sans-serif", color: C.ink }}>{title}</div>
      <div className="text-xs leading-relaxed" style={{ color: C.muted }}>{desc}</div>
    </div>
  );
}

// ── Portal ────────────────────────────────────────────────────
function Portal() {
  const [complaints, setComplaints]     = useState(SEED_COMPLAINTS);
  const [selectedCat, setSelectedCat]   = useState(0);
  const [name, setName]                 = useState("");
  const [desc, setDesc]                 = useState("");
  const [location, setLocation]         = useState("");
  const [severity, setSeverity]         = useState("medium");
  const [locStatus, setLocStatus]       = useState(null); // { type, text }
  const [coords, setCoords]             = useState(null); // { lat, lng, area }
  const [submitting, setSubmitting]     = useState(false);
  const [toast, setToast]               = useState(null);
  const mapRef      = useRef(null);
  const leafletRef  = useRef(null);
  const markerRef   = useRef(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L) { initMap(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  function makeIcon(color) {
    return window.L.divIcon({
      className: "",
      html: `<div style="width:24px;height:24px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px ${color}88;position:relative;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);width:8px;height:8px;background:white;border-radius:50%;"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  }

  function initMap() {
    if (leafletRef.current || !mapRef.current || !window.L) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    leafletRef.current = map;

    // Seed markers
    SEED_COMPLAINTS.forEach(c => {
      const col = c.status === "resolved" ? C.green : c.status === "verified" ? C.blue : C.saffron;
      L.marker([c.lat, c.lng], { icon: makeIcon(col) })
        .addTo(map)
        .bindPopup(`<b>${c.title}</b><br>📍 ${c.area}<br>Dept: ${c.dept}<br>Status: <b>${c.status}</b>`);
    });

    // Click handler
    map.on("click", e => {
      placeMarker(e.latlng.lat, e.latlng.lng, map);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  }

  function placeMarker(lat, lng, mapInstance) {
    const map = mapInstance || leafletRef.current;
    if (!map || !window.L) return;
    if (markerRef.current) map.removeLayer(markerRef.current);
    const m = window.L.marker([lat, lng], { icon: makeIcon(C.saffron), draggable: true })
      .addTo(map)
      .bindPopup("Your complaint location")
      .openPopup();
    m.on("dragend", ev => {
      const pos = ev.target.getLatLng();
      placeMarker(pos.lat, pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });
    markerRef.current = m;
    setCoords(prev => ({ ...prev, lat, lng }));
  }

  function reverseGeocode(lat, lng) {
    setCoords({ lat, lng, area: "Fetching…" });
    setLocation("");
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(r => r.json())
      .then(d => {
        const a = d.address;
        const area = a.suburb || a.neighbourhood || a.town || a.city || a.county || "Unknown Area";
        const city = a.city || a.state_district || a.state || "";
        const display = city ? `${area}, ${city}` : area;
        setCoords({ lat, lng, area: display });
        setLocation(d.display_name.split(",").slice(0, 3).join(",").trim());
      })
      .catch(() => setCoords({ lat, lng, area: `${lat.toFixed(3)}, ${lng.toFixed(3)}` }));
  }

  function detectLocation() {
    setLocStatus({ type: "loading", text: "🔄 Detecting your location…" });
    const fallback = () => {
      const lat = 28.6139 + (Math.random() - 0.5) * 0.05;
      const lng = 77.209  + (Math.random() - 0.5) * 0.05;
      if (leafletRef.current) leafletRef.current.setView([lat, lng], 14);
      placeMarker(lat, lng);
      reverseGeocode(lat, lng);
      setLocStatus({ type: "success", text: "📍 Using approximate location (GPS unavailable)" });
      setTimeout(() => setLocStatus(null), 3000);
    };
    if (!navigator.geolocation) { fallback(); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (leafletRef.current) leafletRef.current.setView([lat, lng], 15);
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
        setLocStatus({ type: "success", text: "✅ Location detected successfully!" });
        setTimeout(() => setLocStatus(null), 3000);
      },
      fallback,
      { timeout: 8000 }
    );
  }

  function focusComplaint(lat, lng) {
    if (!leafletRef.current) return;
    leafletRef.current.setView([lat, lng], 14);
    setCoords(prev => ({ ...prev, lat, lng }));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  }

  function handleSubmit() {
    if (!name.trim() || !desc.trim()) { showToast("⚠️ Please fill in your name and description."); return; }
    if (!coords && !location.trim()) { showToast("📍 Please select a location on the map or use Auto-detect."); return; }
    setSubmitting(true);
    setTimeout(() => {
      const cat  = CATEGORIES[selectedCat];
      const id   = "NC-2025-" + Math.floor(Math.random() * 90000 + 10000);
      const lat  = (coords?.lat) || 28.6 + Math.random() * 0.2;
      const lng  = (coords?.lng) || 77.1 + Math.random() * 0.2;
      if (!markerRef.current) placeMarker(lat, lng);
      if (markerRef.current) markerRef.current.bindPopup(`<b>${cat.emoji} ${cat.label} — ${name}</b><br>📍 ${location || "Detected Location"}<br>Dept: ${cat.dept}<br>ID: ${id}`).openPopup();
      if (leafletRef.current) leafletRef.current.setView([lat, lng], 14);
      setComplaints(prev => [{
        id, lat, lng,
        title: `${cat.emoji} ${desc.substring(0, 40)}${desc.length > 40 ? "…" : ""}`,
        status: "new",
        dept: cat.dept,
        area: location || "Detected Location",
        ago: "Just now",
      }, ...prev]);
      setSubmitting(false);
      setName(""); setDesc("");
      showToast(`✅ Complaint #${id} filed! Routed to ${cat.dept}.`);
    }, 1800);
  }

  const locStatusStyle = {
    loading: { background: C.goldLight,    color: "#a07800" },
    success: { background: C.greenLight,   color: C.green   },
    error:   { background: C.saffronLight, color: C.saffron },
  };

  return (
    <section id="portal" className="py-24 px-10" style={{ background: C.paper }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <SectionTag>Complaint Portal</SectionTag>
          <SectionTitle>File a Complaint</SectionTitle>
          <p className="text-sm mt-1" style={{ color: C.muted }}>Your location is automatically extracted and verified. AI routes it to the right department.</p>
        </div>

        <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
          {/* ── FORM ── */}
          <div className="rounded-2xl p-8" style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              📝 New Complaint
            </h3>

            <FormField label="Your Name">
              <input
                className="w-full rounded-lg text-sm outline-none transition-all"
                style={{ padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, background: C.light, color: C.ink, fontFamily: "inherit" }}
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={e => { e.target.style.borderColor = C.saffron; e.target.style.background = "white"; }}
                onBlur={e  => { e.target.style.borderColor = C.border;   e.target.style.background = C.light; }}
              />
            </FormField>

            <FormField label="Complaint Category">
              <div className="flex flex-wrap gap-2 mt-1">
                {CATEGORIES.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCat(i)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                    style={{
                      background: selectedCat === i ? C.saffron : C.light,
                      color: selectedCat === i ? "white" : C.ink,
                      border: `1.5px solid ${selectedCat === i ? C.saffron : C.border}`,
                    }}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Description">
              <textarea
                className="w-full rounded-lg text-sm outline-none transition-all resize-none"
                style={{ padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, background: C.light, color: C.ink, fontFamily: "inherit", minHeight: 80 }}
                placeholder="Describe the issue in your own words — any language is fine…"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                onFocus={e => { e.target.style.borderColor = C.saffron; e.target.style.background = "white"; }}
                onBlur={e  => { e.target.style.borderColor = C.border;   e.target.style.background = C.light; }}
              />
            </FormField>

            <FormField label="Location">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg text-sm outline-none transition-all"
                  style={{ padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, background: C.light, color: C.ink, fontFamily: "inherit" }}
                  placeholder="Address or click on the map…"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = C.saffron; e.target.style.background = "white"; }}
                  onBlur={e  => { e.target.style.borderColor = C.border;   e.target.style.background = C.light; }}
                />
                <button
                  onClick={detectLocation}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all flex-shrink-0"
                  style={{ background: C.ink }}
                  onMouseEnter={e => e.currentTarget.style.background = C.saffron}
                  onMouseLeave={e => e.currentTarget.style.background = C.ink}
                >
                  📍 Auto
                </button>
              </div>
              {locStatus && (
                <div className="text-xs mt-1.5 px-2.5 py-1.5 rounded" style={locStatusStyle[locStatus.type]}>{locStatus.text}</div>
              )}
            </FormField>

            <FormField label="Severity">
              <select
                className="w-full rounded-lg text-sm outline-none"
                style={{ padding: "0.65rem 0.9rem", border: `1.5px solid ${C.border}`, background: C.light, color: C.ink, fontFamily: "inherit" }}
                value={severity}
                onChange={e => setSeverity(e.target.value)}
              >
                <option value="low">🟡 Low — Minor inconvenience</option>
                <option value="medium">🟠 Medium — Affects daily life</option>
                <option value="high">🔴 High — Safety hazard</option>
                <option value="critical">⚠️ Critical — Emergency</option>
              </select>
            </FormField>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-lg font-bold text-white text-base mt-2 transition-all"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: submitting ? `${C.saffron}99` : C.saffron,
                boxShadow: submitting ? "none" : `0 4px 16px ${C.saffronShadow}`,
                cursor: submitting ? "not-allowed" : "pointer",
                transform: "translateY(0)",
              }}
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${C.saffronShadow}`; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${C.saffronShadow}`; }}
            >
              {submitting ? "🔄 Verifying & Routing…" : "Submit Complaint →"}
            </button>
          </div>

          {/* ── MAP + LIST ── */}
          <div className="flex flex-col gap-5">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <h4 className="font-bold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>📍 Location Map</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: C.greenLight, color: C.green }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green, animation: "pulseDot 1.5s ease-in-out infinite" }} />
                  Live
                </div>
              </div>
              <div ref={mapRef} style={{ height: 260, width: "100%" }} />
              <div className="flex gap-6 px-4 py-2.5 text-xs" style={{ background: C.light, borderTop: `1px solid ${C.border}`, color: C.muted, fontFamily: "monospace" }}>
                <span><strong style={{ color: C.ink }}>Lat:</strong> {coords?.lat?.toFixed(5) ?? "—"}</span>
                <span><strong style={{ color: C.ink }}>Lng:</strong> {coords?.lng?.toFixed(5) ?? "—"}</span>
                <span><strong style={{ color: C.ink }}>Area:</strong> {coords?.area ?? "Tap map or use Auto"}</span>
              </div>
            </div>

            {/* Complaints list */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                <h4 className="font-bold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Complaints</h4>
                <div className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: C.saffron }}>{complaints.length}</div>
              </div>
              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {complaints.map((c, i) => (
                  <div
                    key={c.id}
                    className="px-5 py-3 cursor-pointer transition-colors"
                    style={{ borderBottom: i < complaints.length - 1 ? `1px solid ${C.border}` : "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.light}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                    onClick={() => focusComplaint(c.lat, c.lng)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 font-semibold text-xs" style={{ color: C.ink }}>{c.title}</div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex gap-4 text-xs" style={{ color: C.muted }}>
                      <span>📍 {c.area}</span>
                      <span>{c.ago}</span>
                      <span>{c.dept}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className="fixed bottom-8 right-8 rounded-xl px-5 py-4 flex items-center gap-3 text-sm font-medium max-w-sm z-50 transition-all duration-500"
        style={{
          background: C.ink,
          color: C.paper,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          transform: toast ? "translateY(0)" : "translateY(120px)",
          opacity: toast ? 1 : 0,
          pointerEvents: toast ? "auto" : "none",
        }}
      >
        <span className="text-xl">{toast?.startsWith("⚠️") ? "⚠️" : "✅"}</span>
        <span>{toast?.replace(/^[⚠️✅]\s?/, "")}</span>
      </div>
    </section>
  );
}

function FormField({ label, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{label}</label>
      {children}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-8 text-center text-xs" style={{ background: C.ink, color: "rgba(245,242,236,0.45)" }}>
      <p>Built for <strong style={{ color: C.paper }}>AI for Bharat Hackathon 2025</strong> · Team <strong style={{ color: C.paper }}>UNIQUEBRAINS</strong> · Led by <strong style={{ color: C.paper }}>Mudit Bansal</strong></p>
      <p className="mt-1">Problem Statement: AI for Communities, Access &amp; Public Impact · Powered by AWS</p>
    </footer>
  );
}

// ── Global styles injection ───────────────────────────────────
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { font-family: 'DM Sans', sans-serif; margin: 0; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulsePin {
        0%,100% { box-shadow: 0 4px 12px rgba(232,98,26,0.4), 0 0 0 0 rgba(232,98,26,0.3); }
        50%      { box-shadow: 0 4px 12px rgba(232,98,26,0.4), 0 0 0 12px rgba(232,98,26,0); }
      }
      @keyframes pulseDot {
        0%,100% { opacity:1; transform:scale(1); }
        50%     { opacity:0.5; transform:scale(0.8); }
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  function scrollToPortal() {
    document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <>
      <GlobalStyles />
      <Navbar onPortalClick={scrollToPortal} />
      <Hero  onPortalClick={scrollToPortal} />
      <Features />
      <HowItWorks />
      <Portal />
      <Footer />
    </>
  );
}