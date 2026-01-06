import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

type ClosetItem = {
  id: string;
  url: string;
  category: string;
  subcategory?: string;
};

type Outfit = {
  id: string;
  layers: ClosetItem[];
  createdAt: number;
  occasion?: string;
  tags?: string[];
  scheduledDate?: string;
};

const OCCASIONS = [
  "Class","Office","Party","Wedding","Church/Mosque","Traditional Event",
  "Hangout","Date","Interview","Conference","Exam/Test","Casual",
];

/* ---------- helpers ---------- */

// Map any noisy category/subcategory to canonical buckets
function normalizeCategory(category?: string, subcategory?: string): string {
  const s = (subcategory || "").toLowerCase();
  const c = (category || "").toLowerCase();

  // Outerwear
  if (["jacket","coat","blazer"].some(k => c.includes(k) || s.includes(k))) return "Jacket";
  if (["sweater","hoodie","cardigan","jumper","pull","knit"].some(k => c.includes(k) || s.includes(k))) return "Sweater";

  // Tops
  if (["top","tops","shirt","tshirt","t-shirt","tee","blouse","polo","camisole","tank"].some(k => c.includes(k) || s.includes(k))) return "Shirt";

  // Bottoms
  if (["trouser","trousers","pants","jean","jeans"].some(k => c.includes(k) || s.includes(k))) return "Trousers";
  if (["skirt"].some(k => c.includes(k) || s.includes(k))) return "Skirt";

  // One-piece
  if (["dress","gown"].some(k => c.includes(k) || s.includes(k))) return "Dress";

  // Footwear
  if (["heel"].some(k => c.includes(k) || s.includes(k))) return "Heels";
  if (["loafer"].some(k => c.includes(k) || s.includes(k))) return "Loafers";
  if (["sandal","flipflop"].some(k => c.includes(k) || s.includes(k))) return "Sandals";
  if (["shoe","sneaker","trainer","footwear"].some(k => c.includes(k) || s.includes(k))) return "Shoes";

  if (c) {
    if (c === "tops") return "Shirt";
    if (c === "bottoms") return "Trousers";
    if (c === "footwear") return "Shoes";
  }
  return category || "Other";
}

function canon(item: ClosetItem): ClosetItem {
  const mapped = normalizeCategory(item.category, item.subcategory);
  return { ...item, category: mapped };
}

/* ---------- small responsive hook ---------- */
function useViewport() {
  const [w, setW] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isXS = w <= 360;        // very small phones
  const isSM = w <= 420;        // small phones
  const cols = isXS ? 2 : 3;    // switch grid columns
  return { width: w, isXS, isSM, cols };
}

/* ---------- page ---------- */

