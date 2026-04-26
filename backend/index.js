require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const discoveryRoutes = require('./src/routes/discovery.routes');
const swipeRoutes = require('./src/routes/swipe.routes');
const matchRoutes = require('./src/routes/match.routes');
const chatRoutes = require('./src/routes/chat.routes');
const photoRoutes = require('./src/routes/photo.routes');
const vibecheckRoutes = require('./src/routes/vibecheck.routes');
const venuesRoutes = require('./src/routes/venues.routes');
const superdateRoutes = require('./src/routes/superdate.routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => res.json({ ok: true, service: 'SuperDate API' }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/discovery', discoveryRoutes);
app.use('/swipes', swipeRoutes);
app.use('/matches', matchRoutes);
app.use('/chat', chatRoutes);
app.use('/photos', photoRoutes);
app.use('/vibe-checks', vibecheckRoutes);
app.use('/venues', venuesRoutes);
app.use('/superdate', superdateRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 SuperDate API running on port ${PORT}`));
