import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  IoCalendar,
  IoLocation,
  IoLockClosed,
  IoLogOut,
  IoPencil,
  IoClose,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  linkWithCredential, // ✅ needed for Set Password (Google-only)
} from "firebase/auth";
import { auth } from "../../firebase/config";
import BottomNav from "../../components/BottomNav";

const WEATHER_API_KEY = "16bec202aae14a33085704704d08d4e0";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [connectCalendar, setConnectCalendar] = useState(
    localStorage.getItem("connectCalendar") === "true"
  );
  const [useLocation, setUseLocation] = useState(
    localStorage.getItem("useLocationWeather") === "true"
  );
  const [isConnecting, setIsConnecting] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Derived: does this user already have the password provider?
  const hasPasswordProvider = !!user?.providerData?.some(
    (p: any) => p?.providerId === "password"
  );

  /* ---------------- AUTH SETUP ---------------- */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) setUser(u);
      else if (!loading) navigate("/login");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, loading]);

  /* ---------------- PROFILE PHOTO ---------------- */
  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        await updateProfile(user, { photoURL: data.secure_url });
        setUser({ ...user, photoURL: data.secure_url });
        localStorage.setItem("profilePic", data.secure_url);
        alert("✅ Profile picture updated!");
      } else {
        alert("❌ Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Something went wrong while uploading.");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- WEATHER + LOCATION ---------------- */
  const fetchWeatherAndForecast = async (latitude: number, longitude: number) => {
    try {
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const currentData = await currentRes.json();
      const weatherInfo = {
        temp: currentData.main.temp.toFixed(1),
        description: currentData.weather[0].description,
        city: currentData.name,
        icon: currentData.weather[0].icon,
      };

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const forecastData = await forecastRes.json();

      const dailyForecast: any[] = [];
      const seen: Record<string, boolean> = {};
      for (const item of forecastData.list) {
        const date = item.dt_txt.split(" ")[0];
        if (!seen[date]) {
          seen[date] = true;
          dailyForecast.push({
            date,
            temp_min: item.main.temp_min.toFixed(0),
            temp_max: item.main.temp_max.toFixed(0),
            icon: item.weather[0].icon,
          });
        }
      }

      localStorage.setItem("weatherData", JSON.stringify(weatherInfo));
      localStorage.setItem("weatherForecast", JSON.stringify(dailyForecast));
      localStorage.setItem("weatherLastUpdated", new Date().toISOString());

      alert(`✅ Weather and forecast updated for ${weatherInfo.city}`);
    } catch (err) {
      console.error("Weather fetch failed:", err);
      alert("❌ Failed to fetch weather data.");
    }
  };

  const handleToggleLocation = () => {
    if (!useLocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          localStorage.setItem("location", JSON.stringify({ latitude, longitude }));
          await fetchWeatherAndForecast(latitude, longitude);
          setUseLocation(true);
          localStorage.setItem("useLocationWeather", "true");
        },
        (err) => {
          console.error(err);
          alert("Location permission denied or unavailable.");
        }
      );
    } else {
      localStorage.removeItem("location");
      localStorage.removeItem("weatherData");
      localStorage.removeItem("weatherForecast");
      localStorage.removeItem("weatherLastUpdated");
      localStorage.setItem("useLocationWeather", "false");
      setUseLocation(false);
      alert("❌ Location and weather data cleared.");
    }
  };

  /* ---------------- GOOGLE CALENDAR ---------------- */
  const handleConnectCalendar = async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
      provider.addScope("https://www.googleapis.com/auth/userinfo.email");

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        localStorage.setItem("googleAccessToken", token);
        localStorage.setItem("connectCalendar", "true");
        setConnectCalendar(true);
        alert("✅ Google Calendar connected successfully!");
        await fetchGoogleCalendarEvents(token);
      } else {
        alert("Failed to get Google access token.");
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        alert("You closed the Google Sign-In popup.");
      } else if (error.code !== "auth/cancelled-popup-request") {
        console.error(error);
        alert("Failed to connect Google Calendar. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchGoogleCalendarEvents = async (token?: string) => {
    const accessToken = token || localStorage.getItem("googleAccessToken");
    if (!accessToken) return;

    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
          new URLSearchParams({
            maxResults: "10",
            orderBy: "startTime",
            singleEvents: "true",
            timeMin: new Date().toISOString(),
          }),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      if (data.items) {
        localStorage.setItem("calendarEvents", JSON.stringify(data.items));
        console.log("✅ Calendar events saved:", data.items);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  /* ---------------- PASSWORD: change OR set ---------------- */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setMessage("You must be logged in to update your password.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage("Please fill all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      if (hasPasswordProvider) {
        if (!oldPassword) {
          setMessage("Enter your current password.");
          return;
        }
        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          oldPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        setMessage("✅ Password changed successfully!");
      } else {
        // Google-only user → link email/password to this account
        const linkCred = EmailAuthProvider.credential(
          currentUser.email!,
          newPassword
        );
        await linkWithCredential(currentUser, linkCred);
        setMessage("✅ Password set successfully! You can now sign in with email & password.");
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage("");
      }, 1200);
    } catch (error: any) {
      console.error("Password update/link error:", error);
      if (error.code === "auth/wrong-password") {
        setMessage("❌ Incorrect current password.");
      } else if (error.code === "auth/credential-already-in-use") {
        setMessage("That email already has a password set.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Too many attempts. Please try again later.");
      } else {
        setMessage("❌ Failed to update password. Please try again.");
      }
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      auth.signOut();
      localStorage.clear();
      navigate("/login");
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, sans-serif",
          color: "#291F35",
        }}
      >
        Loading profile...
      </div>
    );

  /* ---------------- UI ---------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "Inter, sans-serif",
        color: "#291F35",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px 100px",
      }}
    >
      {/* Avatar */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <div
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: "#291F35",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img
            src={user?.photoURL || "/default-avatar.png"}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <label
            htmlFor="fileInput"
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              backgroundColor: "#65558F",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "3px solid #fff",
              cursor: "pointer",
            }}
          >
            {uploading ? (
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  border: "3px solid #fff",
                  borderTop: "3px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              <IoPencil size={20} color="#fff" />
            )}
          </label>
          <input
            id="fileInput"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <h2 style={{ fontWeight: 700, fontSize: "22px", marginBottom: "4px" }}>
        {user?.displayName || "User"}
      </h2>
      <p style={{ color: "#9A91A5", marginBottom: "40px" }}>
        {user?.email || "No email"}
      </p>

      {/* Settings */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <SettingToggle
          icon={<IoCalendar size={20} />}
          label="Connect Calendar"
          value={connectCalendar}
          onToggle={handleConnectCalendar}
        />

        <SettingToggle
          icon={<IoLocation size={20} />}
          label="Enable Location Access"
          value={useLocation}
          onToggle={handleToggleLocation}
        />

        {/* Security card always visible; label adapts */}
        <div
          onClick={() => setShowPasswordModal(true)}
          style={{
            backgroundColor: "#291F35",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <IoLockClosed size={20} />
            <span style={{ fontWeight: 500 }}>
              {hasPasswordProvider ? "Change Password" : "Set Password"}
            </span>
          </div>
          <span style={{ fontSize: "18px" }}>›</span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#291F35",
            border: "none",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: "center",
            marginTop: "16px",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <IoLogOut size={20} />
          Logout
        </button>
      </div>

      {/* ---------- Password Modal ---------- */}
      {showPasswordModal && (
        <div
          onClick={() => setShowPasswordModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h3 style={{ margin: 0, fontWeight: 700 }}>
                {hasPasswordProvider ? "Change Password" : "Set Password"}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#291F35",
                }}
                aria-label="Close"
                title="Close"
              >
                <IoClose />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: "grid", gap: 10 }}>
              {hasPasswordProvider && (
                <input
                  type="password"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1.5px solid #C9C2DB",
                  }}
                  required
                />
              )}

              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #C9C2DB",
                }}
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #C9C2DB",
                }}
                required
              />

              {message && (
                <div
                  style={{
                    marginTop: 4,
                    color: message.startsWith("✅") ? "#065f46" : "#b91c1c",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {message}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    flex: 1,
                    border: "1.5px solid #291F35",
                    background: "#fff",
                    color: "#291F35",
                    padding: "12px 0",
                    borderRadius: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    border: "none",
                    background: "#291F35",
                    color: "#fff",
                    padding: "12px 0",
                    borderRadius: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

/* ---------------- TOGGLE COMPONENT ---------------- */
function SettingToggle({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "#291F35",
        borderRadius: "12px",
        padding: "16px 20px",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onClick={onToggle}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {icon}
        <span style={{ fontWeight: 500 }}>{label}</span>
      </div>

      <label
        style={{
          position: "relative",
          display: "inline-block",
          width: "46px",
          height: "26px",
        }}
      >
        <input
          type="checkbox"
          checked={value}
          readOnly
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: "absolute",
            cursor: "pointer",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: value ? "#B9AEE5" : "#5B516C",
            borderRadius: "26px",
            transition: ".3s",
          }}
        >
          <span
            style={{
              position: "absolute",
              height: "20px",
              width: "20px",
              left: value ? "24px" : "4px",
              bottom: "3px",
              backgroundColor: "white",
              borderRadius: "50%",
              transition: ".3s",
            }}
          />
        </span>
      </label>
    </div>
  );
}
