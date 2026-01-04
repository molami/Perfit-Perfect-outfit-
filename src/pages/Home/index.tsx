// src/pages/Home/index.tsx
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { auth } from "../../firebase/config";

const WEATHER_API_KEY = "16bec202aae14a33085704704d08d4e0";

type ForecastDay = {
  date: string;
  temp_min: string; // stored as string because we call toFixed(0) at creation
  temp_max: string;
  icon: string;
};

type ClosetItem = {
  id: string;
  url: string;
  category: string;
  subcategory?: string;
};

export default function Home() {
  const today = new Date();

  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [todayEvent, setTodayEvent] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear] = useState(today.getFullYear()); // no unused setter

  // ✅ Load user and related data
  const loadData = async () => {
    const user = auth.currentUser;

    if (user) {
      setUserName(
        user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User"
      );

      if (user.photoURL) {
        setProfilePic(user.photoURL);
        localStorage.setItem("profilePic", user.photoURL);
      } else {
        const savedPic = localStorage.getItem("profilePic");
        if (savedPic) setProfilePic(savedPic);
      }
    }

    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      setEvents(parsed);
      findTodayEvent(parsed);
    }

    // ✅ Check weather freshness
    const lastUpdated = localStorage.getItem("weatherLastUpdated");
    const savedWeather = localStorage.getItem("weatherData");
    const savedForecast = localStorage.getItem("weatherForecast");

    const lastUpdateDate = lastUpdated ? new Date(lastUpdated) : null;
    const isSameDay =
      lastUpdateDate &&
      new Date().toDateString() === lastUpdateDate.toDateString();

    if (isSameDay && savedWeather && savedForecast) {
      setWeather(JSON.parse(savedWeather));
      setForecast(JSON.parse(savedForecast));
    } else {
      await fetchAndStoreWeather();
    }
  };

  // ✅ Fetch current + forecast weather
  const fetchAndStoreWeather = async () => {
    let locationData = localStorage.getItem("location");
    if (!locationData) {
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              };
              localStorage.setItem("location", JSON.stringify(coords));
              locationData = JSON.stringify(coords);
              resolve();
            },
            (err) => reject(err)
          );
        });
      } catch {
        console.warn("Location permission denied.");
        return;
      }
    }

    if (!locationData) return;
    const { latitude, longitude } = JSON.parse(locationData);

    try {
      // 🌦️ Current weather
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

      // 📅 5-day forecast (3-hour intervals)
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const forecastData = await forecastRes.json();

      // Group by day (get one reading per day)
      const dailyForecast: ForecastDay[] = [];
      const seen: Record<string, boolean> = {};

      for (const item of forecastData.list) {
        const date: string = item.dt_txt.split(" ")[0];
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

      setWeather(weatherInfo);
      setForecast(dailyForecast.slice(0, 5));
      localStorage.setItem("weatherData", JSON.stringify(weatherInfo));
      localStorage.setItem("weatherForecast", JSON.stringify(dailyForecast));
      localStorage.setItem("weatherLastUpdated", new Date().toISOString());
    } catch (err) {
      console.error("Weather fetch failed:", err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      auth.currentUser?.reload().then(() => {
        loadData();
      });
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findTodayEvent = (allEvents: any[]) => {
    const todayISO = today.toISOString().split("T")[0];
    const eventToday = allEvents.find(
      (e) =>
        e.start?.date === todayISO || e.start?.dateTime?.startsWith(todayISO)
    );
    setTodayEvent(eventToday ? eventToday.summary : null);
  };

  // ✅ Calendar setup
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const adjustedStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const hasEventOnDay = (day: number) => {
    const dateString = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split("T")[0];
    return events.some(
      (e) =>
        e.start?.date === dateString ||
        e.start?.dateTime?.startsWith(dateString)
    );
  };

  const days: JSX.Element[] = [];
  for (let i = 0; i < adjustedStart; i++) days.push(<div key={`empty-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();
    const hasEvent = hasEventOnDay(d);

    days.push(
      <div
        key={d}
        style={{
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          backgroundColor: isToday
            ? "#291F35"
            : hasEvent
            ? "#65558F"
            : "transparent",
          color: isToday || hasEvent ? "#fff" : "#291F35",
          fontWeight: isToday ? 700 : 400,
        }}
      >
        {d}
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#65558F",
    color: "#fff",
    borderRadius: "20px",
    padding: "20px",
    margin: "0 24px 16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        fontFamily: "Inter, sans-serif",
        paddingBottom: "80px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: "#E5DEFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #65558F",
          }}
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#65558F", fontSize: "22px" }}>👤</span>
          )}
        </div>
        <h2 style={{ color: "#291F35", fontSize: "20px", fontWeight: 600 }}>
          Hello, {userName}
        </h2>
      </div>

      {/* WEATHER CARD */}
      <div style={cardStyle}>
        {weather ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "18px" }}>
                  📍 {weather.city || "Unknown"}
                </div>
                <div style={{ fontSize: "42px", fontWeight: 700 }}>
                  {weather.temp}°C
                </div>
                <div style={{ fontSize: "16px", textTransform: "capitalize" }}>
                  {weather.description}
                </div>
                <div style={{ fontSize: "13px", opacity: 0.8, marginTop: 4 }}>
                  Updated{" "}
                  {new Date(
                    localStorage.getItem("weatherLastUpdated") || ""
                  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt="icon"
                style={{ width: 60, height: 60 }}
              />
            </div>

            {/* Forecast preview */}
            {forecast.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                {forecast.map((day) => {
                  const date = new Date(day.date);
                  const weekday = date.toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  return (
                    <div key={day.date} style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>
                        {weekday}
                      </div>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                        alt="forecast"
                        style={{ width: 32, height: 32 }}
                      />
                      <div style={{ fontSize: 12, marginTop: 2 }}>
                        {day.temp_max}° / {day.temp_min}°
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: "16px" }}>Enable location to view weather 🌦️</p>
        )}
      </div>

      {/* EVENT CARD */}
      <div style={cardStyle}>
        {todayEvent ? (
          <>
            <div style={{ fontSize: "16px" }}>
              📅 {today.toLocaleDateString()}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 600 }}>{todayEvent}</div>
          </>
        ) : (
          <p style={{ fontSize: "16px" }}>Nothing scheduled for today ☀️</p>
        )}
      </div>

      {/* CALENDAR */}
      <div style={{ padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h3 style={{ color: "#374151", fontWeight: 600 }}>
            {months[currentMonth]} {currentYear}
          </h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setCurrentMonth((m) => (m === 0 ? 11 : m - 1))}
              style={{
                fontSize: "18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#65558F",
              }}
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentMonth((m) => (m === 11 ? 0 : m + 1))}
              style={{
                fontSize: "18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#65558F",
              }}
            >
              ›
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
            textAlign: "center",
            color: "#291F35",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>Su</div>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}
        >
          {days}
        </div>
      </div>

      <HomeSuggestionsWidget weather={weather} todayEvent={todayEvent} />

      <BottomNav />
    </div>
  );
}

/* ---------------- Outfit Suggestions Widget ---------------- */
function HomeSuggestionsWidget({
  weather,
  todayEvent,
}: {
  weather: any;
  todayEvent: string | null;
}) {
  const navigate = useNavigate();
  const closet: ClosetItem[] = JSON.parse(
    localStorage.getItem("closetItems") || "[]"
  );

  const condition =
    weather?.description?.toLowerCase().includes("rain") ||
    weather?.description?.toLowerCase().includes("cold")
      ? "Rainy"
      : "Hot";

  const needsLayer = ["Rainy", "Harmattan"].includes(condition);

  const pick = (cats: string[]) => {
    const matches: ClosetItem[] = closet.filter((i: ClosetItem) =>
      cats.includes(i.category)
    );
    return matches.length
      ? matches[Math.floor(Math.random() * matches.length)]
      : null;
  };

  const outfit: Array<ClosetItem | null> = [];
  const top = pick(["Shirt", "Blouse"]);
  const bottom = pick(["Trousers", "Skirt"]);
  const shoes = pick(["Shoes", "Sandals"]);
  const jacket = pick(["Jacket", "Sweater"]);
  if (needsLayer && jacket) outfit.push(jacket);
  outfit.push(top, bottom, shoes);

  const nonNullOutfit = outfit.filter(
    (x): x is ClosetItem => Boolean(x)
  );

  return (
    <div
      style={{
        margin: "24px",
        background: "linear-gradient(180deg,#F6EEFF 0%,#EDE4FF 100%)",
        borderRadius: 20,
        padding: "16px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontWeight: 700, color: "#291F35" }}>
        ✨ Today's Outfit Suggestion
      </h3>

      {nonNullOutfit.length > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {nonNullOutfit.map((item) => (
            <img
              key={item.id}
              src={item.url}
              alt={item.category}
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                objectFit: "contain",
                background: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: "#9A91A5", fontSize: 14 }}>
          Add more items to your closet to get suggestions 👗
        </p>
      )}

      <button
        onClick={() => {
          const today = new Date().toISOString().split("T")[0];
          localStorage.setItem(
            "selectedSuggestionContext",
            JSON.stringify({
              selectedDateForSuggestion: today,
              selectedEventForSuggestion: todayEvent || "",
              inferredOccasion:
                todayEvent?.toLowerCase().includes("meeting") ||
                todayEvent?.toLowerCase().includes("office")
                  ? "Office"
                  : todayEvent?.toLowerCase().includes("party") ||
                    todayEvent?.toLowerCase().includes("wedding")
                  ? "Party"
                  : "Casual",
            })
          );
          navigate("/suggestions");
        }}
        style={{
          marginTop: 12,
          border: "none",
          borderRadius: 999,
          background: "#291F35",
          color: "#fff",
          padding: "10px 0",
          width: "100%",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        See More Suggestions →
      </button>
    </div>
  );
}
