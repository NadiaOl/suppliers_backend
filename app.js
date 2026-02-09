// =============================================================================
// Файл: app.js (или index.js)
// Описание: Основной файл сервера Express.
// =============================================================================
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // Модуль для подключения к БД (обязательно с .js)
import authRoutes from "./routes/authRoutes.js"; // Маршруты аутентификации (обязательно с .js)
import manufacturerRoutes from "./routes/manufacturerRoutes.js"; // Маршруты производителей (обязательно с .js)
import dotenv from "dotenv";

dotenv.config(); // Загружаем переменные окружения из .env

const app = express();
const PORT = process.env.PORT || 5000; // Порт по умолчанию 5000

// Подключение к базе данных
connectDB();

// Middleware
app.use(cors()); // Включаем CORS для всех запросов
app.use(express.json()); // Парсинг JSON тела запросов (современная замена body-parser.json())
app.use(express.urlencoded({ extended: true })); // Для парсинга URL-encoded данных

// Основные маршруты
app.use("/api/auth", authRoutes);
app.use("/api/manufacturers", manufacturerRoutes);

// Простой корневой маршрут для проверки работы сервера
app.get("/", (req, res) => {
  res.send("API работает");
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
