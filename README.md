# CampSafe 🏕️

A real-time camping safety platform for monitoring, alerting, and coordinating emergency responses at campgrounds.

**Live Demo**: [campsafe-alpha.vercel.app](https://campsafe-alpha.vercel.app)

## 🎯 Features

- **Live Map Dashboard** - Real-time location tracking of campsites and emergency hotspots using Leaflet
- **SOS Alert System** - Instant emergency notifications with traceable coordinates
- **Tracker Grid** - Visual grid display of active trackers and their status
- **Real-time Updates** - Socket.io WebSocket integration for instant push notifications
- **Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **Admin Panel** - Manage users and monitor platform activity

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Next-gen build tool
- **Leaflet + React-Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Socket.io** - WebSocket server
- **SerialPort** - Hardware device communication
- **JWT + bcryptjs** - Authentication & security

## 📦 Installation

### Prerequisites
- Node.js 16+
- MongoDB (local or cloud)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Warris-web/campsafe.git
   cd campsafe
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and settings
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

The frontend will run on `http://localhost:5173` and backend on `http://localhost:5000`.

## 📋 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campsafe
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
SERIAL_PORT=/dev/ttyUSB0
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## 🚀 Available Scripts

### Backend
```bash
npm run dev          # Start development server with auto-reload
npm start            # Start production server
npm run seed         # Seed database with sample data
npm run create-admin # Create admin user
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📁 Project Structure

```
campsafe/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── App.jsx
│   └── package.json
├── server/               # Express backend
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Express middleware
│   │   ├── controllers/  # Business logic
│   │   └── server.js     # Entry point
│   ├── scripts/          # Utility scripts
│   └── package.json
└── README.md
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Environment variable management
- ✅ Serial port input validation

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user

### Trackers
- `GET /api/trackers` - List all trackers
- `GET /api/trackers/:id` - Get tracker details
- `POST /api/trackers` - Create new tracker
- `PUT /api/trackers/:id` - Update tracker
- `DELETE /api/trackers/:id` - Delete tracker

### Alerts
- `GET /api/alerts` - List all alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert status

## 🔌 WebSocket Events

Real-time communication via Socket.io:

```javascript
// Client events
socket.emit('tracker:update', { id, location, status })
socket.emit('alert:send', { message, coordinates })

// Server events
socket.on('tracker:location', (data) => {})
socket.on('alert:received', (data) => {})
socket.on('system:status', (data) => {})
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Verify network access if using MongoDB Atlas

### Serial Port Not Found
- List available ports: `node -e "require('serialport').SerialPort.list().then(p => console.log(p))"`
- Update `SERIAL_PORT` in `.env`

### CORS Errors
- Verify backend and frontend URLs match
- Check Socket.io origin settings in `server.js`

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ for camping safety**
