import type { InspectionCommentModel } from "./InspectionCommentModel"
import type { Speciality } from "./Speciality"

export type InspectionConsultationModel = {
    id: string,
    createTime: string,
    inspectionId?: string,
    speciality?: Speciality,
    rootComment?: InspectionCommentModel,
    commentsNumber: number

}