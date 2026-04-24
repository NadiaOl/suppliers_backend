// =============================================================================
// Файл: models/Contact.js
// Описание: Схема Контактов, которая будет вложена в модель Manufacturer.
// =============================================================================
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true, // Убирает случайные пробелы
    lowercase: true, // Преобразует "User@Mail.Com" в "user@mail.com"
    match: [/^\S+@\S+\.\S+$/, "Пожалуйста, введите корректный email"], // Базовая проверка регуляркой
  },
  phone: {
    type: String,
    trim: true,
    // Минимальная и максимальная длина, чтобы не сохраняли пустые или слишком длинные строки
    minlength: [10, "Номер телефона слишком короткий"],
    maxlength: [20, "Номер телефона слишком длинный"],
  },
});

// Экспортируем только схему, так как она будет использоваться как поддокумент
export default contactSchema;
