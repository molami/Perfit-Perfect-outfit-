import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import logoAnimation from "../../assets/lottie/logo.json";
import "./splash.css";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding1");
    }, 4000); // 4 seconds before auto-navigation
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="splash-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="splash-content">
        <Lottie
          animationData={logoAnimation}
          loop={false}
          style={{ width: 200, height: 200 }}
        />
        <motion.h1
          className="splash-title"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Perfit
        </motion.h1>
        <motion.p
          className="splash-tagline"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          The perfect outfit for every occasion
        </motion.p>
      </div>
    </motion.div>
  );
}