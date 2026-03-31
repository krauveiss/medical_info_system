import type { CommentModel } from "./CommentModel"
import type { Speciality } from "./Speciality"

export type ConsultationModel = {
    id: string,
    createTime: string,
    inspectionId?: string,
    speciality?: Speciality,
    comments?: CommentModel[]
}