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
  scheduledDate?: string;
};

// 🔹 Reusable Pill Component (same as Styling)
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
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s ease",
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

// ➕ Dashed “Create Outfit” card (usable in grid or empty state)
function CreateOutfitCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 16,
        border: "1.5px dashed #65558F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#65558F",
        fontWeight: 600,
        cursor: "pointer",
        background: "none",
        aspectRatio: "1 / 1",
        transition: "all 0.2s ease",
      }}
    >
      <p style={{ fontSize: "24px", margin: 0 }}>+</p>
      <p style={{ fontSize: "13px", margin: 0 }}>Create Outfit</p>
    </div>
  );
}

export default function OutfitPage() {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [filter, setFilter] = useState<string>("All");

  // 🧠 Load outfits
  const loadOutfits = () => {
    const saved = localStorage.getItem("outfits");
    if (!saved) {
      setOutfits([]);
      return;
    }
    try {
      const parsed: Outfit[] = JSON.parse(saved);
      // sort newest first for consistency
      parsed.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setOutfits(parsed);
    } catch {
      console.error("Failed to parse outfits.");
      setOutfits([]);
    }
  };

  useEffect(() => {
    loadOutfits();
    if (localStorage.getItem("calendarNeedsRefresh")) {
      localStorage.removeItem("calendarNeedsRefresh");
      loadOutfits();
    }
  }, []);

  // 🎯 Dynamic filter tags
  const TAGS: string[] = useMemo(() => {
    const unique = Array.from(
      new Set(
        outfits
          .map((o) => o.occasion)
          .filter((x): x is string => Boolean(x))
      )
    );
    return ["All", ...unique];
  }, [outfits]);

  const filteredOutfits = useMemo(() => {
    if (filter === "All") return outfits;
    return outfits.filter((o) => o.occasion === filter);
  }, [outfits, filter]);

  // 👗 Navigate to detail page
  const handleOutfitClick = (id: string) => navigate(`/outfit/${id}`);

  const renderOutfitCard = (outfit: Outfit) => {
    const preview = outfit.layers.slice(0, 3);
    return (
      <div
        key={outfit.id}
        onClick={() => handleOutfitClick(outfit.id)}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid #eee",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          background: "#fff",
          padding: "10px 0 6px",
          cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            height: 180,
            background: "#faf7ff",
          }}
        >
          {preview.map((item, idx) => (
            <img
              key={`${outfit.id}-${idx}`}
              src={item.url}
              alt={item.category}
              style={{
                width: idx === 0 ? "80%" : idx === 1 ? "70%" : "60%",
                objectFit: "contain",
                maxHeight: 60,
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 6 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              color: "#291F35",
              fontSize: 13,
            }}
          >
            {outfit.occasion || "Outfit"}
          </p>
          {outfit.scheduledDate && (
            <p
              style={{
                margin: "2px 0",
                fontSize: 11,
                color: "#8B829D",
              }}
            >
              📅 {outfit.scheduledDate}
            </p>
          )}
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: "#9A91A5",
            }}
          >
            Saved {new Date(outfit.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div style={{ padding: "24px 16px 60px" }}>
      <p
        style={{
          textAlign: "center",
          color: "#9A91A5",
          margin: "16px 0 20px",
          fontWeight: 500,
        }}
      >
        No outfits yet. Tap <b>“Create Outfit”</b> to design one ✨
      </p>
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 16,
        }}
      >
        <CreateOutfitCard onClick={() => navigate("/styling")} />
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #F8F4FF 0%, #EFE9FF 40%, #EDE6FE 100%)",
        fontFamily: "Inter, sans-serif",
        color: "#291F35",
        paddingBottom: 100,
      }}
    >
      {/* ✅ Header Tabs (Unified Design) */}
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
        }}
      >
        <Pill label="Clothes" onClick={() => navigate("/closet")} icon="🧥" />
        <Pill label="Outfits" onClick={() => {}} active icon="👖" />
        <Pill label="Styling" onClick={() => navigate("/styling")} icon="✨" />
      </div>

      {/* Filter Buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "12px 16px",
        }}
      >
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              padding: "8px 12px",
              borderRadius: 20,
              border: "1px solid #d9d4ea",
              background: filter === tag ? "#E5DEFF" : "#fff",
              color: "#291F35",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Content */}
      {filteredOutfits.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            padding: "0 16px 60px",
          }}
        >
          {/* ➕ Create Outfit Button (always present) */}
          <CreateOutfitCard onClick={() => navigate("/styling")} />

          {/* Outfits */}
          {filteredOutfits.map((outfit) => renderOutfitCard(outfit))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
