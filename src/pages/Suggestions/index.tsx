import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

/* =========================
   Types
========================= */
type ClosetItem = {
  id: string;
  url: string;
  category: string;
  subcategory?: string;
  occasion?: string[];
  eventType?: string;
  weather?: string[];
};

type Outfit = {
  id: string;
  layers: ClosetItem[];
  createdAt: number;
  occasion?: string;
  tags?: string[];
  scheduledDate?: string;
};

type SuggestionContext = {
  selectedDateForSuggestion?: string;
  selectedEventForSuggestion?: string;
  inferredOccasion?: string;
  tags?: string[];
  fromCalendar?: boolean;
  fromSuggestions?: boolean;
};

type Tab = "occasions" | "event" | "random";

const PRIMARY = "#291F35";

/* =========================
   Occasion Presets (Nigeria-tuned)
========================= */
const OCCASIONS = [
  "Interview",
  "Conference",
  "Presentation",
  "Office",
  "Class",
  "Exam/Test",
  "Church/Mosque",
  "Traditional Event",
  "Wedding",
  "Date",
  "Birthday Party",
  "Hangout",
  "Casual",
] as const;

type OccasionName = (typeof OCCASIONS)[number];

/* =========================
   Utilities
========================= */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Infer a broad occasion + tags from an arbitrary event text (Nigeria-aware) */
function inferFromEventText(text?: string | null): { occasion: OccasionName; tags: string[] } {
  const t = (text || "").toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

  // Strict formal first
  if (has("interview", "panel", "assessment")) {
    return { occasion: "Interview", tags: ["formal", "office", "presentation-friendly"] };
  }
  if (has("presentation", "defence", "defense", "pitch")) {
    return { occasion: "Presentation", tags: ["formal", "presentation-friendly", "office"] };
  }
  if (has("conference", "summit", "seminar", "client meeting", "board")) {
    return { occasion: "Conference", tags: ["formal", "office"] };
  }
  if (has("office", "work", "induction", "orientation", "onboarding", "networking", "mixer", "town hall", "standup")) {
    return { occasion: "Office", tags: ["smart-casual", "office"] };
  }

  // Academic
  if (has("class", "lecture", "tutorial", "lab", "school", "campus")) {
    return { occasion: "Class", tags: ["class", "comfort", "student"] };
  }
  if (has("exam", "test")) {
    return { occasion: "Exam/Test", tags: ["class", "exam", "comfort"] };
  }

  // Religious
  if (has("church", "service", "mass", "mosque", "jummah", "prayer", "fellowship")) {
    return { occasion: "Church/Mosque", tags: ["religious", "modest"] };
  }

  // Traditional / Owambe
  if (has("owambe", "aso ebi", "asoebi", "introduction", "engagement", "naming")) {
    return { occasion: "Traditional Event", tags: ["traditional", "event"] };
  }
  if (has("wedding", "reception")) {
    return { occasion: "Wedding", tags: ["traditional", "event"] };
  }

  // Social
  if (has("birthday", "party")) {
    return { occasion: "Birthday Party", tags: ["social", "smart-casual"] };
  }
  if (has("date")) {
    return { occasion: "Date", tags: ["social", "smart-casual"] };
  }
  if (has("hangout", "get together", "get-together", "reunion", "family meeting", "house party")) {
    return { occasion: "Hangout", tags: ["social", "smart-casual"] };
  }

  // Fallbacks
  if (has("meeting")) return { occasion: "Office", tags: ["office"] };

  return { occasion: "Casual", tags: ["casual"] };
}

/** Older simple inference kept as a fallback */


