const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/recordings', express.static('uploads'));

app.post('/api/save-audio', upload.single('audio'), async (req, res) => {
    try {
        const file = req.file;
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const filePath = path.join('uploads', fileName);
        
        await db.saveRecording(fileName, filePath);
        
        const url = `${req.protocol}://${req.get('host')}/recordings/${fileName}`;
        res.json({ url });
    } catch (error) {
        console.error('Error saving audio:', error);
        res.status(500).json({ error: 'Failed to save audio' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));