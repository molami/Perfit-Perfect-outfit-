import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      navigate("/reset-success");
    } catch (err: any) {
      console.error("Reset error:", err);
      setError("Failed to send password reset email. Please try again.");
    } finally {
      // ✅ ensure loading stops regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h3 style={{ color: "#291F35", fontWeight: 400 }}>Reset Password</h3>
        <h1 style={{ color: "#291F35", fontSize: "24px" }}>
          Forgot your password?
        </h1>
        <p style={{ color: "#9A91A5", fontSize: "14px", marginTop: "8px" }}>
          Enter your registered email address and we’ll send you a reset link.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleResetPassword}
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#fff",
          borderRadius: "24px",
          border: "1.5px solid #291F35",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <label style={{ color: "#291F35", fontWeight: 600 }}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your registered email"
          style={{
            border: "1.5px solid #291F35",
            borderRadius: "40px",
            padding: "12px 16px",
            fontSize: "15px",
            outline: "none",
          }}
        />

        {message && (
          <p style={{ color: "green", textAlign: "center", fontSize: "14px" }}>
            {message}
          </p>
        )}
        {error && (
          <p style={{ color: "#E05A5A", textAlign: "center", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#291F35",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "14px",
            fontWeight: 700,
            fontSize: "16px",
            marginTop: "12px",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <button
        onClick={() => navigate("/login")}
        style={{
          background: "none",
          border: "none",
          color: "#291F35",
          marginTop: "20px",
          fontWeight: 600,
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        ← Back to Login
      </button>
    </div>
  );
}
