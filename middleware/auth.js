// =============================================================================
// Файл: middleware/auth.js
// Описание: Middleware для проверки JWT токена и аутентификации запросов.
// =============================================================================
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Загружаем переменные окружения

const auth = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Нет токена, авторизация отклонена" });
  }

  // Токен обычно приходит в формате "Bearer TOKEN_STRING"
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Неверный формат токена" });
  }

  try {
    // Проверяем токен с использованием секрета из переменных окружения
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Добавляем ID пользователя в объект запроса
    next(); // Передаем управление следующему middleware/роуту
  } catch (err) {
    // Если токен недействителен (просрочен, изменен и т.д.)
    res.status(401).json({ message: "Токен недействителен" });
  }
};

export default auth; // Экспортируем middleware по умолчанию
