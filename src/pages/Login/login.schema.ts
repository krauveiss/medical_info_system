import { z } from "zod";

export const loginschema = z.object({

    email: z.string()
        .min(1, 'Введите email')
        .email('Некорректный формат email'),

    password: z.string()
        .min(6, 'Минимум 6 символов')
        .regex(/[A-Za-z]/, 'Пароль должен содержать хотя бы одну букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
});