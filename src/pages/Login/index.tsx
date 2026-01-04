import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase/config";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("✅ Google Sign-In Successful:", user);
      navigate("/home");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
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
        <h3 style={{ color: "#291F35", fontWeight: 400 }}>Hello, there</h3>
        <h1 style={{ color: "#291F35", fontSize: "24px" }}>Welcome Back</h1>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#291F35",
          borderRadius: "50px",
          padding: "4px",
          width: "90%",
          maxWidth: "380px",
          marginBottom: "24px",
        }}
      >
        <button
          style={{
            flex: 1,
            border: "none",
            borderRadius: "50px",
            backgroundColor: "#fff",
            color: "#291F35",
            fontWeight: 700,
            fontSize: "16px",
            padding: "12px",
            cursor: "default",
          }}
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          style={{
            flex: 1,
            border: "none",
            borderRadius: "50px",
            backgroundColor: "transparent",
            color: "#fff",
            fontWeight: 700,
            fontSize: "16px",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
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
          placeholder="Enter your email"
          style={{
            border: "1.5px solid #291F35",
            borderRadius: "40px",
            padding: "12px 16px",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <label style={{ color: "#291F35", fontWeight: 600 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
          style={{
            border: "1.5px solid #291F35",
            borderRadius: "40px",
            padding: "12px 16px",
            fontSize: "15px",
            outline: "none",
          }}
        />

        {/* Options */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "#291F35",
            }}
          >
            <input type="checkbox" /> Stay Logged in
          </label>
          {/* ✅ Updated Forgot Password link */}
          <span
            onClick={() => navigate("/forgot-password")}
            style={{
              color: "#1E3A8A",
              fontWeight: 500,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Forgot Password?
          </span>
        </div>

        {error && (
          <p
            style={{
              color: "#E05A5A",
              textAlign: "center",
              margin: "6px 0 0",
              fontSize: "14px",
            }}
          >
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* OR Divider */}
      <div
        style={{
          margin: "20px 0",
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          color: "#9A91A5",
        }}
      >
        <span style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
        <span style={{ fontSize: "14px", color: "#9A91A5" }}>or</span>
        <span style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
      </div>

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          border: "1.5px solid #291F35",
          borderRadius: "50px",
          padding: "12px 16px",
          width: "90%",
          maxWidth: "360px",
          backgroundColor: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          color: "#291F35",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google Icon"
          style={{ width: "22px", height: "22px" }}
        />
        Sign in with Google
      </button>
    </div>
  );
}

