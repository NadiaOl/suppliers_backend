// =============================================================================
// Файл: config/db.js
// Описание: Модуль для подключения к базе данных MongoDB.
// =============================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Загружаем переменные окружения из .env

const connectDB = async () => {
  try {
    // Получаем URI MongoDB из переменных окружения
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error("Ошибка: Переменная окружения MONGO_URI не определена.");
      process.exit(1); // Завершаем процесс, если URI не найден
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB успешно подключена!");
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err.message);
    // Завершаем процесс при неудачном подключении
    process.exit(1);
  }
};

export default connectDB; // Экспортируем функцию по умолчанию
