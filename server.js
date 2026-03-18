const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route за рамката - трябва да е преди express.static за да работи правилно
app.get('/liftapp.png', (req, res) => {
    const rootPath = path.join(__dirname, 'liftapp.png');
    res.sendFile(rootPath, (err) => {
        if (err) {
            console.error('Грешка при зареждане на liftapp.png:', err);
            res.status(404).send('Файлът liftapp.png не е намерен');
        }
    });
});

// Статични файлове - след специфичните routes
app.use(express.static(__dirname));

// Настройка на multer за качване на файлове
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB лимит
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Само изображения са позволени!'));
        }
    }
});

// Главна страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile_frame_generator.html'));
});

// Мобилен симулатор
app.get('/mobile-simulator', (req, res) => {
    res.sendFile(path.join(__dirname, 'mobile_simulator.html'));
});

// Endpoint за качване и обработка на снимка
app.post('/api/process-image', upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Няма качена снимка!' });
        }

        // Връщаме изображението като base64
        const imageBase64 = req.file.buffer.toString('base64');
        const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

        res.json({ 
            success: true,
            imageDataUrl: imageDataUrl
        });
    } catch (error) {
        console.error('Грешка при обработка:', error);
        res.status(500).json({ error: 'Грешка при обработка на снимката' });
    }
});

// Стартиране на сървъра
app.listen(PORT, () => {
    console.log(`🚀 Сървърът работи на http://localhost:${PORT}`);
    console.log(`📸 Отворете в браузър: http://localhost:${PORT}`);
});
