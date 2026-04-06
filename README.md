# 🌱 PlantPal

A fun, production-quality plant care mobile app where you can add plants by photo, get automatic plant identification, manage watering schedules, and receive goofy notifications when your plants need water.

> _"Barry just called. He said you're a terrible plant parent. 🌵"_

---

## 📱 Features

- **📸 Plant identification** – Snap a photo and identify any plant using the PlantNet API
- **💧 Smart watering schedules** – Auto-suggested watering intervals based on species
- **🔔 Goofy notifications** – Escalating (and hilarious) reminders when plants need water
- **🏡 Household sharing** – Share a plant list with housemates via invite code
- **🌙 Dark mode** – Easy on the eyes at night
- **📴 Offline support** – Firestore offline persistence

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Mobile | React Native + Expo (TypeScript) |
| Backend | Firebase (Auth, Firestore, Cloud Functions) |
| State | Zustand |
| Notifications | Expo Notifications (local + push) |
| Plant ID | PlantNet API |
| Animations | React Native Reanimated |
| Navigation | React Navigation (bottom tabs + stack) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Firebase project](https://console.firebase.google.com/)
- [PlantNet API key](https://my-api.plantnet.org/) (optional – app uses mock data without it)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RobbeG-immalle/PlantPal.git
   cd PlantPal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase and PlantNet credentials:

   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   PLANTNET_API_KEY=your_plantnet_key
   ```

4. **Start the app**

   ```bash
   npx expo start
   ```

   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go on your phone

---

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (start in test mode for development)
4. Copy your config values into `.env`

### Firestore Security Rules (recommended for production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /households/{householdId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.memberIds;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.memberIds;
    }
    match /plants/{plantId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/households/$(resource.data.householdId))
          .data.memberIds.hasAny([request.auth.uid]);
    }
    match /invitations/{invId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Deploy Cloud Functions

```bash
cd functions
npm install
npm run deploy
```

---

## 🌿 PlantNet API

Sign up for a free API key at [my-api.plantnet.org](https://my-api.plantnet.org).

Without an API key, the app uses **mock plant identification data** – perfect for development!

---

## 📁 Project Structure

```
PlantPal/
├── App.tsx                      # Root component
├── firebase.config.ts           # Firebase initialization
├── src/
│   ├── navigation/              # React Navigation setup
│   ├── screens/
│   │   ├── auth/                # Login, Signup, Onboarding
│   │   ├── home/                # Plant list
│   │   ├── plant/               # Add plant, Plant detail
│   │   ├── household/           # Household management
│   │   └── settings/            # App settings
│   ├── components/              # Reusable UI components
│   ├── hooks/                   # Business logic hooks
│   ├── stores/                  # Zustand state stores
│   ├── services/                # Firebase & API services
│   ├── utils/                   # Helper functions & constants
│   ├── types/                   # TypeScript type definitions
│   └── theme/                   # Colors, spacing, typography
├── assets/                      # Images and icons
└── functions/                   # Firebase Cloud Functions
    └── src/index.ts
```

---

## 🔔 Notification System

PlantPal schedules **three escalating notifications** per plant:

| Trigger | Sass Level | Example |
|---|---|---|
| Day of watering | 😊 Friendly | "Barry is getting thirsty 👀" |
| 1 day late | 😤 Sassy | "You forgot Barry again. He's judging you." |
| 3+ days late | 💀 Emergency | "Barry is writing his will. Water him NOW. 📝" |

---

## 🌙 Dark Mode

Dark mode is toggled via Settings and persisted in `AsyncStorage`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-plant-feature`
3. Commit your changes: `git commit -m 'Add amazing plant feature'`
4. Push the branch: `git push origin feature/amazing-plant-feature`
5. Open a Pull Request

---

Made with 💚 by plant lovers, for plant lovers.

_Your plants deserve better than you. 🌵_