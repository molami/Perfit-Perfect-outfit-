# 👗 Perfit — Smart Outfit Planning/ Information Management System

Perfit (Perfect Outfit) is a **context-aware outfit planning web application** designed to simplify daily clothing decisions.
It helps users digitize their wardrobe and receive **weather- and event-based outfit suggestions** using a **lightweight, rule-based decision system** instead of heavy AI.

The project focuses on **usability, accessibility, and decision support**, particularly for users in regions with fluctuating weather conditions and busy daily schedules.

---

## 🚀 Live Application

👉 **Live Demo:** https://perfit-smart-closet.web.app/

---

## 📌 Background & Motivation

Daily outfit selection is often a **stressful, time-consuming, and instinct-driven process**, especially for students and young professionals.
Weather variability (cold mornings, hot afternoons, unexpected rain) and scheduled events make manual outfit planning inefficient and unreliable.

While existing digital wardrobe tools such as **Cladwell**, **Acloset**, and **Stylebook** offer intelligent recommendations, they often:

* Rely heavily on complex AI systems
* Are not well-adapted to African contexts
* Sacrifice simplicity and usability

**Perfit was created to bridge this gap** by offering a **simple, user-centered outfit planning system** that leverages real-time contextual data without overengineering.

---

## 🎯 Aim & Objectives

### Aim

To design a **user-centric outfit planning system** that reduces decision fatigue by providing **weather- and event-based outfit recommendations**.

### Objectives

* Enable users to upload, tag, and manage wardrobe items
* Integrate real-time **weather data** and **calendar events**
* Implement a **rule-based recommendation engine**
* Provide a responsive and intuitive user interface for outfit planning

---

## 👥 Target Users

* **Students & Young Professionals**
  Need practical outfit planning tools that adapt to lifestyle and weather changes.
* **Everyday Fashion Enthusiasts**
  Want to optimize wardrobe usage, reduce outfit repetition, and make appropriate clothing choices.

---

## ✨ Core Features

* 👚 **Wardrobe Management** — Upload, tag, categorize, and view clothing items
* 🌦 **Weather Integration** — Real-time local weather updates via API
* 📅 **Calendar Integration** — Event-based outfit planning using Google Calendar
* 🧠 **Rule-Based Recommendations** — Context-aware outfit suggestions without AI
* 📆 **Outfit Scheduling** — Plan and preview outfits ahead of time
* 📱 **Responsive Design** — Accessible on web and mobile devices

---

## 🏗 System Architecture

Perfit uses a **Client-Heavy Three-Tier Architecture**, designed for performance and scalability:

### 1️⃣ Presentation Layer (Frontend)

* Built with **React + TypeScript**
* Handles user interactions, wardrobe management, and UI rendering
* Executes the **rule-based recommendation logic client-side**

### 2️⃣ Application Layer (Rule Engine)

* Applies predefined rules using:

  * Wardrobe data
  * Weather conditions
  * Calendar events
* Generates context-aware outfit suggestions

### 3️⃣ Data Layer (Cloud Services)

* **Firebase** — Authentication and NoSQL database
* **Cloudinary** — Secure storage for wardrobe images
* **External APIs** — Weather and Calendar integrations

---

## 🧠 Recommendation Logic (No AI)

Perfit intentionally avoids machine learning to remain:

* Lightweight
* Transparent
* Easy to maintain
* Accessible on low-resource devices

All recommendations are generated using **rule-based decision logic** executed on the client side.

---

## 🛠 Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**

### Backend & Cloud Services

* **Firebase Authentication**
* **Firebase NoSQL Database**
* **Firebase Hosting**
* **Cloudinary (Image Storage)**

### APIs

* **OpenWeatherMap API**
* **Google Calendar API (via Google Identity Services)**

---

## 📦 Getting Started (Local Development)

### 1️⃣ Clone the Repository

```bash
git clone git@github.com:molami/Perfit-Perfect-outfit-for-every-occassion.git
cd Perfit-Perfect-outfit-for-every-occassion
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Development Server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## 🚀 Deployment

The application is deployed using **Firebase Hosting**.

### Manual Deployment

```bash
npm run build
firebase deploy
```

---

## 🔒 Security & Reliability

* Secure authentication via **Firebase Auth**
* Encrypted image storage on **Cloudinary**
* Client-heavy logic minimizes server-side attack surface
* Reliable cloud infrastructure ensures high availability

---

## ⚠️ Scope & Limitations

### Scope

* Manual wardrobe upload and tagging
* Weather- and event-based outfit suggestions
* Calendar-based outfit planning
* Web and mobile accessibility

### Limitations

* No machine learning or AI-based recommendations
* Internet connection required for most features
* Offline support is limited

---

 ## 📖 Significance of the Project

* **For Users:** Reduces daily decision fatigue and stress
* **For Fashion Enthusiasts:** Encourages wardrobe optimization and reuse
* **For Developers & Researchers:** Demonstrates how rule-based systems and APIs can provide effective decision support without AI

---

## 📄 License

This project was developed for **academic and learning purposes**.

