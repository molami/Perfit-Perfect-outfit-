import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CLOUDINARY_UPLOAD_PRESET = "unsigned_upload";
const CLOUDINARY_CLOUD_NAME = "dflmakzgw";

type Category = keyof typeof CATEGORY_MAP;

const CATEGORY_MAP = {
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

const OCCASION_FIT = [
  "Class",
  "Office",
  "Party",
  "Wedding",
  "Church/Mosque",
  "Traditional Event",
  "Hangout",
  "Date",
];

const EVENT_TYPES = ["Formal", "Semi-Formal", "Casual"];
const WEATHER_FIT = ["Hot", "Cool", "Rainy", "Harmattan"];

export default function UploadItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [occasionFit, setOccasionFit] = useState<string[]>([]);
  const [weatherFit, setWeatherFit] = useState<string[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (): Promise<string | null> => {
    if (!imageFile) return null;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setUploading(false);
      return data.secure_url || null;
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setUploading(false);
      return null;
    }
  };

  // ✅ Auto-tagging native outfits
  const handleSubcategorySelect = (sub: string) => {
    const nativeKeywords = ["Kaftan", "Agbada", "Buba & Wrapper", "Aso Oke", "Lace", "Senator"];
    const isNative = nativeKeywords.some((word) =>
      sub.toLowerCase().includes(word.toLowerCase())
    );

    if (subcategory === sub) {
      setSubcategory(null);
      return;
    }

    setSubcategory(sub);

    // auto-assign some defaults for native outfits
    if (isNative) {
      setOccasionFit(["Wedding", "Traditional Event", "Church/Mosque"]);
      setSelectedEventType("Formal");
    }
  };

  const toggleOccasion = (tag: string) => {
    setOccasionFit((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleWeather = (tag: string) => {
    setWeatherFit((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReset = () => {
    setPreview(null);
    setImageFile(null);
    setCategory(null);
    setSubcategory(null);
    setOccasionFit([]);
    setWeatherFit([]);
    setSelectedEventType(null);
  };

  const handleSave = async () => {
    if (!imageFile || !category) {
      alert("Please upload an image and select a category.");
      return;
    }

    const imageUrl = await uploadToCloudinary();
    const finalUrl = imageUrl || preview;
    if (!finalUrl) {
      alert("❌ Upload failed. Please try again.");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      url: finalUrl,
      category,
      subcategory,
      occasionFit,
      eventType: selectedEventType,
      weatherFit,
      createdAt: Date.now(),
    };

    const existing = JSON.parse(localStorage.getItem("closetItems") || "[]");
    localStorage.setItem("closetItems", JSON.stringify([...existing, newItem]));

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate("/closet");
    }, 1500);
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        color: "#291F35",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {success && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#2E8B57",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "16px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          ✅ Item added to your closet!
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
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
        <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Add New Item</h2>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          border: "2px dashed #291F35",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#291F35",
          color: "#fff",
          cursor: "pointer",
          overflow: "hidden",
          marginBottom: "24px",
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "28px", margin: 0 }}>+</p>
            <p>Picture</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />
      </div>

      {/* Category */}
      <Section title="Category">
        <ResponsiveGrid>
          {Object.keys(CATEGORY_MAP).map((cat) => (
            <SelectButton
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => {
                setCategory(cat as Category);
                setSubcategory(null);
              }}
            />
          ))}
        </ResponsiveGrid>
      </Section>

      {/* Subcategory */}
      {category && (
        <Section title="Subcategory">
          <ResponsiveGrid>
            {CATEGORY_MAP[category].map((sub) => (
              <SelectButton
                key={sub}
                label={sub}
                active={subcategory === sub}
                onClick={() => handleSubcategorySelect(sub)}
              />
            ))}
          </ResponsiveGrid>
        </Section>
      )}

      {/* Occasion Fit */}
      <Section title="Occasion Fit">
        <ResponsiveGrid>
          {OCCASION_FIT.map((occ) => (
            <SelectButton
              key={occ}
              label={occ}
              active={occasionFit.includes(occ)}
              onClick={() => toggleOccasion(occ)}
            />
          ))}
        </ResponsiveGrid>
      </Section>

      {/* Event Type */}
      <Section title="Event Type">
        <ResponsiveGrid>
          {EVENT_TYPES.map((type) => (
            <SelectButton
              key={type}
              label={type}
              active={selectedEventType === type}
              onClick={() => setSelectedEventType(type)}
            />
          ))}
        </ResponsiveGrid>
      </Section>

      {/* Weather Fit */}
      <Section title="Weather Fit">
        <ResponsiveGrid>
          {WEATHER_FIT.map((tag) => (
            <SelectButton
              key={tag}
              label={tag}
              active={weatherFit.includes(tag)}
              onClick={() => toggleWeather(tag)}
            />
          ))}
        </ResponsiveGrid>
      </Section>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
        <ActionButton
          label="Reset"
          onClick={handleReset}
          style={{
            backgroundColor: "#fff",
            color: "#291F35",
            border: "1.5px solid #291F35",
          }}
        />
        <ActionButton
          label={uploading ? "Uploading..." : "Save"}
          onClick={handleSave}
          disabled={uploading}
          style={{
            backgroundColor: "#291F35",
            color: "#fff",
            opacity: uploading ? 0.7 : 1,
          }}
        />
      </div>
    </div>
  );
}

/* ========== Helper Components ========== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>{title}</h3>
      {children}
    </div>
  );
}

function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "10px",
      }}
    >
      {children}
    </div>
  );
}

function SelectButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: "20px",
        border: "1.5px solid #291F35",
        padding: "10px",
        backgroundColor: active ? "#291F35" : "#fff",
        color: active ? "#fff" : "#291F35",
        cursor: "pointer",
        fontWeight: 500,
        width: "100%",
      }}
    >
      {label}
    </button>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  style,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        borderRadius: "16px",
        padding: "14px 0",
        fontSize: "16px",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {label}
    </button>
  );
}
