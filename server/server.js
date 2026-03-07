const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();
console.log("MONGO_URI check:", process.env.MONGO_URI); // Debugging line   


const app = express();
const PORT = process.env.PORT || 3000;


const helmet = require('helmet');

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow your React app
    credentials: true
}));
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/multi_tracker_docker';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const habitRoutes = require('./routes/habitRoutes');
const fitnessRoutes = require('./routes/fitnessRoutes');
const upskillRoutes = require('./routes/upskillRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/upskill', upskillRoutes);

const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
