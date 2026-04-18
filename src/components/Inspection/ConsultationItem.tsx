import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Badge, Button, Card, Spinner } from 'react-bootstrap'

import axiosInstance from '../../shared/api/axiosConfig'
import type { CommentModel } from '../../shared/api/Models/CommentModel'
import type { CommentTreeItem } from '../../shared/api/Models/CommentTreeItem'
import type { ConsultationModel } from '../../shared/api/Models/ConsultationModel'
import type { InspectionConsultationModel } from '../../shared/api/Models/InspectionConsultationModel'
import Comment from './Comment'


const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};




async function fetchConsult(id: string): Promise<ConsultationModel> {
    const { data } = await axiosInstance.get(`/consultation/${id}`)
    return data;

}

type Props = {
    consult: InspectionConsultationModel
}
export const ConsultationItem = ({ consult }: Props) => {

    function buildCommentTree(comments: CommentModel[] | undefined): CommentTreeItem[] {
        const map = new Map();

        if (!comments || comments.length === 0) {
            return []
        }

        comments.forEach(item => {
            map.set(item.id, { ...item, children: [] })
        })

        const roots: CommentTreeItem[] = []

        comments.forEach(item => {
            if (item.parentId) {
                const parent = map.get(item.parentId);
                parent.children.push(map.get(item.id))
            }

            else {
                roots.push(map.get(item.id))
            }
        })
        return roots;

    }

    const [buttonShow, setButtonShow] = useState(true);

    const { data, refetch, isLoading } = useQuery({
        queryKey: ['consult', consult.id],
        queryFn: () => fetchConsult(consult.id),
        enabled: false
    })

    const comments: CommentTreeItem[] = buildCommentTree(data?.comments);
    return (
        <Card className='d-flex justify-content-center align-items-center' key={consult.id}>
            <Card.Header>
                <Badge bg='secondary'>{consult.speciality?.name}</Badge>  <Badge bg='secondary'>{consult.rootComment?.author?.name}</Badge> <Badge bg='secondary'>Дата: {formatDateForInput(consult.createTime)}</Badge>
            </Card.Header>
            <Card.Body style={{ width: "100%" }} className='d-flex justify-content-center flex-column gap-3'>
                <Button className={buttonShow ? "" : "d-none"} onClick={() => { refetch(); setButtonShow(false) }}>Загрузить комментарии</Button>
                <Spinner animation="border" variant="primary" className={isLoading ? "" : "d-none"}></Spinner>
                {comments?.map((comment) => (
                    <Comment comment={comment} key={comment.id} consultId={consult.id} mg={-10} refetchFn={refetch}></Comment>
                ))}
            </Card.Body>
        </Card >
    )
}
