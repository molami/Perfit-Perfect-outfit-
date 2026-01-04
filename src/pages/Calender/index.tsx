// src/pages/Calendar/index.tsx
import { useEffect, useMemo, useState, type JSX } from "react";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";

/* ---------- simple date helpers ---------- */
const toLocalISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
// Accepts Google Calendar event item
const eventDateKey = (e: any): string | null => {
  if (!e?.start) return null;
  if (e.start.date) return e.start.date; // all-day
  if (e.start.dateTime) return toLocalISO(new Date(e.start.dateTime)); // timed
  return null;
};

/* ---------- UI constants ---------- */
const OUTFIT_STACK_HEIGHT = 340; // fixed stack height (no layout jump)

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date();

  const [events, setEvents] = useState<any[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedOutfit, setSelectedOutfit] = useState<any | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const selectedKey = toLocalISO(selectedDate);

  /* ---------- load data from localStorage (your working logic) ---------- */
  const loadData = () => {
    const savedEvents: any[] = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
    const savedOutfits: any[] = JSON.parse(localStorage.getItem("outfits") || "[]");

    setEvents(savedEvents);
    setOutfits(savedOutfits);

    const eventForDay = savedEvents.find((e) => eventDateKey(e) === selectedKey) || null;
    const outfitForDay = savedOutfits.find((o) => o.scheduledDate === selectedKey) || null;

    setSelectedEventTitle(eventForDay ? eventForDay.summary : null);
    setSelectedOutfit(outfitForDay || null);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when user comes back (your current flow)
  useEffect(() => {
    const onFocus = () => {
      const flag = localStorage.getItem("calendarNeedsRefresh");
      if (flag === "true") {
        loadData();
        localStorage.removeItem("calendarNeedsRefresh");
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- helpers to get items for a date ---------- */
  const getEventForDate = (date: Date) => {
    const key = toLocalISO(date);
    return events.find((e) => eventDateKey(e) === key);
  };
  const getOutfitForDate = (date: Date) => {
    const key = toLocalISO(date);
    return outfits.find((o: any) => o.scheduledDate === key);
  };

  /* ---------- actions ---------- */
  const handleDayClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);

    const event = getEventForDate(newDate);
    const outfit = getOutfitForDate(newDate);

    setSelectedEventTitle(event ? event.summary : null);
    setSelectedOutfit(outfit || null);

    // scroll to the outfit area
    document.getElementById("outfit-stack")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getOccasionFromEvent = (eventTitle: string | null) => {
    if (!eventTitle) return "";
    const lower = eventTitle.toLowerCase();
    if (["meeting", "interview", "conference", "presentation"].some((w) => lower.includes(w)))
      return "Office";
    if (["wedding", "party", "birthday", "ceremony", "celebration"].some((w) => lower.includes(w)))
      return "Formal Event";
    if (["church", "mosque"].some((w) => lower.includes(w))) return "Church/Mosque";
    if (["hangout", "date", "picnic"].some((w) => lower.includes(w))) return "Casual Outing";
    if (["class", "lecture", "school"].some((w) => lower.includes(w))) return "Class";
    return "Everyday Casual";
  };

  const handleGenerateOutfit = () => {
    const iso = toLocalISO(selectedDate);
    localStorage.setItem(
      "selectedSuggestionContext",
      JSON.stringify({
        selectedDateForSuggestion: iso,
        selectedEventForSuggestion: selectedEventTitle || "",
        inferredOccasion: getOccasionFromEvent(selectedEventTitle),
        fromCalendar: true,
      })
    );
    navigate("/suggestions");
  };

  const handleEditOutfit = () => {
    if (!selectedOutfit) return;
    localStorage.setItem("tempSuggestedOutfit", JSON.stringify(selectedOutfit.layers));
    localStorage.setItem(
      "selectedSuggestionContext",
      JSON.stringify({
        selectedDateForSuggestion: selectedOutfit.scheduledDate || toLocalISO(selectedDate),
        selectedEventForSuggestion: selectedOutfit.occasion || selectedEventTitle || "",
        fromCalendar: true,
      })
    );
    navigate("/styling");
  };

  const handleDeleteOutfit = () => {
    if (!selectedOutfit) return;
    const updated = outfits.filter((o: any) => o.id !== selectedOutfit.id);
    setOutfits(updated);
    localStorage.setItem("outfits", JSON.stringify(updated));
    setSelectedOutfit(null);
  };

  /* ---------- calendar structure ---------- */
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedStart = firstDay === 0 ? 6 : firstDay - 1;

  // precompute counts just for the visible month (fast render + dot counts)
  const monthKeyPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-`;

  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      const key = eventDateKey(e);
      if (!key || !key.startsWith(monthKeyPrefix)) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [events, monthKeyPrefix]);

  const outfitsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of outfits) {
      const key = o?.scheduledDate;
      if (!key || !key.startsWith(monthKeyPrefix)) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [outfits, monthKeyPrefix]);

  /* ---------- render day cells (with dots + selected/today styles) ---------- */
  const days: JSX.Element[] = [];
  for (let i = 0; i < adjustedStart; i++) days.push(<div key={`empty-${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const key = toLocalISO(date);

    const isToday =
      d === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    const isSelected = key === selectedKey;

    const eventCount = eventsByDate.get(key) ?? 0;
    const outfitCount = outfitsByDate.get(key) ?? 0;

    const bubbleBg = isSelected ? "#291F35" : isToday ? "#E5DEFF" : "transparent";
    const bubbleFg = isSelected ? "#fff" : "#291F35";
    const weight = isSelected ? 800 : isToday ? 700 : 500;

    days.push(
      <button
        key={d}
        onClick={() => handleDayClick(d)}
        aria-label={`Day ${d}${
          eventCount ? `, ${eventCount} event${eventCount>1?"s":""}` : ""
        }${
          outfitCount ? `, ${outfitCount} outfit${outfitCount>1?"s":""}` : ""
        }${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}`}
        style={{
          position: "relative",
          width: 42,
          height: 48,
          borderRadius: 12,
          border: "1px solid #EEE8FF",
          background: "#fff",
          padding: 0,
          cursor: "pointer",
          outline: "none",
          transition: "transform .15s ease, box-shadow .15s ease",
          boxShadow: isSelected ? "0 0 0 2px rgba(41,31,53,0.15)" : "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {/* Number bubble */}
        <div
          style={{
            margin: "6px auto 2px",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: bubbleBg,
            color: bubbleFg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: weight,
            fontSize: 13,
          }}
        >
          {d}
        </div>

        {/* Two small dots: event + outfit */}
        <div aria-hidden="true" style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: eventCount ? "#65558F" : "#E9E6F6",
              opacity: eventCount ? 1 : 0.6,
            }}
          />
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: outfitCount ? "#8C7AE6" : "#EFEAFC",
              opacity: outfitCount ? 1 : 0.6,
            }}
          />
        </div>
      </button>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        fontFamily: "Inter, sans-serif",
        paddingBottom: 88,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "#291F35",
          color: "#fff",
          textAlign: "center",
          padding: "16px",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 0.2,
        }}
      >
        Outfit Planner
      </div>

      {/* Outfit stack (fixed height) */}
      <div
        id="outfit-stack"
        style={{
          position: "relative",
          width: "100%",
          height: OUTFIT_STACK_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "linear-gradient(180deg,#F7F3FF 0%,#F2ECFF 100%)",
          overflow: "hidden",
        }}
      >
        {selectedOutfit ? (
          <>
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                height: OUTFIT_STACK_HEIGHT - 32,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                paddingRight: 6,
              }}
            >
              {selectedOutfit.layers.map((item: any) => (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.category}
                  loading="lazy"
                  style={{ width: 140, height: 100, objectFit: "contain" }}
                />
              ))}
            </div>

            <div style={{ position: "absolute", top: 12, right: 16, display: "flex", gap: 8 }}>
              <button title="Edit outfit" aria-label="Edit outfit" style={floatBtnStyle} onClick={handleEditOutfit}>✏️</button>
              <button title="Delete outfit" aria-label="Delete outfit" style={floatBtnStyle} onClick={handleDeleteOutfit}>🗑️</button>
            </div>
          </>
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              height: OUTFIT_STACK_HEIGHT - 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleGenerateOutfit}
              style={{
                background: "#291F35",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✨ Generate outfit for this day
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 12,
          background: "linear-gradient(180deg,#ffffff 0%,#faf8ff 100%)",
          borderTop: "1px solid #F0EAFB",
          borderBottom: "1px solid #F0EAFB",
          marginTop: 12,
        }}
      />

      {/* Calendar Section */}
      <CalendarSection
        months={months}
        currentMonth={currentMonth}
        currentYear={currentYear}
        setCurrentMonth={setCurrentMonth}
        setCurrentYear={setCurrentYear}
        days={days}
      />

      <BottomNav />
    </div>
  );
}

