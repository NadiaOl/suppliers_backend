
// =============================================================================
// Файл: models/User.js
// Описание: Модель пользователя для аутентификации.
// =============================================================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Удаляет пробелы в начале и конце строки
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Добавляет поля createdAt и updatedAt автоматически

// Middleware Mongoose: хеширование пароля перед сохранением пользователя
userSchema.pre('save', async function(next) {
    // Проверяем, был ли пароль изменен или это новый пользователь
    if (!this.isModified('password')) {
        return next();
    }
    try {
        // Генерируем "соль" и хешируем пароль
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err); // Передаем ошибку дальше
    }
});

// Метод для сравнения введенного пароля с хешированным
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema); // Экспортируем модель по умолчанию