/* =========================
   Component
========================= */
export default function Suggestions() {
  const navigate = useNavigate();

  // Data
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [weatherLabel, setWeatherLabel] = useState<"Hot" | "Cool" | "Rainy" | "Harmattan">("Hot");

  // Context
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventToday, setEventToday] = useState<string | null>(null);

  // Tabs & user choices
  const [tab, setTab] = useState<Tab>("occasions");
  const [eventText, setEventText] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionName>("Casual");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Output
  const [suggestedOutfit, setSuggestedOutfit] = useState<ClosetItem[]>([]);
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [toast, setToast] = useState(false);

  /* ---------- load closet, weather & context ---------- */
  useEffect(() => {
    const closet = safeParse<ClosetItem[]>(localStorage.getItem("closetItems"), []);
    setClosetItems(Array.isArray(closet) ? closet : []);

    const w = safeParse<{ temp?: number; description?: string; city?: string }>(
      localStorage.getItem("weatherData"),
      {}
    );
    const desc = (w?.description || "").toLowerCase();
    if (desc.includes("rain")) setWeatherLabel("Rainy");
    else if (desc.includes("cold")) setWeatherLabel("Cool");
    else if (desc.includes("dust") || desc.includes("harmattan") || desc.includes("haze") || desc.includes("smoke"))
      setWeatherLabel("Harmattan");
    else setWeatherLabel("Hot");

    const ctx = safeParse<SuggestionContext>(localStorage.getItem("selectedSuggestionContext"), {});
    const todayISO = new Date().toISOString().split("T")[0];

    if (ctx && (ctx.selectedDateForSuggestion || ctx.selectedEventForSuggestion)) {
      setSelectedDate(ctx.selectedDateForSuggestion || todayISO);
      const evt = ctx.selectedEventForSuggestion || null;
      setEventToday(evt);
      const inf = inferFromEventText(evt);
      setSelectedOccasion((ctx.inferredOccasion as OccasionName) || inf.occasion);
      setSelectedTags(ctx.tags || inf.tags);
    } else {
      // fallback → check today's event from calendar
      const events = safeParse<any[]>(localStorage.getItem("calendarEvents"), []);
      const evt = events.find(
        (e) =>
          e?.start?.date === todayISO ||
          (typeof e?.start?.dateTime === "string" && e.start.dateTime.startsWith(todayISO))
      );
      setEventToday(evt ? evt.summary || null : null);
      setSelectedDate(todayISO);
      const inf = inferFromEventText(evt?.summary);
      setSelectedOccasion(inf.occasion);
      setSelectedTags(inf.tags);
    }
  }, []);

  /* ---------- helpers ---------- */
  // Pick a random item among categories with optional simple tags bias
  const pick = (cats: string[], tagBias: string[] = []) => {
    const matches = closetItems.filter((i) => cats.includes(i.category));
    if (!matches.length) return null;

    // Light scoring by tags (if closet items carry tags in occasion/weather fields)
    const scored = matches
      .map((m) => {
        let s = 0;
        const lowerTags = [
          ...(m.occasion || []),
          ...(m.weather || []),
          (m.subcategory || "").toLowerCase(),
          (m.eventType || "").toLowerCase(),
        ].map((x) => x.toString().toLowerCase());
        tagBias.forEach((t) => {
          if (lowerTags.some((lt) => lt.includes(t))) s += 1;
        });
        return { m, s };
      })
      .sort((a, b) => b.s - a.s);

    // 70% take from top half, 30% fully random to keep variety
    const pool = Math.max(1, Math.ceil(scored.length / 2));
    const choice = Math.random() < 0.7 ? scored[Math.floor(Math.random() * pool)].m : matches[Math.floor(Math.random() * matches.length)];
    return choice;
  };

  /** Core assembly rules per occasion (then weather tweak) */
  function assembleFor(occasion: OccasionName, tags: string[]): ClosetItem[] {
    const t = tags.map((x) => x.toLowerCase());

    const jacket = pick(["Jacket", "Sweater", "Blazer", "Cardigan", "Raincoat"], t);
    const shirt = pick(["Shirt", "Blouse", "Top", "T-Shirt"], t);
    const bottom = pick(["Trousers", "Skirt", "Jeans", "Shorts"], t);
    const dress = pick(["Dress"], t);
    const shoes = pick(["Shoes", "Sandals", "Heels", "Loafers", "Sneakers"], t);

    const ensure = (...arr: (ClosetItem | null)[]) => arr.filter(Boolean) as ClosetItem[];

    switch (occasion) {
      case "Interview":
      case "Presentation":
      case "Conference":
      case "Office":
        // Smart to formal
        return ensure(
          shirt,
          bottom ?? dress,
          // light layer for AC/rainy/modesty
          (weatherLabel === "Cool" || weatherLabel === "Rainy" || t.includes("modest")) ? jacket : null,
          shoes
        );

      case "Class":
      case "Exam/Test":
        return ensure(shirt, bottom, shoes);

      case "Church/Mosque":
        return ensure(dress ?? shirt, dress ? shoes : bottom, shoes);

      case "Traditional Event":
      case "Wedding":
        // If user has native wear saved as Dress/Top+Skirt, still works
        return ensure(dress ?? shirt, dress ? shoes : bottom, shoes);

      case "Date":
      case "Birthday Party":
      case "Hangout":
        // Smart-casual / playful
        if (Math.random() > 0.5) {
          return ensure(dress, shoes);
        }
        return ensure(shirt, bottom, shoes);

      case "Casual":
      default:
        // Weather-led casual
        if (weatherLabel === "Rainy" || weatherLabel === "Harmattan") {
          return ensure(jacket, shirt, bottom ?? dress, shoes);
        }
        if (weatherLabel === "Cool") {
          return Math.random() > 0.5 ? ensure(jacket, dress, shoes) : ensure(shirt, bottom, shoes);
        }
        // Hot
        return Math.random() > 0.5 ? ensure(dress, shoes) : ensure(shirt, bottom, shoes);
    }
  }

  /** Generate outfit from current selections (tab-aware) */
  const generateOutfit = () => {
    let occ = selectedOccasion;
    let tags = selectedTags;

    if (tab === "event") {
      const inf = inferFromEventText(eventText);
      occ = inf.occasion;
      tags = inf.tags;
      // persist the context for Styling
      localStorage.setItem(
        "selectedSuggestionContext",
        JSON.stringify({
          selectedDateForSuggestion: new Date().toISOString().split("T")[0],
          selectedEventForSuggestion: eventText,
          inferredOccasion: occ,
          tags,
          fromSuggestions: true,
        } satisfies SuggestionContext)
      );
      setSelectedOccasion(occ);
      setSelectedTags(tags);
    } else if (tab === "occasions") {
      // keep selectedOccasion/tags as is
      if (!tags.length) {
        const inf = inferFromEventText(selectedOccasion);
        tags = inf.tags;
        setSelectedTags(tags);
      }
    } else {
      // random tab: pick a random preset
      const rnd = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)];
      const inf = inferFromEventText(rnd);
      occ = inf.occasion;
      tags = inf.tags;
      setSelectedOccasion(occ);
      setSelectedTags(tags);
    }

    const built = assembleFor(occ, tags);
    setSuggestedOutfit(built);
  };

  // Auto-generate when closet loads
  useEffect(() => {
    if (closetItems.length) generateOutfit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closetItems]);

  /* ---------- Save / Edit ---------- */
  const handleSave = () => {
    if (!suggestedOutfit.length) return;
    setShowOccasionModal(true);
  };

  const confirmSave = () => {
    if (!suggestedOutfit.length) return;

    const newOutfit: Outfit = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      layers: suggestedOutfit,
      createdAt: Date.now(),
      occasion: selectedOccasion,
      tags: [selectedOccasion, ...selectedTags],
      scheduledDate: selectedDate || new Date().toISOString().split("T")[0],
    };

    const existing = safeParse<Outfit[]>(localStorage.getItem("outfits"), []);
    const updated = [newOutfit, ...existing.filter((o) => o.scheduledDate !== newOutfit.scheduledDate)];
    localStorage.setItem("outfits", JSON.stringify(updated));
    localStorage.setItem("calendarNeedsRefresh", "true");

    setShowOccasionModal(false);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleEdit = () => {
    if (!suggestedOutfit.length) return;
    localStorage.setItem("tempSuggestedOutfit", JSON.stringify(suggestedOutfit));
    localStorage.setItem(
      "selectedSuggestionContext",
      JSON.stringify({
        selectedDateForSuggestion: selectedDate || new Date().toISOString().split("T")[0],
        selectedEventForSuggestion: selectedOccasion || eventToday || "",
        inferredOccasion: selectedOccasion,
        tags: selectedTags,
        fromSuggestions: true,
      } as SuggestionContext)
    );
    navigate("/styling");
  };

  const headerSubtitle = useMemo(() => {
    if (tab === "event") return "Type an event and get tailored looks";
    if (eventToday) return `📅 Based on your event: ${eventToday}`;
    return `🌤️ Based on ${weatherLabel.toLowerCase()} weather`;
    // eslint-disable-next-line
  }, [tab, eventToday, weatherLabel]);

  /* =========================
     Render
  ========================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #EAD9FF 0%, #E2D1FF 45%, #DECDFE 100%)",
        color: PRIMARY,
        fontFamily: "Inter, sans-serif",
        paddingBottom: 100,
      }}
    >
      {/* Header Pills (kept minimal for this page) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: "10px 12px",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Pill label="Occasions" active={tab === "occasions"} onClick={() => setTab("occasions")} icon="🗂️" />
        <Pill label="Event" active={tab === "event"} onClick={() => setTab("event")} icon="📝" />
        <Pill label="Random" active={tab === "random"} onClick={() => setTab("random")} icon="🎲" />
      </div>

      {/* CONTENT */}
      <div style={{ padding: 20 }}>
        <p style={{ marginBottom: 10, fontWeight: 600 }}>{headerSubtitle}</p>

        {/* Tab: Event (free text) */}
        {tab === "event" && (
          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            <input
              value={eventText}
              onChange={(e) => setEventText(e.target.value)}
              placeholder="e.g. Interview at Ikeja 9am, Project Defence, NYSC CDS, Birthday Party..."
              style={{ padding: "12px 14px", borderRadius: 12, border: "1.5px solid #C9C2DB" }}
            />
          </div>
        )}

        {/* Tab: Occasions (chips) */}
        {tab === "occasions" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                onClick={() => {
                  setSelectedOccasion(occ);
                  const inf = inferFromEventText(occ);
                  setSelectedTags(inf.tags);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 20,
                  border: `1px solid ${PRIMARY}`,
                  background: selectedOccasion === occ ? PRIMARY : "#fff",
                  color: selectedOccasion === occ ? "#fff" : PRIMARY,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {occ}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={generateOutfit}
          style={{
            width: "100%",
            marginBottom: 20,
            background: PRIMARY,
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "14px 0",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✨ Suggest Outfit
        </button>

        {/* Empty closet guard */}
        {closetItems.length === 0 ? (
          <div
            style={{
              border: "1.5px dashed #65558F",
              borderRadius: 16,
              padding: 16,
              textAlign: "center",
              color: "#65558F",
              background: "#fff",
            }}
          >
            Add items to your closet to get suggestions.
            <div style={{ height: 12 }} />
            <button
              onClick={() => navigate("/upload")}
              style={{
                border: "none",
                borderRadius: 999,
                background: PRIMARY,
                color: "#fff",
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add Item
            </button>
          </div>
        ) : suggestedOutfit.length ? (
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(180deg, #F6EEFF 0%, #EDE4FF 100%)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Your Perfect Outfit</h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              {suggestedOutfit.map((item) => (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.category}
                  style={{
                    width: "70%",
                    maxWidth: 220,
                    objectFit: "contain",
                    borderRadius: 16,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                  loading="lazy"
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: PRIMARY,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ❤️ Save Outfit
              </button>
              <button
                onClick={handleEdit}
                style={{
                  flex: 1,
                  background: "#fff",
                  color: PRIMARY,
                  border: `1.5px solid ${PRIMARY}`,
                  borderRadius: 12,
                  padding: "12px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✏️ Edit Outfit
              </button>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#5B516C" }}>
            No suitable items found. Add more to your closet 👗
          </p>
        )}
      </div>

      {/* OCCASION / SAVE MODAL */}
      {showOccasionModal && (
        <div
          onClick={() => setShowOccasionModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Pick an Occasion</h3>

            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 14,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1.5px solid #ccc",
                fontFamily: "Inter",
              }}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  onClick={() => {
                    setSelectedOccasion(occ);
                    const inf = inferFromEventText(occ);
                    setSelectedTags(inf.tags);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: `1px solid ${PRIMARY}`,
                    background: selectedOccasion === occ ? PRIMARY : "#fff",
                    color: selectedOccasion === occ ? "#fff" : PRIMARY,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {occ}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowOccasionModal(false)}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: `1.5px solid ${PRIMARY}`,
                  background: "#fff",
                  color: PRIMARY,
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  background: PRIMARY,
                  color: "#fff",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#65558F",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 12,
            fontWeight: 600,
            zIndex: 999,
          }}
        >
          ✅ Outfit saved successfully!
        </div>
      )}

      <BottomNav />
    </div>
  );
}

/* ---------- Reusable Pill ---------- */
function Pill({
  label,
  onClick,
  active,
  icon,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: `1.5px solid ${PRIMARY}`,
        background: active ? PRIMARY : "#fff",
        color: active ? "#fff" : PRIMARY,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {icon ? <span style={{ fontSize: 16 }}>{icon}</span> : null}
      {label}
    </button>
  );
}
