import type { DoctorModel } from "./DoctorModel"

export type InspectionCommentModel = {
    id: string,
    createTime: string,
    parentId?: string
    content?: string,
    author?: DoctorModel
    modifyTime?: string
}