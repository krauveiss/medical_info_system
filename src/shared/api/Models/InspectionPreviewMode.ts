import type { Conclusion } from "./Conclusion";
import type { DiagnosisModel } from "./DiagnosisModel";

export type InspectionPreviewModel = {
    id: string,
    createTime: string,
    previousId?: string,
    date: string,
    conclusion: Conclusion,
    doctorId: string,
    doctor: string,
    patientId: string,
    patient: string,
    diagnosis: DiagnosisModel,
    hasChain: boolean,
    hasNested: boolean
}