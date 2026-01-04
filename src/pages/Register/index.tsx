import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  updateProfile,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "../../firebase/config";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);             // email/password flow
  const [googleLoading, setGoogleLoading] = useState(false); // Google flow
  const [stayLoggedIn, setStayLoggedIn] = useState(true);    // persistence

  const didHandleRedirect = useRef(false);

  // ✅ Complete Google redirect if popup was blocked/closed
  useEffect(() => {
    (async () => {
      if (didHandleRedirect.current) return;
      didHandleRedirect.current = true;
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          const info = getAdditionalUserInfo(res);
          const isNew = !!info?.isNewUser;
          navigate(isNew ? "/register-success" : "/home", { replace: true });
        }
      } catch (err) {
        console.error("Google Redirect Error:", err);
      }
    })();
  }, [navigate]);

  // ✍️ Email/Password register → always new user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) return setError("Please enter your name.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      await setPersistence(
        auth,
        stayLoggedIn ? browserLocalPersistence : browserSessionPersistence
      );

      const cred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      // Save display name (best effort)
      if (cred.user && trimmedName) {
        try {
          await updateProfile(cred.user, { displayName: trimmedName });
        } catch (profileErr) {
          console.warn("updateProfile failed (non-blocking):", profileErr);
        }
      }

      // ✅ brand new account → success page
      navigate("/register-success", { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (err?.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Google Register (popup → redirect fallback)
  const handleGoogle = async () => {
    if (googleLoading) return;
    setError("");
    setGoogleLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await setPersistence(
        auth,
        stayLoggedIn ? browserLocalPersistence : browserSessionPersistence
      );

      // Try popup first
      const result = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(result);
      const isNew = !!info?.isNewUser;

      navigate(isNew ? "/register-success" : "/home", { replace: true });
    } catch (err: any) {
      console.warn("Google Popup Error:", err?.code || err);

      const POPUP_ISSUES = new Set([
        "auth/popup-closed-by-user",
        "auth/popup-blocked",
        "auth/cancelled-popup-request",
      ]);

      if (POPUP_ISSUES.has(err?.code)) {
        try {
          // Fallback to redirect; navigation handled in useEffect above
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error("Google Redirect Error:", redirectErr);
          setError("Google sign-in failed. Please try again.");
        }
      } else if (err?.code === "auth/operation-not-allowed") {
        setError("Google sign-in is disabled in Firebase Console.");
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("This domain isn’t authorized for sign-in.");
      } else if (err?.code === "auth/account-exists-with-different-credential") {
        setError("This email exists with a different sign-in method.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
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
        <h1 style={{ color: "#291F35", fontSize: "24px" }}>Welcome</h1>
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
          onClick={() => navigate("/login")}
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
          Login
        </button>
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
        <label style={{ color: "#291F35", fontWeight: 600 }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          style={{
            border: "1.5px solid #291F35",
            borderRadius: "40px",
            padding: "12px 16px",
            fontSize: "15px",
            outline: "none",
          }}
        />

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
          placeholder="Create a password (min 6 chars)"
          style={{
            border: "1.5px solid #291F35",
            borderRadius: "40px",
            padding: "12px 16px",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <label style={{ color: "#291F35", fontWeight: 600 }}>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Re-enter your password"
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
              userSelect: "none",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
            />
            Stay Logged in
          </label>
          <span style={{ fontSize: 12, color: "#9A91A5" }}>
            By registering, you agree to our Terms.
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
          disabled={loading || googleLoading}
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
            opacity: loading || googleLoading ? 0.7 : 1,
          }}
        >
          {loading ? "Creating account..." : "Register"}
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

      {/* Google Register */}
      <button
        onClick={handleGoogle}
        disabled={googleLoading || loading}
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
          opacity: googleLoading || loading ? 0.7 : 1,
          pointerEvents: googleLoading || loading ? "none" : "auto",
        }}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google Icon"
          style={{ width: "22px", height: "22px" }}
        />
        {googleLoading ? "Connecting..." : "Sign up with Google"}
      </button>
    </div>
  );
}