export default function Styling() {
  const navigate = useNavigate();
  const { isXS, isSM, cols } = useViewport();

  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [stepMode, setStepMode] = useState<2 | 3 | 4>(3);
  const [centers, setCenters] = useState<number[]>([]);
  const [rowPinned, setRowPinned] = useState<boolean[]>([]);
  const [pinnedItems, setPinnedItems] = useState<(ClosetItem | null)[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveOccasion, setSaveOccasion] = useState<string>("Casual");
  const [saveDate, setSaveDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [saveToast, setSaveToast] = useState(false);
  const [prefilledOutfit, setPrefilledOutfit] = useState<ClosetItem[] | null>(null);

  // Load closet + context
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("closetItems") || "[]");
    const normalized: ClosetItem[] = Array.isArray(raw) ? raw.map(canon) : [];
    setClosetItems(normalized);

    const temp = localStorage.getItem("tempSuggestedOutfit");
    if (temp) {
      try {
        const parsed = JSON.parse(temp);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPrefilledOutfit(parsed.map(canon));
        }
      } finally {
        localStorage.removeItem("tempSuggestedOutfit");
      }
    }

    const ctx = localStorage.getItem("selectedSuggestionContext");
    if (ctx) {
      try {
        const parsed = JSON.parse(ctx);
        if (parsed.selectedDateForSuggestion) setSaveDate(parsed.selectedDateForSuggestion);
        if (parsed.selectedEventForSuggestion) setSaveOccasion(parsed.selectedEventForSuggestion);
      } catch {}
    }

    const onFocus = () => {
      const raw2 = JSON.parse(localStorage.getItem("closetItems") || "[]");
      setClosetItems(Array.isArray(raw2) ? raw2.map(canon) : []);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Group rows (uses normalized categories)
  const rows: ClosetItem[][] = useMemo(() => {
    const byCats = (...cats: string[]) => closetItems.filter((i) => cats.includes(i.category));

    if (stepMode === 2)
      return [byCats("Dress"), byCats("Shoes", "Sandals", "Heels", "Loafers")];

    if (stepMode === 3) {
      const row1 = closetItems.filter((i) => ["Jacket", "Sweater", "Shirt"].includes(i.category));
      const row2 = closetItems.filter((i) => ["Dress", "Trousers", "Skirt"].includes(i.category));
      const row3 = byCats("Shoes", "Sandals", "Heels", "Loafers");
      return [row1, row2, row3];
    }

    const row1 = closetItems.filter((i) => ["Jacket", "Sweater"].includes(i.category));
    const row2 = closetItems.filter((i) => ["Shirt"].includes(i.category));
    const row3 = closetItems.filter((i) => ["Trousers", "Skirt"].includes(i.category));
    const row4 = byCats("Shoes", "Sandals", "Heels", "Loafers");
    return [row1, row2, row3, row4];
  }, [closetItems, stepMode]);

  // Reset row controls on row change
  useEffect(() => {
  setCenters(rows.map(() => 0));
  setRowPinned(rows.map(() => false));
  setPinnedItems(rows.map(() => null));
}, [rows]);


  // Derive step mode from prefilled outfit
  useEffect(() => {
    if (!prefilledOutfit || !prefilledOutfit.length) return;
    const cats = prefilledOutfit.map((i) => normalizeCategory(i.category, i.subcategory));

    if (
      cats.includes("Dress") &&
      cats.some((c) => ["Shoes","Sandals","Heels","Loafers"].includes(c)) &&
      !cats.some((c) => ["Jacket","Sweater"].includes(c))
    ) {
      setStepMode(2);
    } else if (
      (cats.includes("Shirt") &&
        (cats.includes("Trousers") || cats.includes("Skirt")) &&
        cats.some((c) => ["Shoes","Sandals","Heels","Loafers"].includes(c))) ||
      (cats.some((c) => ["Jacket","Sweater"].includes(c)) &&
        cats.includes("Dress") &&
        cats.some((c) => ["Shoes","Sandals","Heels","Loafers"].includes(c)))
    ) {
      setStepMode(3);
    } else if (
      cats.some((c) => ["Jacket","Sweater"].includes(c)) &&
      cats.includes("Shirt") &&
      (cats.includes("Trousers") || cats.includes("Skirt")) &&
      cats.some((c) => ["Shoes","Sandals","Heels","Loafers"].includes(c))
    ) {
      setStepMode(4);
    }

    setTimeout(() => {
      setCenters(
        rows.map((row) => {
          const idx = row.findIndex((r) => prefilledOutfit.some((p) => p.id === r.id));
          return idx >= 0 ? idx : 0;
        })
      );
      setRowPinned(rows.map(() => true));
    }, 200);
  }, [prefilledOutfit, rows]);

  // Carousel helpers
  const nextIndex = (len: number, idx: number) => (idx + 1) % len;
  const prevIndex = (len: number, idx: number) => (idx - 1 + len) % len;

  const nudgeRow = (rowIdx: number, dir: "left" | "right") => {
    if (rowPinned[rowIdx]) return;
    const row = rows[rowIdx];
    if (!row?.length) return;
    setCenters((prev) => {
      const copy = [...prev];
      copy[rowIdx] = dir === "left"
        ? nextIndex(row.length, prev[rowIdx])
        : prevIndex(row.length, prev[rowIdx]);
      return copy;
    });
  };

  const togglePinCenter = (rowIdx: number) => {
  setRowPinned((prev) => {
    const copy = [...prev];
    copy[rowIdx] = !copy[rowIdx];
    return copy;
  });

  setPinnedItems((prev) => {
    const copy = [...prev];
    const row = rows[rowIdx];
    if (!row?.length) return copy;

    const centerItem = row[centers[rowIdx] % row.length];

    // If already pinned → unpin, else store the item
    copy[rowIdx] = prev[rowIdx] ? null : centerItem;
    return copy;
  });
};


  const visibleTriplet = (rowIdx: number): (ClosetItem | null)[] => {
    const row = rows[rowIdx];
    if (!row?.length) return [null, null, null];
    const cIdx = centers[rowIdx] % row.length;
    const lIdx = prevIndex(row.length, cIdx);
    const rIdx = nextIndex(row.length, cIdx);
    return [row[lIdx], row[cIdx], row[rIdx]];
  };

  // Save outfit
  const handleConfirmSave = () => {
    const picked = rows
  .map((row, i) =>
    pinnedItems[i] ?? (row.length ? row[centers[i] % row.length] : null)
  )
  .filter(Boolean) as ClosetItem[];


    if (!picked.length) {
      alert("No items selected to save!");
      return;
    }

    const newOutfit: Outfit = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      layers: picked,
      createdAt: Date.now(),
      occasion: saveOccasion,
      tags: [saveOccasion],
      scheduledDate: saveDate,
    };

    const existing = JSON.parse(localStorage.getItem("outfits") || "[]");
    const updated = [newOutfit, ...existing.filter((o: any) => o.scheduledDate !== saveDate)];
    localStorage.setItem("outfits", JSON.stringify(updated));
    localStorage.setItem("calendarNeedsRefresh", "true");

    setSaveOpen(false);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      navigate("/outfit");
    }, 1800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #EAD9FF 0%, #E2D1FF 45%, #DECDFE 70%, #EAD9FF 100%)",
        color: "#291F35",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflowX: "hidden",              // ✅ prevent sideways scroll
      }}
    >
      {/* Header – unified pills */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: isXS ? "8px 8px" : "10px 12px",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: isXS ? 6 : 8,
          justifyContent: "center",
        }}
      >
        <Pill label="Clothes" onClick={() => navigate("/closet")} icon="🧥" />
        <Pill label="Outfits" onClick={() => navigate("/outfit")} icon="👖" />
        <Pill label="Styling" active onClick={() => {}} icon="✨" />
      </div>

      {/* Step selector */}
      <div
        style={{
          background: "#291F35",
          color: "#fff",
          padding: isXS ? "12px 14px" : "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: isXS ? 18 : 20 }}>Canvas</h2>
        <div style={{ display: "flex", gap: isXS ? 6 : 8 }}>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setStepMode(n as 2 | 3 | 4)}
              style={{
                width: isXS ? 32 : 36,
                height: isXS ? 32 : 36,
                borderRadius: "50%",
                border: "none",
                background: stepMode === n ? "#65558F" : "#E5DEFF",
                color: stepMode === n ? "#fff" : "#291F35",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Outfit Rows */}
      <div
        style={{
          padding: isXS ? "14px 10px 110px" : "16px 14px 110px",
          display: "flex",
          flexDirection: "column",
          gap: isXS ? 16 : 22,
          overflowX: "hidden",           // ✅ extra safety
        }}
      >
        {rows.map((_, rowIdx) => {
          const triple = visibleTriplet(rowIdx);
          return (
            <div
              key={`row-${rowIdx}`}
              style={{
                display: "grid",
                gridTemplateColumns: cols === 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)", // ✅ responsive columns
                gap: isXS ? 12 : 20,
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              {triple
                // if 2 cols, we only show left & center (hide right) to avoid squeeze
                .filter((_, i) => (cols === 2 ? i !== 2 : true))
                .map((item, colIdx) => (
                  <Card
                    key={`${item?.id || "empty"}-${rowIdx}-${colIdx}`}
                    item={item}
                    big={colIdx === (cols === 2 ? 0 : 1)}  // center card bigger; in 2-col, make first bigger
                    showPin={colIdx === (cols === 2 ? 0 : 1)}
                    pinned={colIdx === (cols === 2 ? 0 : 1) ? rowPinned[rowIdx] : false}
                    onTogglePin={() => togglePinCenter(rowIdx)}
                    onPrev={() => nudgeRow(rowIdx, "right")}
                    onNext={() => nudgeRow(rowIdx, "left")}
                    compactArrows={isXS || isSM}
                  />
                ))}
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 64,
          padding: isXS ? "8px 12px" : "10px 16px",
          background: "rgba(255,255,255,0.95)",
          borderTop: "1px solid #E6E0F8",
          zIndex: 12,
          backdropFilter: "saturate(140%) blur(2px)",
        }}
      >
        <button
          onClick={() => setSaveOpen(true)}
          style={{
            width: "100%",
            background: "#291F35",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: isXS ? "12px 0" : "14px 0",
            fontSize: isXS ? 15 : 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ❤️ Save Outfit
        </button>
      </div>

      {/* Save Modal */}
      {saveOpen && (
        <div
          onClick={() => setSaveOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 64,
              margin: "0 auto",
              maxWidth: 520,
              background: "#fff",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: 8 }}>Save Outfit</h3>
            <input
              type="date"
              value={saveDate}
              onChange={(e) => setSaveDate(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid #C9C2DB",
              }}
            />
            <select
              value={saveOccasion}
              onChange={(e) => setSaveOccasion(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid #C9C2DB",
                marginBottom: 12,
                background: "#fff",
                color: "#291F35",
                fontWeight: 600,
              }}
            >
              {OCCASIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setSaveOpen(false)}
                style={{
                  flex: 1,
                  border: "1.5px solid #291F35",
                  background: "#fff",
                  color: "#291F35",
                  padding: "12px 0",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                style={{
                  flex: 1,
                  border: "none",
                  background: "#291F35",
                  color: "#fff",
                  padding: "12px 0",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {saveToast && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#65558F",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
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

/* ---------- Card (responsive) ---------- */
function Card({
  item,
  big,
  showPin,
  pinned,
  onTogglePin,
  onPrev,
  onNext,
  compactArrows,
}: {
  item: ClosetItem | null;
  big?: boolean;
  showPin?: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  compactArrows?: boolean;
}) {
  // Use clamp so cards scale with viewport but never too tiny/huge
  const size = big
    ? "clamp(92px, 28vw, 130px)"
    : "clamp(80px, 24vw, 112px)";

  const arrowBtnWidth = compactArrows ? 16 : 20;

  return (
    <div
      style={{
        width: size as any,
        height: size as any,
        borderRadius: 16,
        background: pinned ? "#F1E8FF" : "#fff",
        border: pinned ? "2px solid #65558F" : "1px solid #E6E0F8",
        boxShadow: pinned ? "0 4px 10px rgba(101,85,143,0.4)" : "0 3px 8px rgba(0,0,0,0.1)",
        display: "grid",
        gridTemplateColumns: `${arrowBtnWidth}px 1fr ${arrowBtnWidth}px`, // narrower arrows on small screens
        alignItems: "center",
        justifyItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onPrev}
        aria-label="previous"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: compactArrows ? 16 : 18,
          color: "#291F35",
          width: arrowBtnWidth,
        }}
      >
        ‹
      </button>

      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {item ? (
          <img
            src={item.url}
            alt={item.category}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              transition: "transform 0.25s ease",
            }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9A91A5",
              fontSize: 12,
            }}
          >
            —
          </div>
        )}

        {showPin && onTogglePin && (
          <button
            onClick={onTogglePin}
            aria-label="pin"
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "none",
              background: pinned ? "#65558F" : "#E5DEFF",
              color: pinned ? "#fff" : "#65558F",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
            title={pinned ? "Unpin" : "Pin center"}
          >
            📌
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        aria-label="next"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: compactArrows ? 16 : 18,
          color: "#291F35",
          width: arrowBtnWidth,
        }}
      >
        ›
      </button>
    </div>
  );
}

/* ---------- Pill (unified) ---------- */
function Pill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: "1.5px solid #291F35",
        background: active ? "#291F35" : "#fff",
        color: active ? "#fff" : "#291F35",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ display: "inline-block", lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}
