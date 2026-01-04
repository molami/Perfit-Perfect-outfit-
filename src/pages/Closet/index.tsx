import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";

type ClosetItem = {
  id: string;
  url: string;
  category: string;
  subcategory?: string;
  createdAt: number;
};

// 🔹 Reusable Pill (same look as Styling/Outfit)
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

export default function Closet() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [filter, setFilter] = useState<string>("All");

  // 🧠 Load saved items
  useEffect(() => {
    const saved = localStorage.getItem("closetItems");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        console.error("Failed to parse closet items.");
      }
    }
  }, []);

  // 🧩 Dynamic category list
  const dynamicCategories = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.category)));
    return unique.length > 0 ? ["All", ...unique] : ["All"];
  }, [items]);

  // 🎯 Filter items
  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  // ➕ Actions
  const handleAddItem = () => navigate("/upload");
  const handleItemClick = (id: string) => navigate(`/item/${id}`);

  // Reusable Add Item tile
  const AddItemTile = (
    <div
      onClick={handleAddItem}
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
      <p style={{ fontSize: "13px", margin: 0 }}>Add Item</p>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "Inter, sans-serif",
        color: "#291F35",
        paddingBottom: 100,
      }}
    >
      {/* Header Pills */}
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
        <Pill label="Clothes" icon="🧥" active onClick={() => {}} />
        <Pill label="Outfits" icon="👖" onClick={() => navigate("/outfit")} />
        <Pill label="Styling" icon="✨" onClick={() => navigate("/styling")} />
      </div>

      {/* CLOTHES TAB CONTENT */}
      <section style={{ padding: "16px" }}>
        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {dynamicCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: "8px 12px",
                borderRadius: 20,
                border: "1px solid #d9d4ea",
                background: filter === c ? "#E5DEFF" : "#fff",
                color: "#291F35",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Empty state → show big Add Item tile */}
        {filtered.length === 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {AddItemTile}
            {/* two placeholders just to keep the grid balanced on wide screens */}
            <div style={{ aspectRatio: "1 / 1" }} />
            <div style={{ aspectRatio: "1 / 1" }} />
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "#9A91A5",
                marginTop: 12,
                fontWeight: 500,
              }}
            >
              No items yet. Tap <b>“Add Item”</b> to upload your clothes.
            </div>
          </div>
        ) : (
          // Non-empty → show Add tile first, then items
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {AddItemTile}

            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #eee",
                  position: "relative",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  aspectRatio: "1 / 1",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.05)";
                }}
              >
                <img
                  src={item.url}
                  alt={item.category}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    fontSize: 11,
                    padding: "4px 6px",
                    borderRadius: 6,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.category}
                  {item.subcategory ? ` • ${item.subcategory}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}

