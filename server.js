// Импорт встроенного модуля для работы с файловой системой
const fs = require('fs');
// Импорт встроенного модуля для работы с путями файлов и папок
const path = require('path');
// Импорт фреймворка Express для создания веб-сервера
const express = require('express');
// Создание экземпляра приложения Express
const app = express();
// Порт, на котором будет запущен сервер
const PORT = 3000;

// Настройка статической раздачи файлов из текущей директории (__dirname)
app.use(express.static(__dirname));

// API-эндпоинт для получения списка изображений из папки images
app.get('/api/images', (req, res) => {
  // Абсолютный путь к папке с изображениями
  const imagesDir = path.join(__dirname, 'images');
  // Чтение содержимого папки images
  fs.readdir(imagesDir, (err, files) => {
    // Обработка ошибки чтения папки
    if (err) return res.status(500).json({ error: 'Ошибка чтения папки' });
    // Фильтрация только файлов с расширениями jpg, jpeg, png (регистр не важен)
    const imageFiles = files.filter(f => /\.(jpe?g|png)$/i.test(f));
    // Отправка клиенту массива имён файлов изображений
    res.json(imageFiles);
  });
});

// Запуск сервера на указанном порту
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});