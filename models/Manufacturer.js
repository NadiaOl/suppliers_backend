// =============================================================================
// Файл: models/Manufacturer.js
// Описание: Модель производителя, содержащая массив продуктов.
// =============================================================================
import mongoose from "mongoose";
import productSchema from "./Product.js"; // Импортируем схему продукта (обязательно с .js)

const manufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: true, // Название производителя должно быть уникальным
      trim: true,
    },
    buyer: {
      // Покупатель, связанный с производителем
      type: String,
      required: true,
      trim: true,
    },
    currancy: {
      // Покупатель, связанный с производителем
      type: String,
      required: true,
      trim: true,
    },
    products: [productSchema], // Массив вложенных документов Product
  },
  { timestamps: true }
); // Добавляет поля createdAt и updatedAt автоматически

export default mongoose.model("Manufacturer", manufacturerSchema); // Экспортируем модель по умолчанию
