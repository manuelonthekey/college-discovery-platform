# 🎓 College Dhundo — College Discovery Platform

A full-stack web application for exploring and comparing Indian engineering colleges. Search by name, location, courses, fees, ratings, and placement packages — then compare up to 3 colleges side-by-side in an interactive matrix.

---

## ✨ Features

- 🔍 **Smart Search** — Search by college name or short name (e.g., "IIT", "BITS")
- 📍 **Location Filter** — Filter colleges by city or region
- 🏷️ **Quick Course Tags** — One-click filters for Computer, Electrical, Mechanical, Software & Chemical engineering
- 🎛️ **Advanced Filters** — Refine results by:
  - Maximum annual budget (fees)
  - Minimum user rating (4.0+, 4.5+, 4.8+)
  - Minimum average placement package
  - Top recruiter name (e.g., Google, Adobe)
- 📋 **College Detail Modal** — Click any card to see full placement stats, fee breakdown, top recruiters, programs offered, and a link to the official website
- ⚖️ **Side-by-Side Comparison** — Select up to 3 colleges and compare them on a rich matrix covering location, fees, placements, recruiters, and ratings
- 🌙 **Dark / Light Mode** — Persisted to localStorage across sessions
- 📱 **Responsive Design** — Fully functional on mobile and desktop

---

## 🛠️ Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool and dev server |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |
| **Vanilla CSS** | Styling (custom design system with CSS variables) |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | REST API framework |
| **Mongoose 9** | MongoDB ODM |
| **MongoDB Atlas** | Cloud database |
| **CORS** | Cross-origin request handling |
| **Nodemon** | Auto-restart during development |

---

## 📁 Project Structure

```
college-discovery-platform/
│
├── client/                       # React frontend
│   ├── src/
│   │   ├── App.jsx               # Main application component
│   │   ├── App.css               # All styles (design system + components)
│   │   ├── index.css             # Global resets and base styles
│   │   └── main.jsx              # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                       # Express backend
    ├── models/
    │   └── College.js            # Mongoose schema
    ├── routes/
    │   └── collegeRoutes.js      # GET /api/colleges with all filters
    ├── data/
    │   ├── mockColleges.json     # Seed data (IIT Bombay, BITS Pilani, DTU)
    │   └── seed.js               # Database seeder script
    ├── server.js                 # Express app entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and cluster

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/college-discovery-platform.git
cd college-discovery-platform
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Update the MongoDB connection string in `server/server.js` and `server/data/seed.js` with your own Atlas URI:

```js
const MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/collegeDB?retryWrites=true&w=majority";
```

**Seed the database:**

```bash
npm run data:import
```

**Start the backend dev server:**

```bash
npm run dev
```

The server will run on **http://localhost:5000**.

### 3. Set Up the Frontend

```bash
cd ../client
npm install
npm run dev
```

The app will run on **http://localhost:5173** (or the next available port).

---

## 🔌 API Reference

### `GET /api/colleges`

Returns a list of colleges with optional filtering and sorting.

| Query Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Search by college name or short name (regex, case-insensitive) |
| `city` | `string` | Filter by city (regex, case-insensitive) |
| `maxFees` | `number` | Maximum total annual fees (INR) |
| `minRating` | `number` | Minimum user rating (0–5) |
| `minAveragePackage` | `number` | Minimum average placement package (INR) |
| `recruiter` | `string` | Filter by top recruiter name (regex) |
| `course` | `string` (repeatable) | Filter by featured course — multiple values are ANDed |
| `sort` | `string` | MongoDB sort field(s), comma-separated |

**Example Request:**
```
GET /api/colleges?city=Mumbai&minRating=4.5&course=Computer
```

**Example Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "Indian Institute of Technology, Bombay",
      "shortName": "IIT Bombay",
      "location": { "city": "Mumbai", "state": "Maharashtra" },
      "fees": { "totalEstimatedFeesPerYear": 270000 },
      "placements": { "averagePackage": 2180000, "highestPackage": 16800000 },
      "rating": 4.9,
      "featuredCourses": ["Computer Science and Engineering (B.Tech)"],
      "website": "https://www.iitb.ac.in"
    }
  ]
}
```

---

## 🗃️ College Data Schema

Each college document in MongoDB follows this structure:

```js
{
  name: String,                     // Full official name
  shortName: String,                // Abbreviation (e.g., "IIT Bombay")
  established: Number,              // Year founded
  location: {
    city: String,
    state: String,
    country: String,                // Default: "India"
    address: String
  },
  fees: {
    tuitionFeePerYear: Number,
    hostelFeePerYear: Number,
    otherChargesPerYear: Number,
    totalEstimatedFeesPerYear: Number,
    currency: String                // Default: "INR"
  },
  placements: {
    academicYear: String,
    placementPercentage: Number,
    averagePackage: Number,
    medianPackage: Number,
    highestPackage: Number,
    topRecruiters: [String],
    currency: String
  },
  rating: Number,                   // 0.0 – 5.0
  featuredCourses: [String],
  website: String
}
```

---

## 🧪 Seed Data

The project ships with seed data for 3 colleges in `server/data/mockColleges.json`:

| College | City | Avg Package | Rating |
|---|---|---|---|
| IIT Bombay | Mumbai | ₹21.8 LPA | ⭐ 4.9 |
| BITS Pilani | Pilani | ₹19.5 LPA | ⭐ 4.7 |
| DTU | New Delhi | ₹15.4 LPA | ⭐ 4.5 |

Run `npm run data:import` from the `/server` directory to populate your database.

---

## 🎨 UI Highlights

- **Glassmorphism** sticky compare bar with backdrop blur
- **Framer Motion** card animations with stagger and layout transitions
- **CSS variables** based design system supporting full dark/light theming
- **Modal overlays** with blurred dimmed backdrop
- **Comparison matrix** grid — highlights pricing in brand colour and packages in green
- **Responsive** layout collapsing to single column on mobile

---

## 📜 Available Scripts

### Client (`/client`)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |

### Server (`/server`)
| Command | Description |
|---|---|
| `npm run dev` | Start server with Nodemon (hot reload) |
| `npm start` | Start server with Node |
| `npm run data:import` | Seed MongoDB with mock college data |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request


