# 🌿 Clean City Reporter
![Dashboard](<Screenshot 2026-04-13 at 1.13.14 AM.png>)
![Dashboard](<Screenshot 2026-04-13 at 1.13.33 AM.png>)
![all reports](<Screenshot 2026-04-13 at 1.12.51 AM.png>)
![LeaderBoard](<Screenshot 2026-04-13 at 1.13.44 AM.png>)

### AI-Powered Waste Management Platform for Smart Cities

A full-stack MERN application with 3D animations, AI analysis, and real-time complaint tracking.

---

## 📁 Project Structure

```
clean-city-reporter/
├── backend/          # Node.js + Express + MongoDB API
│   ├── models/       # User, Report schemas
│   ├── routes/       # auth, reports, ai, stats, users
│   ├── middleware/   # JWT auth, Cloudinary upload
│   └── server.js
└── frontend/         # React app with 3D Three.js + Leaflet maps
    └── src/
        ├── pages/    # Home, Reports, Dashboard, AdminPanel, MapView...
        ├── components/ # Navbar
        └── context/  # AuthContext
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Anthropic API key (for AI features)

---

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

**.env values needed:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/cleancity
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=sk-ant-...
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at **http://localhost:3000**

---

### 3. Seed Demo Data (Optional)

```bash
cd backend
node seed.js
```

This creates:
- Admin: `admin@cleancity.com` / `admin123`
- Citizen: `user@cleancity.com` / `user123`
- Sample reports with locations

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗑️ Report Issues | Upload photos, set location, describe the problem |
| 🤖 AI Analysis | Claude AI analyzes severity, recommends actions |
| 📍 Map View | Interactive dark map with all reports plotted |
| 📊 Dashboard | Charts, personal stats, complaint tracking |
| 👮 Admin Panel | Status management, user management |
| 🏆 Leaderboard | Gamification with points and rankings |
| 🔐 Auth | JWT-based login/register with role system |
| 📸 Photos | Cloudinary image upload, up to 5 per report |
| 💬 Comments | Community discussion on each report |
| 👍 Upvotes | Upvote to prioritize critical issues |

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with React Router v6
- Three.js (3D globe animation on homepage)
- Leaflet + React-Leaflet (interactive maps)
- Recharts (analytics charts)
- Framer Motion (page animations)
- React Dropzone (drag-drop file upload)

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose (geospatial queries with 2dsphere index)
- JWT authentication + bcryptjs
- Cloudinary (image storage)
- Anthropic Claude API (AI analysis)

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - List all (filterable)
- `GET /api/reports/:id` - Single report
- `POST /api/reports` - Create (auth required, supports multipart)
- `PUT /api/reports/:id/status` - Update status (admin)
- `POST /api/reports/:id/upvote` - Toggle upvote
- `POST /api/reports/:id/comments` - Add comment
- `GET /api/reports/user/my-reports` - My reports
- `GET /api/reports/nearby` - Nearby reports (geospatial)

### AI
- `POST /api/ai/analyze` - Analyze report with Claude
- `POST /api/ai/chat` - EcoBot chat
- `POST /api/ai/analyze/:reportId` - Save AI analysis to report

### Stats
- `GET /api/stats/overview` - Dashboard stats
- `GET /api/stats/leaderboard` - Top users

---

## 🎨 Design System

- **Color**: Dark green futuristic theme (`#030712` bg, `#22c55e` accent)
- **Fonts**: Exo 2 (display) + Space Mono (numbers)
- **Effects**: Glassmorphism cards, 3D globe, animated gradients
- **Maps**: Dark CartoDB tiles for reports map

---

## 🔮 AI Features

1. **Report Analysis** - Claude analyzes each report for:
   - Detected issues list
   - Recommended municipal actions
   - Priority score (1-10)
   - Estimated resolution time
   - Environmental impact assessment
   - Prevention tips

2. **EcoBot Chat** - Embedded AI chatbot for:
   - Waste disposal guidance
   - Recycling tips
   - How to file reports

---

## 📱 Roles

| Role | Permissions |
|---|---|
| `citizen` | File reports, upvote, comment |
| `municipal_officer` | All citizen + update report status |
| `admin` | All officer + user management |

---

Built with ❤️ for Smart Cities · Sustainability · AI for Good
