import { z } from "zod";

export const registerSchema = z.object({
    name: z.string()
        .min(5, 'Введите полное имя (минимум 5 символов)')
        .regex(/^[a-zA-Zа-яА-Я\s]+$/, 'Имя может содержать только буквы и пробелы'),

    gender: z.literal(["male", "female"],'Выберите пол'),

    birthday: z.string()
        .min(1, 'Укажите дату рождения')
        .refine((date) => {
            const birthday = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthday.getFullYear();
            return age >= 18 && age <= 100;
        }, 'Возраст должен быть от 18 до 100 лет'),

    phone: z.string()
        .min(10, 'Введите корректный номер телефона'),

    speciality: z.string()
        .min(1, 'Выберите специальность'),

    email: z.string()
        .min(1, 'Введите email')
        .email('Некорректный формат email'),

    password: z.string()
        .min(6, 'Минимум 6 символов')
        .regex(/[A-Za-z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
});
