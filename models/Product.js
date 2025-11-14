// =============================================================================
// Файл: models/Product.js
// Описание: Схема продукта, которая будет вложена в модель Manufacturer.
// =============================================================================
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  totalPrice: {
    // Цена Total
    type: Number,
    required: true,
    min: 0, // Цена не может быть отрицательной
  },
  billPrice: {
    // Цена Bill
    type: Number,
    required: true,
    min: 0,
  },
  foc: {
    // FOC (Free of Charge - Бесплатно)
    type: Boolean,
    default: false,
  },
  plan: {
    // План (количество)
    type: Number,
    default: 0,
    min: 0,
  },
  fact: {
    // Факт (количество)
    type: Number,
    default: 0,
    min: 0,
  },
});

// Экспортируем только схему, так как она будет использоваться как поддокумент
export default productSchema;
