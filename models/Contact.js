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
    trim: true, // Убирает случайные пробелы
    lowercase: true, // Преобразует "User@Mail.Com" в "user@mail.com"
    match: [/^\S+@\S+\.\S+$/, "Пожалуйста, введите корректный email"], // Базовая проверка регуляркой
  },
  phone: {
    type: String,
    trim: true,
  },
});

// Экспортируем только схему, так как она будет использоваться как поддокумент
export default contactSchema;