/* ---------- split out calendar section for readability ---------- */
function CalendarSection({
  months,
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  days,
}: {
  months: string[];
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  days: JSX.Element[];
}) {
  return (
    <div style={{ padding: "12px 16px 16px" }}>
      {/* Month header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 40px",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear((y) => y - 1);
            } else setCurrentMonth((m) => m - 1);
          }}
          aria-label="Previous month"
          style={navBtnStyle}
        >
          ‹
        </button>
        <div style={{ textAlign: "center", fontWeight: 700, color: "#291F35" }}>
          {months[currentMonth]} {currentYear}
        </div>
        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear((y) => y + 1);
            } else setCurrentMonth((m) => m + 1);
          }}
          aria-label="Next month"
          style={navBtnStyle}
        >
          ›
        </button>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          color: "#5B516C",
          fontSize: 12,
          margin: "0 4px 8px",
        }}
      >
        <LegendDot color="#65558F" label="Event" />
        <LegendDot color="#8C7AE6" label="Outfit" />
        <span style={{ marginLeft: "auto", color: "#8B829D" }}>Tap a day to view/edit</span>
      </div>

      {/* Weekdays */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 42px)",
          justifyContent: "space-between",
          gap: 6,
          textAlign: "center",
          fontWeight: 700,
          color: "#6B647B",
          fontSize: 12,
          margin: "4px 0 6px",
        }}
      >
        <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
      </div>

      {/* Days */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 42px)",
          justifyContent: "space-between",
          gap: 6,
          alignItems: "end",
          minHeight: 6 * 48 + 6 * 6,
        }}
      >
        {days}
      </div>
    </div>
  );
}

/* ---------- small UI bits ---------- */
const floatBtnStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "50%",
  border: "none",
  width: 42,
  height: 42,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
};

const navBtnStyle: React.CSSProperties = {
  height: 32,
  width: 32,
  borderRadius: 8,
  border: "1px solid #EEE8FF",
  background: "#fff",
  color: "#65558F",
  fontSize: 18,
  fontWeight: 700 as any,
  cursor: "pointer",
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}
