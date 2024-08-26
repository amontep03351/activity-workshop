const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));


// เชื่อมต่อกับ MongoDB
mongoose.connect('mongodb+srv://localthaistores:Pd83fQnU1p8jItX6@cluster0.sr1js.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {

    serverSelectionTimeoutMS: 50000 // เพิ่มเวลาในการรอการเชื่อมต่อ
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB Atlas:', err.message));


// สร้าง Schema
const activitySchema = new mongoose.Schema({
   ActivityName: { type: String, required: true },
   ActivityDescription: { type: String },
   TotalParticipants: { type: Number, default: 0 },
   Participants: [
       {
           ParticipantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
           JoinedAt: { type: Date, default: Date.now }
       }
   ]
});

const participantSchema = new mongoose.Schema({
    ActivityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    PhoneNumber: { type: String, required: true },
    JoinedAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);
const Participant = mongoose.model('Participant', participantSchema);



// API 1: ดึงกิจกรรมทั้งหมด
app.get('/activities', async (req, res) => {
    try {
        const activities = await Activity.find();
        res.json(activities);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// API 2: ดึงรายละเอียดกิจกรรมแต่ละรายการ
app.get('/activities/:id', async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).send('Activity not found');
        res.json(activity);
    } catch (error) {
        res.status(500).send('Server error');
    }
});
// API 3: ดูรายชื่อผู้เข้าร่วมกิจกรรม
app.get('/activities/:id/participants', async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id).populate('Participants.ParticipantId', 'FirstName LastName PhoneNumber');
        if (!activity) return res.status(404).send('Activity not found');

        const participants = activity.Participants.map(participant => ({
            FirstName: participant.ParticipantId.FirstName,
            LastName: participant.ParticipantId.LastName,
            PhoneNumber: participant.ParticipantId.PhoneNumber,
            JoinedAt: participant.JoinedAt
        }));

        res.json(participants);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// API 4: เช็คว่าผู้เข้าร่วมกิจกรรมได้ลงทะเบียนแล้วหรือยัง
app.post('/activities/:id/check', async (req, res) => {
    try {
        const { FirstName, LastName, PhoneNumber } = req.body;
        const activityId = req.params.id;

        // ตรวจสอบว่าผู้ใช้คนนี้เข้าร่วมกิจกรรมนี้แล้วหรือยัง
        const existingParticipant = await Participant.findOne({
            ActivityId: activityId,
            FirstName: FirstName,
            LastName: LastName,
            PhoneNumber: PhoneNumber
        });

        if (existingParticipant) {
            return res.status(200).send('Participant already registered for this activity');
        } else {
            return res.status(404).send('Participant not found for this activity');
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// API 5: เพิ่มผู้เข้าร่วมกิจกรรม
app.post('/activities/:id/join', async (req, res) => {
    try {
        const { FirstName, LastName, PhoneNumber } = req.body;
        const activity = await Activity.findById(req.params.id);
        if (!activity) return res.status(404).send('Activity not found');

        const participant = new Participant({
            ActivityId: req.params.id,
            FirstName,
            LastName,
            PhoneNumber
        });

        await participant.save();

        activity.TotalParticipants += 1;
        activity.Participants.push({ ParticipantId: participant._id, JoinedAt: participant.JoinedAt });
        await activity.save();

        res.status(201).send('Participant added successfully');
    } catch (error) {
        res.status(500).send('Server error');
    }
});



// เปิดหน้า index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/welcome-container', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome_container.html'));
});

// เริ่มเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
