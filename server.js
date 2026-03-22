const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Официален банер — винаги от файла, без подмяна
app.get('/assets/pb_banner_lockup.png', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'assets', 'pb_banner_lockup.png'), (err) => {
        if (err) {
            console.error('Грешка при зареждане на официалния банер:', err);
            res.status(404).send('Официалният банер не е намерен');
        }
    });
});

app.get(/^\/assets\/frame_overlay\.png/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'assets', 'frame_overlay.png'), (err) => {
        if (err) res.status(404).send('frame_overlay.png не е намерен. Пуснете: python build_frame_overlay.py');
    });
});

app.get('/liftapp.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'liftapp.png'), (err) => {
        if (err) res.status(404).send('Файлът liftapp.png не е намерен');
    });
});

// Статични файлове
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
