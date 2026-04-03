import z from "zod";
import { ZodIssueCode } from "zod/v3";

export const editInspectionSchema = z.object({
    anamnesis: z.string().optional(),
    complaints: z.string(),
    treatment: z.string(),
    conclusion: z.enum(['Disease', 'Recovery', 'Death']),
    nextVisitDate: z.string().optional(),
    deathDate: z.string().optional(),
    diagnoses: z.array(z.object({
        icdDiagnosisId: z.string(),
        description: z.string(),
        name: z.string().optional(),
        type: z.enum(['Main', 'Concomitant', 'Complication']),
    }))
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
    const diag = data.diagnoses?.map(c => c.type);
    if (!diag.includes('Main')) {
        ctx.addIssue({
            code: ZodIssueCode.custom,
            message: 'Осмотр должен иметь минимум 1 диагноз с типом "Основной',
            path: ['diagnoses']
        });
    }
});
