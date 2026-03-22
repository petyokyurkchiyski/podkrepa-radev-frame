#!/usr/bin/env node

/**
 * Автоматичен бекъп скрипт за profile_frame_generator.html
 * Поддържа последните 3 версии
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '.backups');
const SOURCE_FILE = path.join(__dirname, 'profile_frame_generator.html');
const MAX_BACKUPS = 3;

// Извличане на версията от файла
function extractVersion(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const versionMatch = content.match(/Версия\s+(\d+\.\d+\.\d+)/);
        if (versionMatch) {
            return versionMatch[1];
        }
        // Ако няма версия, използваме timestamp
        return `backup_${Date.now()}`;
    } catch (error) {
        console.error('Грешка при извличане на версия:', error);
        return `backup_${Date.now()}`;
    }
}

// Създаване на бекъп
function createBackup() {
    try {
        // Проверка дали съществува source файл
        if (!fs.existsSync(SOURCE_FILE)) {
            console.error('❌ Файлът profile_frame_generator.html не съществува!');
            process.exit(1);
        }

        // Създаване на бекъп директория ако не съществува
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log('✓ Създадена бекъп директория:', BACKUP_DIR);
        }

        // Извличане на версията
        const version = extractVersion(SOURCE_FILE);
        const backupFileName = `profile_frame_generator_v${version}.html`;
        const backupPath = path.join(BACKUP_DIR, backupFileName);

        // Проверка дали вече съществува бекъп с тази версия
        if (fs.existsSync(backupPath)) {
            console.log(`⚠️  Бекъп с версия ${version} вече съществува. Пропускане...`);
            return;
        }

        // Копиране на файла
        fs.copyFileSync(SOURCE_FILE, backupPath);
        console.log(`✓ Създаден бекъп: ${backupFileName}`);

        // Почистване на стари бекъпи (оставяме само последните MAX_BACKUPS)
        cleanupOldBackups();

        console.log('✅ Бекъпът е създаден успешно!');
    } catch (error) {
        console.error('❌ Грешка при създаване на бекъп:', error);
        process.exit(1);
    }
}

// Почистване на стари бекъпи
function cleanupOldBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('profile_frame_generator_v') && file.endsWith('.html'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                return {
                    name: file,
                    path: filePath,
                    time: fs.statSync(filePath).mtime.getTime()
                };
            })
            .sort((a, b) => b.time - a.time); // Сортиране по дата (най-новите първо)

        // Изтриване на стари бекъпи (оставяме само последните MAX_BACKUPS)
        if (files.length > MAX_BACKUPS) {
            const toDelete = files.slice(MAX_BACKUPS);
            toDelete.forEach(file => {
                fs.unlinkSync(file.path);
                console.log(`🗑️  Изтрит стар бекъп: ${file.name}`);
            });
        }

        console.log(`📦 Активни бекъпи: ${Math.min(files.length, MAX_BACKUPS)}/${MAX_BACKUPS}`);
    } catch (error) {
        console.error('⚠️  Грешка при почистване на стари бекъпи:', error);
    }
}

// Възстановяване на версия
function restoreVersion(version) {
    try {
        const backupPath = path.join(BACKUP_DIR, `profile_frame_generator_v${version}.html`);
        
        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Бекъп с версия ${version} не съществува!`);
            console.log('Достъпни версии:');
            listBackups();
            process.exit(1);
        }

        // Създаване на бекъп на текущата версия преди възстановяване
        if (fs.existsSync(SOURCE_FILE)) {
            const currentVersion = extractVersion(SOURCE_FILE);
            const currentBackup = path.join(BACKUP_DIR, `profile_frame_generator_v${currentVersion}_before_restore.html`);
            fs.copyFileSync(SOURCE_FILE, currentBackup);
            console.log(`✓ Създаден бекъп на текущата версия преди възстановяване`);
        }

        // Възстановяване
        fs.copyFileSync(backupPath, SOURCE_FILE);
        console.log(`✅ Версия ${version} е възстановена успешно!`);
    } catch (error) {
        console.error('❌ Грешка при възстановяване:', error);
        process.exit(1);
    }
}

// Списък на всички бекъпи
function listBackups() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            console.log('Няма бекъп директория.');
            return;
        }

        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('profile_frame_generator_v') && file.endsWith('.html'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    version: file.match(/v(\d+\.\d+\.\d+)/)?.[1] || 'unknown',
                    size: (stats.size / 1024).toFixed(2) + ' KB',
                    date: stats.mtime.toLocaleString('bg-BG')
                };
            })
            .sort((a, b) => {
                // Сортиране по версия (най-новите първо)
                const aVersion = a.version.split('.').map(Number);
                const bVersion = b.version.split('.').map(Number);
                for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
                    if ((bVersion[i] || 0) !== (aVersion[i] || 0)) {
                        return (bVersion[i] || 0) - (aVersion[i] || 0);
                    }
                }
                return 0;
            });

        if (files.length === 0) {
            console.log('Няма налични бекъпи.');
            return;
        }

        console.log('\n📦 Налични бекъпи:');
        files.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file.name}`);
            console.log(`     Версия: ${file.version} | Размер: ${file.size} | Дата: ${file.date}`);
        });
    } catch (error) {
        console.error('❌ Грешка при изброяване на бекъпи:', error);
    }
}

// Главна функция
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'create' || !command) {
    createBackup();
} else if (command === 'restore' && arg) {
    restoreVersion(arg);
} else if (command === 'list') {
    listBackups();
} else {
    console.log('Използване:');
    console.log('  node backup.js [create]  - Създаване на бекъп');
    console.log('  node backup.js restore <version>  - Възстановяване на версия (напр. 1.2.0)');
    console.log('  node backup.js list      - Списък на всички бекъпи');
}
