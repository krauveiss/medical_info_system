import type { DiagnosisType } from "./DiagnosisType"

export type DiagnosisModel = {
    id: string;
    createTime: string;
    code: string;
    name: string;
    description?: string;
    type: DiagnosisType;
};