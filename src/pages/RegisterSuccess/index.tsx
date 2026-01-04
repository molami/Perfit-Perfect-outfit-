import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        color: "#291F35",
      }}
    >
      {/* ✅ Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "#B9AEE5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <motion.span
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#291F35"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.span>
      </motion.div>

      {/* ✅ Text */}
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
        Account Created Successfully!
      </h2>
      <p style={{ fontSize: "15px", color: "#5B516C", marginBottom: "30px" }}>
        Welcome to <strong>Perfit Smart Closet</strong> 👗  
        Your account has been created. Let’s get started on planning your perfect outfits!
      </p>

      {/* ✅ Continue Button */}
      <button
        onClick={() => navigate("/home")}
        style={{
          backgroundColor: "#291F35",
          color: "#fff",
          border: "none",
          borderRadius: "50px",
          padding: "14px 28px",
          fontWeight: 600,
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Continue to Home
      </button>
    </div>
  );
}
