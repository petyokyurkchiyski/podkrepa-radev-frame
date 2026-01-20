const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function processFrame() {
    try {
        console.log('Зареждане на рамката...');
        const image = await loadImage('podkrepa_za_radev_frame_fb.png');
        
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        const centerX = width / 2;
        const centerY = height / 2;
        const innerRadius = Math.min(width, height) * 0.38;
        const frameRadius = Math.min(width, height) * 0.48;
        
        function isWhite(x, y) {
            if (x < 0 || x >= width || y < 0 || y >= height) return false;
            const idx = (Math.floor(y) * width + Math.floor(x)) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            return a > 0 && r >= 248 && g >= 248 && b >= 248;
        }
        
        function isInInnerCircle(x, y) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist <= innerRadius;
        }
        
        function isOutsideFrame(x, y) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist > frameRadius;
        }
        
        function isPartOfFlag(x, y) {
            for (let dy = -20; dy <= 20; dy++) {
                for (let dx = -20; dx <= 20; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const idx = (ny * width + nx) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        const a = data[idx + 3];
                        
                        if (a === 0) continue;
                        
                        const isGreen = g > r + 20 && g > b + 20 && g < 250;
                        const isRed = r > g + 20 && r > b + 20 && r < 250;
                        
                        if (isGreen || isRed) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        
        function isNearTextOrFlag(x, y) {
            const isInBottomArea = y > height * 0.65;
            if (isInBottomArea) {
                const isNearFlag = x > width * 0.60;
                const isNearText = x > width * 0.20 && x < width * 0.80;
                return isNearFlag || isNearText;
            }
            return false;
        }
        
        console.log('Обработване на пикселите...');
        let removedCount = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const a = data[idx + 3];
                
                if (a === 0) continue;
                
                if (isWhite(x, y) && isOutsideFrame(x, y)) {
                    data[idx + 3] = 0;
                    removedCount++;
                    continue;
                }
                
                if (isWhite(x, y) && isInInnerCircle(x, y) && !isPartOfFlag(x, y) && !isNearTextOrFlag(x, y)) {
                    data[idx + 3] = 0;
                    removedCount++;
                }
            }
        }
        
        console.log(`Премахнати ${removedCount} бели пиксела`);
        
        ctx.putImageData(imageData, 0, 0);
        
        const buffer = canvas.toBuffer('image/png');
        const outputPath = 'podkrepa_za_radev_frame_fb_transparent.png';
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`✅ Готово! Файлът е създаден: ${outputPath}`);
    } catch (error) {
        console.error('Грешка:', error);
        process.exit(1);
    }
}

processFrame();
