import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Onboarding2() {
  const navigate = useNavigate();

  const handleNext = () => navigate("/onboarding3");
  const handlePrev = () => navigate("/onboarding1");
  const handleSkip = () => navigate("/login"); // temporary path

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Top Illustration Section */}
      <div
        style={{
          flex: 1.5,
          position: "relative",
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "40px",
        }}
      >
        {/* Prev button */}
        <button
          onClick={handlePrev}
          style={{
            position: "absolute",
            top: "32px",
            left: "24px",
            background: "none",
            border: "none",
            color: "#291F35",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Prev
        </button>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          style={{
            position: "absolute",
            top: "32px",
            right: "24px",
            background: "none",
            border: "none",
            color: "#291F35",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Skip
        </button>

        {/* Image */}
        <motion.img
          src="/images/onboarding2.jpg"
          alt="Your Digital Wardrobe"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: "80%",
            maxWidth: 350,
          }}
        />
      </div>

      {/* Bottom Purple Section */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          flex: 1,
          backgroundColor: "#65558F",
          color: "#FFFFFF",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Text */}
        <div>
          <h1
            style={{
              fontSize: "22px",
              letterSpacing: "2px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            YOUR DIGITAL WARDROBE
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              maxWidth: "90%",
            }}
          >
            Upload and organize your clothes in one place.
          </p>
        </div>

        {/* Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleNext}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "2px solid white",
              borderRadius: "30px",
              color: "#FFFFFF",
              fontSize: "16px",
              padding: "10px 24px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "20px", marginBottom: "2px" }}>›</span> Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}
