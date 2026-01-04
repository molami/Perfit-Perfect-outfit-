import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  title?: string;
  tags?: string[];
  scheduledDate?: string;
};

type CalendarEvent = {
  id: string;
  summary: string;
  start: { date: string };
  outfitId?: string;
};

export default function OutfitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState("");

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem("outfits");
    if (!saved) return;

    const parsed: Outfit[] = JSON.parse(saved);
    const found = parsed.find((o) => o.id === id);
    if (found) {
      setOutfit(found);
      setNewDate(found.scheduledDate || new Date().toISOString().split("T")[0]);
    }
  }, [id]);

  // ✏️ Edit outfit → go to styling
  const handleEdit = () => {
    if (!outfit) return;
    localStorage.setItem("tempSuggestedOutfit", JSON.stringify(outfit.layers));
    localStorage.setItem(
      "selectedSuggestionContext",
      JSON.stringify({
        selectedDateForSuggestion:
          outfit.scheduledDate || new Date().toISOString().split("T")[0],
        selectedEventForSuggestion: outfit.occasion || "",
        fromOutfitDetail: true,
      })
    );
    navigate("/styling");
  };

  // 🗓️ Save reschedule (with Calendar Sync)
  const handleSaveReschedule = () => {
    if (!outfit) return;

    const updatedOutfit: Outfit = { ...outfit, scheduledDate: newDate };

    // 🧭 Update outfits list
    const savedOutfits: Outfit[] = JSON.parse(localStorage.getItem("outfits") || "[]");
    const updatedOutfits = savedOutfits.map((o) =>
      o.id === outfit.id ? updatedOutfit : o
    );
    localStorage.setItem("outfits", JSON.stringify(updatedOutfits));

    // 📅 Sync with calendarEvents
    const calendarEvents: CalendarEvent[] = JSON.parse(
      localStorage.getItem("calendarEvents") || "[]"
    );

    // Remove old event for this outfit
    const filtered = calendarEvents.filter((e) => e.outfitId !== outfit.id);

    // Add updated one
    const newEvent: CalendarEvent = {
      id: `${outfit.id}-event`,
      summary: outfit.title || outfit.occasion || "Outfit Scheduled",
      start: { date: newDate },
      outfitId: outfit.id,
    };
    localStorage.setItem(
      "calendarEvents",
      JSON.stringify([...filtered, newEvent])
    );

    // let Calendar screen know to refresh
    localStorage.setItem("calendarNeedsRefresh", "true");

    setOutfit(updatedOutfit);
    setShowRescheduleModal(false);
  };

  // 🗑️ Delete
  const handleDelete = () => {
    if (!outfit) return;

    // remove from outfits
    const saved: Outfit[] = JSON.parse(localStorage.getItem("outfits") || "[]");
    const updated = saved.filter((o) => o.id !== outfit.id);
    localStorage.setItem("outfits", JSON.stringify(updated));

    // remove related calendar event(s)
    const calendarEvents: CalendarEvent[] = JSON.parse(
      localStorage.getItem("calendarEvents") || "[]"
    );
    const filtered = calendarEvents.filter((e) => e.outfitId !== outfit.id);
    localStorage.setItem("calendarEvents", JSON.stringify(filtered));

    localStorage.setItem("calendarNeedsRefresh", "true");

    navigate("/outfit", { replace: true });
  };

  if (!outfit)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#291F35",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <p>Outfit not found 😢</p>
        <button
          onClick={() => navigate("/outfit")}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            border: "1.5px solid #291F35",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Outfits
        </button>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "Inter, sans-serif",
        color: "#291F35",
        padding: "24px 16px 100px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            marginRight: 12,
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>
          {outfit.title || "Outfit Details"}
        </h2>
      </div>

      {/* Outfit Stack */}
      <div
        style={{
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          marginBottom: 24,
          background:
            "linear-gradient(180deg, #F6EEFF 0%, #EDE4FF 45%, #E7DCFE 100%)",
          padding: "20px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          {outfit.layers.map((item, idx) => (
            <img
              key={item.id ?? idx}
              src={item.url}
              alt={item.category}
              style={{
                width: idx === 0 ? "80%" : idx === 1 ? "70%" : "60%",
                maxHeight: 80,
                objectFit: "contain",
              }}
            />
          ))}
        </div>
      </div>

      {/* Occasion + Schedule */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Occasion
        </h3>
        <p style={{ color: "#5B516C", marginBottom: 4 }}>
          {outfit.occasion || "Not specified"}
        </p>
        <p style={{ color: "#5B516C", marginBottom: 8 }}>
          Scheduled for:{" "}
          <strong>{outfit.scheduledDate || "Not scheduled"}</strong>
        </p>

        <button
          onClick={() => setShowRescheduleModal(true)}
          style={{
            width: "100%",
            background: "#fff",
            border: "1.5px solid #291F35",
            borderRadius: 12,
            color: "#291F35",
            padding: "10px 0",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            marginTop: 6,
          }}
        >
          {outfit.scheduledDate ? "📆 Reschedule" : "📅 Schedule Now"}
        </button>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Tags</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {outfit.tags && outfit.tags.length > 0 ? (
            outfit.tags.map((tag, idx) => (
              <span
                key={`${tag}-${idx}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  background:
                    "linear-gradient(90deg, #EAD9FF 0%, #DECDFE 100%)",
                  color: "#291F35",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))
          ) : (
            <p style={{ color: "#9A91A5", fontSize: 14 }}>No tags available</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleEdit}
          style={{
            flex: 1,
            borderRadius: 12,
            background: "#291F35",
            color: "#fff",
            padding: "14px 0",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            flex: 1,
            borderRadius: 12,
            border: "1.5px solid #D11A2A",
            background: "#fff",
            color: "#D11A2A",
            padding: "14px 0",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🗑️ Delete
        </button>
      </div>

      {/* Modals */}
      {showRescheduleModal && (
        <RescheduleModal
          newDate={newDate}
          setNewDate={setNewDate}
          handleSaveReschedule={handleSaveReschedule}
          onClose={() => setShowRescheduleModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/* ---------------------- Reschedule Modal ---------------------- */
function RescheduleModal({
  newDate,
  setNewDate,
  handleSaveReschedule,
  onClose,
}: {
  newDate: string;
  setNewDate: (v: string) => void;
  handleSaveReschedule: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "90%",
          maxWidth: 400,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Reschedule Outfit
        </h3>
        <p style={{ marginBottom: 10, color: "#5B516C" }}>Choose a new date:</p>
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 20,
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              borderRadius: 12,
              border: "1.5px solid #291F35",
              background: "#fff",
              color: "#291F35",
              padding: "10px 0",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveReschedule}
            style={{
              flex: 1,
              borderRadius: 12,
              background: "#291F35",
              color: "#fff",
              padding: "10px 0",
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Delete Confirm Modal ---------------------- */
function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          width: "90%",
          maxWidth: 360,
        }}
      >
        <h4 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>
          Delete this outfit?
        </h4>
        <p style={{ color: "#5B516C", marginTop: 8, marginBottom: 16 }}>
          This will also remove any calendar entry linked to it.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "1.5px solid #291F35",
              background: "#fff",
              color: "#291F35",
              padding: "10px 0",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              borderRadius: 10,
              border: "none",
              background: "#D11A2A",
              color: "#fff",
              padding: "10px 0",
              fontWeight: 700,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
