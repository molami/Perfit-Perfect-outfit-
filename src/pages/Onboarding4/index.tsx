import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Onboarding4() {
  const navigate = useNavigate();

  const handlePrev = () => navigate("/onboarding3");
 /*  const handleSkip = () => navigate("/login"); // or directly /register if you prefer */
  const handleStart = () => navigate("/login");

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
        {/* <button
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
        </button> */}

        {/* Image */}
        <motion.img
          src="/images/onboarding4.jpg"
          alt="Plan Ahead With Ease"
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
            PLAN AHEAD WITH EASE
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              maxWidth: "90%",
            }}
          >
            Schedule outfits for the week and always stay ready to slay! 👗✨
          </p>
        </div>

        {/* Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleStart}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#291F35",
              border: "2px solid white",
              borderRadius: "30px",
              color: "#FFFFFF",
              fontSize: "16px",
              padding: "12px 40px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </div>
  );
}