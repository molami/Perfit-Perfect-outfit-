import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Closet from "./pages/Closet";
import Calender from "./pages/Calender";
import Profile from "./pages/Profile";
import UploadItem from "./pages/UploadItem";
import ItemDetail from "./pages/ItemDetail";
import Outfit from "./pages/Outfit";
import OutfitDetail from "./pages/OutfitDetail";
import Styling from "./pages/Styling";
import Suggestions from "./pages/Suggestions"; 
import Splash from "./pages/Splash";
import Onboarding1 from "./pages/Onboarding1";
import Onboarding2 from "./pages/Onboarding2";
import Onboarding3 from "./pages/Onboarding3";
import Login from "./pages/Login";
import Onboarding4 from "./pages/Onboarding4";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetSuccess from "./pages/ResetSuccess";
import RegisterSuccess from "./pages/RegisterSuccess";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Onboarding Screens*/}
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding1" element={<Onboarding1 />} />
        <Route path="/onboarding2" element={<Onboarding2 />} />
        <Route path="/onboarding3" element={<Onboarding3 />} />
        <Route path="/onboarding4" element={<Onboarding4 />} />

        {/* Entry Screens*/}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        

        {/* 🏠 Core Screens */}
        <Route path="/home" element={<Home />} />

        {/* 👗 Closet & Items */}
        <Route path="/closet" element={<Closet />} />
        <Route path="/upload" element={<UploadItem />} />
        <Route path="/item/:id" element={<ItemDetail />} />

        {/* 👕 Outfits */}
        <Route path="/outfit" element={<Outfit />} />
        <Route path="/outfit/:id" element={<OutfitDetail />} />

        {/* 🧩 Styling & Smart Suggestions */}
        <Route path="/styling" element={<Styling />} />
        <Route path="/suggestions" element={<Suggestions />} /> 

        {/* 📅 Profile & Calendar */}
        <Route path="/calender" element={<Calender />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
