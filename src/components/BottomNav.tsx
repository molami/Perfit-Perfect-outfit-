import { NavLink } from "react-router-dom";
import { IoHome, IoCalendar, IoPerson, IoAlbums } from "react-icons/io5";

export default function BottomNav() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "80px",
        backgroundColor: "#291F35",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopLeftRadius: "30px",
        borderTopRightRadius: "30px",
        boxShadow: "0 -3px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Home */}
      <NavLink
        to="/home"
        style={({ isActive }) => ({
          color: isActive ? "#B9AEE5" : "#fff",
          textAlign: "center",
          textDecoration: "none",
          fontSize: "12px",
        })}
      >
        <IoHome size={26} />
        <div>Home</div>
      </NavLink>

      {/* Closet */}
      <NavLink
        to="/closet"
        style={({ isActive }) => ({
          color: isActive ? "#B9AEE5" : "#fff",
          textAlign: "center",
          textDecoration: "none",
          fontSize: "12px",
        })}
      >
        <IoAlbums size={26} />
        <div>Closet</div>
      </NavLink>

      {/* Calender */}
      <NavLink
        to="/calender"
        style={({ isActive }) => ({
          color: isActive ? "#B9AEE5" : "#fff",
          textAlign: "center",
          textDecoration: "none",
          fontSize: "12px",
        })}
      >
        <IoCalendar size={26} />
        <div>Calender</div>
      </NavLink>

      {/* Profile */}
      <NavLink
        to="/profile"
        style={({ isActive }) => ({
          color: isActive ? "#B9AEE5" : "#fff",
          textAlign: "center",
          textDecoration: "none",
          fontSize: "12px",
        })}
      >
        <IoPerson size={26} />
        <div>Profile</div>
      </NavLink>
    </nav>
  );
}
