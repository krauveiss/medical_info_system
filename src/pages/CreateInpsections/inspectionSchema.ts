import z from "zod";
import { ZodIssueCode } from "zod/v3";


export const inspectionSchema = z.object({
    date: z.string().refine(d => new Date(d) <= new Date(), {
        message: 'Дата не может быть в будущем'
    }),
    anamnesis: z.string().min(1, 'Обязательно к заполнению'),
    complaints: z.string().min(1, 'Обязательно'),
    treatment: z.string().min(1, 'Обязательно'),
    conclusion: z.enum(['Disease', 'Recovery', 'Death']),
    nextVisitDate: z.string().optional(),
    previousInspectionId: z.string().optional(),
    deathDate: z.string().optional(),
    diagnosis: z.array(z.object({
        icdDiagnosisId: z.string(),
        description: z.string(),
        type: z.enum(['Main', 'Concomitant', 'Complication']),
    })),
    consultations: z.array(
        z.object({
            specialityId: z.string(),
            comment: z.object({
                content: z.string().min(1, 'Введите комментарий')
            })
        })
    ).optional(),
}).superRefine((data, ctx) => {
    if (data.conclusion === 'Disease' && !data.nextVisitDate) {
        ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Нужна дата следующего визита',
            path: ['nextVisitDate']
        })
    }

    if (data.conclusion === 'Death' && !data.deathDate) {
        ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Нужна дата смерти',
            path: ['deathDate']
        });
    }
    const specs = data.consultations?.map(c => c.specialityId);
    if (specs && new Set(specs).size !== specs.length) {
        ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Специальности не должны повторяться',
            path: ['consultations']
        });
    }
    const diag = data.diagnosis?.map(c => c.type);
    if (!diag.includes('Main')) {
        ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Осмотр должен иметь минимум 1 диагноз с типом "Основной',
            path: ['diagnosis']
        });
    }

});