const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb+srv://localthaistores:Pd83fQnU1p8jItX6@cluster0.sr1js.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
   
    serverSelectionTimeoutMS: 50000 // เพิ่มเวลาในการรอการเชื่อมต่อ
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err.message));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define schemas and models
const testSchema = new mongoose.Schema({
    message: String
});
const TestModel = mongoose.model('Test', testSchema);

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: { type: String, unique: true }
});
const User = mongoose.model('User', userSchema);

const activitySchema = new mongoose.Schema({
    name: String,
    description: String,
    date: Date,
    spotsAvailable: Number
});
const Activity = mongoose.model('Activity', activitySchema);

// Test API endpoint
app.get('/api/test', async (req, res) => {
    try {
        let testDoc = await TestModel.findOne();
        if (!testDoc) {
            testDoc = new TestModel({ message: 'MongoDB connection is successful!' });
            await testDoc.save();
        }
        res.status(200).json(testDoc);
    } catch (err) {
        res.status(500).json({ message: 'Error testing database connection', error: err.message });
    }
});

// Register Route
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    try {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Phone number already in use' });
        }

        const newUser = new User({ firstName, lastName, phone });
        await newUser.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// List Activities Route
app.get('/api/activities', async (req, res) => {
   try {
       const activities = await Activity.find();
       res.status(200).json(activities);
   } catch (err) {
       res.status(500).json({ message: 'Server error' });
   }
});

// Handle default route (root URL)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
