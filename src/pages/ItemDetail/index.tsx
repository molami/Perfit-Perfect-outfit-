import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ClosetItem = {
  id: string;
  url: string;
  category: string;
  subcategory?: string;
  occasions?: string[];
  eventType?: string;
  weather?: string[];
  createdAt: number;
};

const EVENT_TYPES = ["Formal", "Semi-Formal", "Casual"];
const OCCASIONS = [
  "Class",
  "Office",
  "Party",
  "Wedding",
  "Church/Mosque",
  "Traditional Event",
  "Hangout",
  "Date",
];
const WEATHER = ["Hot", "Rainy", "Harmattan", "Cool"];

const CATEGORY_MAP: Record<string, string[]> = {
  Shirt: ["T-shirt", "Polo", "Button-down", "Oversized", "Crop Shirt", "Sleeveless"],
  Skirt: ["Mini", "Midi", "Maxi", "Pleated", "Pencil"],
  Dress: ["Casual Dress", "Maxi Dress", "Bodycon Dress", "Lace Dress", "Native-inspired Dress"],
  Trousers: ["Jeans", "Cargo Pants", "Wide Leg", "Straight Cut", "Native Pants", "Shorts"],
  Shoes: ["Sneakers", "Flat Shoes", "Heels", "Loafers", "Leather", "Traditional"],
  Sandals: ["Flat Sandals", "Heeled Sandals", "Slides", "Ankara Sandals", "Leather Sandals"],
  Jacket: ["Denim Jacket", "Bomber Jacket", "Blazer", "Hoodie", "Cropped Jacket", "Cardigan"],
  Sweater: ["Pullover", "Cardigan", "Knitwear", "Light Sweater"],
  Native: ["Lace", "Aso Oke", "Kaftan", "Agbada", "Buba & Wrapper", "Senator"],
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<ClosetItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<ClosetItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 🧠 Load selected item
  useEffect(() => {
    const saved = localStorage.getItem("closetItems");
    if (saved && id) {
      const all = JSON.parse(saved);
      const found = all.find((x: ClosetItem) => x.id === id);
      setItem(found);
      setEditedItem(found ? { ...found } : null);
    }
  }, [id]);

  // 🗑️ Delete item
  const handleDelete = () => {
    const saved = localStorage.getItem("closetItems");
    if (!saved || !id) return;
    const all = JSON.parse(saved);
    const updated = all.filter((x: ClosetItem) => x.id !== id);
    localStorage.setItem("closetItems", JSON.stringify(updated));
    navigate("/closet");
  };

  // 💾 Save edits
  const handleSaveEdit = () => {
    if (!editedItem) return;
    const saved = localStorage.getItem("closetItems");
    if (!saved) return;

    const all = JSON.parse(saved);
    const updated = all.map((x: ClosetItem) =>
      x.id === editedItem.id ? editedItem : x
    );

    localStorage.setItem("closetItems", JSON.stringify(updated));
    setItem(editedItem);
    setIsEditing(false);
  };

  if (!item)
    return (
      <div
        style={{
          textAlign: "center",
          paddingTop: "40px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <p>Item not found.</p>
        <button
          onClick={() => navigate("/closet")}
          style={{
            background: "#291F35",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Back to Closet
        </button>
      </div>
    );

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "Inter, sans-serif",
        color: "#291F35",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            marginRight: "12px",
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Item Details</h2>
      </div>

      {/* Image */}
      <div
        style={{
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}
      >
        <img
          src={item.url}
          alt={item.category}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Category Info */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
          {item.category}
          {item.subcategory ? ` • ${item.subcategory}` : ""}
        </h3>
        <p style={{ color: "#6B6475" }}>
          Added on {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Tags Section */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Occasions</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {item.occasions?.length ? (
            item.occasions.map((occ) => (
              <span
                key={occ}
                style={{
                  background: "#E5DEFF",
                  color: "#291F35",
                  borderRadius: "16px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {occ}
              </span>
            ))
          ) : (
            <p style={{ color: "#aaa", fontSize: "14px" }}>No occasions tagged.</p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Event Type</h4>
        {item.eventType ? (
          <span
            style={{
              background: "#291F35",
              color: "#fff",
              borderRadius: "16px",
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {item.eventType}
          </span>
        ) : (
          <p style={{ color: "#aaa", fontSize: "14px" }}>No event type set.</p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ fontWeight: 700, marginBottom: "8px" }}>Weather Fit</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {item.weather?.length ? (
            item.weather.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#F4F0FF",
                  color: "#291F35",
                  borderRadius: "16px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))
          ) : (
            <p style={{ color: "#aaa", fontSize: "14px" }}>No weather fit set.</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={() => setIsEditing(true)}
          style={{
            background: "#291F35",
            color: "#fff",
            padding: "12px 28px",
            border: "none",
            borderRadius: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background: "#E05A5A",
            color: "#fff",
            padding: "12px 28px",
            border: "none",
            borderRadius: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>

      {/* ✏️ Edit Modal */}
      {isEditing && editedItem && (
        <EditModal
          editedItem={editedItem}
          setEditedItem={setEditedItem}
          handleSaveEdit={handleSaveEdit}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* 🗑️ Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              width: "90%",
              maxWidth: "350px",
              textAlign: "center",
            }}
          >
            <h3>Are you sure?</h3>
            <p style={{ color: "#555", marginBottom: "24px" }}>
              This item will be permanently deleted from your closet.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: "#ddd",
                  color: "#291F35",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
                style={{
                  background: "#E05A5A",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✏️ Edit Modal Component */
function EditModal({
  editedItem,
  setEditedItem,
  handleSaveEdit,
  onClose,
}: {
  editedItem: ClosetItem;
  setEditedItem: React.Dispatch<React.SetStateAction<ClosetItem | null>>;
  handleSaveEdit: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          width: "90%",
          maxWidth: "400px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: "16px" }}>Edit Item</h3>

        {/* Subcategory Dropdown */}
        <label style={{ fontWeight: 600 }}>Subcategory</label>
        <select
          value={editedItem.subcategory || ""}
          onChange={(e) =>
            setEditedItem({ ...editedItem, subcategory: e.target.value })
          }
          style={{
            width: "100%",
            marginBottom: "16px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Select subcategory</option>
          {(CATEGORY_MAP[editedItem.category] || []).map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        {/* Event Type */}
        <label style={{ fontWeight: 600 }}>Event Type</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setEditedItem({ ...editedItem, eventType: type })}
              style={{
                borderRadius: "16px",
                border: "1.5px solid #291F35",
                padding: "8px 12px",
                background:
                  editedItem.eventType === type ? "#291F35" : "#fff",
                color:
                  editedItem.eventType === type ? "#fff" : "#291F35",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Occasions */}
        <label style={{ fontWeight: 600 }}>Occasions</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              onClick={() =>
                setEditedItem({
                  ...editedItem,
                  occasions: editedItem.occasions?.includes(occ)
                    ? editedItem.occasions.filter((t) => t !== occ)
                    : [...(editedItem.occasions || []), occ],
                })
              }
              style={{
                borderRadius: "16px",
                border: "1.5px solid #291F35",
                padding: "8px 12px",
                background: editedItem.occasions?.includes(occ)
                  ? "#291F35"
                  : "#fff",
                color: editedItem.occasions?.includes(occ)
                  ? "#fff"
                  : "#291F35",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {occ}
            </button>
          ))}
        </div>

        {/* Weather */}
        <label style={{ fontWeight: 600 }}>Weather Fit</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          {WEATHER.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setEditedItem({
                  ...editedItem,
                  weather: editedItem.weather?.includes(tag)
                    ? editedItem.weather.filter((t) => t !== tag)
                    : [...(editedItem.weather || []), tag],
                })
              }
              style={{
                borderRadius: "16px",
                border: "1.5px solid #291F35",
                padding: "8px 12px",
                background: editedItem.weather?.includes(tag)
                  ? "#291F35"
                  : "#fff",
                color: editedItem.weather?.includes(tag)
                  ? "#fff"
                  : "#291F35",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "#ddd",
              color: "#291F35",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            style={{
              background: "#291F35",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
