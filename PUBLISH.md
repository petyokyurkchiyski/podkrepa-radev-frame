# 🚀 Публикуване на инструмента - Стъпка по стъпка

## Метод 1: Vercel (Най-лесно и безплатно) ⭐

### Стъпка 1: Регистрация в Vercel

1. Отидете на **https://vercel.com**
2. Кликнете на **"Sign Up"**
3. Изберете **"Continue with GitHub"** (най-лесно)
4. Авторизирайте Vercel да достъпи GitHub

### Стъпка 2: Качете проекта на GitHub

Ако още нямате GitHub repository:

```bash
# В папката на проекта
git init
git add .
git commit -m "Initial commit - Подкрепа за Румен Радев"

# Създайте нов repository в GitHub (github.com -> New repository)
# След това:
git remote add origin https://github.com/ВАШИЯТ-USERNAME/podkrepa-radev-frame.git
git branch -M main
git push -u origin main
```

### Стъпка 3: Публикуване в Vercel

1. В **Vercel Dashboard** кликнете **"Add New Project"**
2. Изберете вашия **GitHub repository** (`podkrepa-radev-frame`)
3. Vercel автоматично ще разпознае:
   - ✅ Node.js проект
   - ✅ `vercel.json` конфигурация
   - ✅ `package.json` зависимости
4. Кликнете **"Deploy"**

### Стъпка 4: Готово! 🎉

След 1-2 минути ще получите линк:
- **Production URL:** `https://your-app-name.vercel.app`
- **Preview URL:** (за всяка промяна)

**Споделете този линк с всеки!**

---

## Метод 2: Чрез Vercel CLI (Алтернатива)

Ако предпочитате командния ред:

```bash
# Инсталирайте Vercel CLI (ако нямате)
npm install -g vercel

# Или използвайте npx (без инсталация)
npx vercel

# Следвайте инструкциите:
# 1. Влезте в акаунта си
# 2. Потвърдете настройките
# 3. Vercel ще публикува автоматично

# За production:
npx vercel --prod
```

---

## 📋 Важни файлове

Уверете се, че следните файлове са в проекта:
- ✅ `profile_frame_generator.html` - главният файл
- ✅ `liftapp.png` - рамката без фон
- ✅ `server.js` - сървърът
- ✅ `package.json` - зависимостите
- ✅ `vercel.json` - конфигурацията (вече създаден)

---

## 🔄 Автоматично обновяване

След като проектът е свързан с GitHub:
- Всяка промяна в GitHub автоматично се публикува
- Vercel създава preview за всяка промяна
- Production се обновява при merge в main branch

---

## 💡 Съвети

1. **Безплатен план** на Vercel е достатъчен за този проект
2. **Custom domain** - можете да добавите свой домейн (опционално)
3. **Analytics** - Vercel показва статистика за посещения (безплатно)

---

## 🆘 Ако има проблеми

1. Проверете дали всички файлове са качени (особено `liftapp.png`)
2. Проверете логите в Vercel Dashboard
3. Уверете се че `vercel.json` е правилно конфигуриран

---

## 📱 След публикуване

След като инструментът е онлайн:
- ✅ Споделете линка в социалните мрежи
- ✅ Добавете линка в уебсайт
- ✅ Изпратете линка на хора, които искат да използват инструмента

**Примерен линк:** `https://podkrepa-radev-frame.vercel.app`
