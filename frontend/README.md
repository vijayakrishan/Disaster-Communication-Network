# ResQMesh — React / Vite Operations Frontend

The **ResQMesh Frontend** is a real-time responsive web dashboard built with React 19 and Vite for emergency responders, administrators, and disaster victims. It provides live interactive mapping (Leaflet), SOS dispatch queue monitoring, relay mesh health visualization, survivor beacon management, and tactical communications.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with modern custom design tokens and flex/grid systems
- **Mapping & GIS**: [Leaflet](https://leafletjs.com/) and [React-Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## Directory Organization

```
frontend/
├── package.json               # Dependencies and build scripts
├── vite.config.js             # Vite configuration with React plugin
├── index.html                 # Main HTML entry point
├── public/                    # Static assets (favicons, SVG icons)
└── src/
    ├── api/                   # Centralized API endpoints & fetch client
    │   ├── apiClient.js
    │   └── endpoints.js
    ├── assets/                # Images, brand icons, and SVG resources
    │   ├── icons/
    │   ├── images/
    │   └── logos/
    ├── components/            # Reusable UI components & layouts
    │   ├── common/            # Shared queue, metrics, visualizer widgets
    │   ├── navbar/            # Role-specific top headers & status bars
    │   └── sidebar/           # Role-specific navigation sidebars
    ├── context/               # Global state (AppContext.jsx)
    ├── layouts/               # Layout shells (AdminLayout, WorkerLayout, UserLayout)
    ├── pages/                 # Role-based views & authenticated screens
    │   ├── auth/              # Landing page, login, registration, OTP
    │   ├── admin/             # Operations command dashboard, user & worker management
    │   ├── worker/            # Rescue responder console, team tracking, relays
    │   └── user/              # Victim dashboard, beacon registration, distress logs
    ├── services/              # Microservice domain service modules
    ├── styles/                # Global style sheets and variables
    ├── utils/                 # Utilities (phone formatting, helpers)
    ├── App.jsx                # Core router & role-based view switcher
    └── main.jsx               # Application bootstrap
```

---

## Environment Variables

Create a `.env` file in the `frontend` root or repository root:

```env
VITE_AUTH_API=http://localhost:8081
VITE_DEVICE_API=http://localhost:8082
VITE_USER_API=http://localhost:8083
VITE_STATION_API=http://localhost:8084
VITE_SOS_API=http://localhost:8085
VITE_RESCUE_API=http://localhost:8086
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
```
Production output files are written to `frontend/dist/`.
