// =============================================================================
// Файл: routes/authRoutes.js
// Описание: Маршруты для регистрации и входа пользователей.
// =============================================================================
import express from "express";
import User from "../models/User.js"; // Импорт модели (обязательно с .js)
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Загружаем переменные окружения

const router = express.Router();

// POST /api/auth/signup - Регистрация нового пользователя
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Имя пользователя и пароль обязательны" });
  }

  try {
    // Проверяем, существует ли пользователь с таким именем
    let user = await User.findOne({ username });
    if (user) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким именем уже существует" });
    }

    // Создаем нового пользователя
    user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
});

// POST /api/auth/signin - Вход пользователя
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Имя пользователя и пароль обязательны" });
  }

  try {
    // Ищем пользователя по имени
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Неверные учетные данные" });
    }

    // Сравниваем введенный пароль с хешированным
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверные учетные данные" });
    }

    // Генерируем JWT токен
    const payload = {
      userId: user.id, // Используем ID пользователя как полезную нагрузку
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // Токен действителен 1 час

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
});

export default router; // Экспортируем маршрутизатор по умолчанию
