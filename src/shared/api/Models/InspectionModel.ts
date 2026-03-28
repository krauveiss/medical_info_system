import type { Conclusion } from "./Conclusion";
import type { DiagnosisModel } from "./DiagnosisModel";
import type { DoctorModel } from "./DoctorModel";
import type { InspectionConsultationModel } from "./InspectionConsultationModel";
import type { PatientCard } from "./PatientCard";

export type InspectionModel = {
    id: string,
    createTime: string,
    date?: string,
    anemnesis?: string,
    complaints?: string,
    treatment?: string,
    conclusion?: Conclusion,
    nextVisitDate?: string,
    deathDate?: string,
    baseInspectionId?: string,
    previousInspectionId?: string,
    patient?: PatientCard,
    doctor?: DoctorModel,
    diagnoses?: DiagnosisModel[],
    consultations?: InspectionConsultationModel


};