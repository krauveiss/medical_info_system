import { useMutation, useQuery } from '@tanstack/react-query';
import type { CommentTreeItem } from '../../shared/api/Models/CommentTreeItem'
import { Button, Card, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import axiosInstance from '../../shared/api/axiosConfig';
import type { DoctorModel } from '../../shared/api/Models/DoctorModel';
import { useState } from 'react';
import type { AxiosError } from 'axios';

async function getDoctorInfo(): Promise<DoctorModel> {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;
}


async function addConsultComment(consult: string, parentId: string, content: string) {
    const { data } = await axiosInstance.post(`consultation/${consult}/comment`,
        {
            content: content,
            parentId: parentId
        }
    );
    return data;
}


async function editComment(commentId: string, content: string) {
    const { data } = await axiosInstance.put(`consultation/comment/${commentId}`,
        {
            content: content,
        }
    );
    return data;
}



const formatDateForInputInsp = (isoDate?: string) => {
    if (!isoDate) return '';
    let k = isoDate.split('T');
    let b = k[1].split(':');
    return `${k[0]} — ${b[0]}:${b[1]}`
};



type Props = {
    comment: CommentTreeItem
    consultId: string,
    mg: number,
    refetchFn: () => void
}

type AddCommentParams = {
    consultId: string
    parentId: string
    content: string
}

type EditCommentParams = {
    commentId: string
    content: string
}


const Comment = ({ comment, consultId, mg, refetchFn }: Props) => {
    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            Дата модификации: {formatDateForInputInsp(comment.modifiedDate)}
        </Tooltip>
    );

    const [open, setOpen] = useState(false);




    const mutation = useMutation({
        mutationFn: ({ consultId, parentId, content }: AddCommentParams) =>
            addConsultComment(consultId, parentId, content),
        onSuccess: () => refetchFn(),
        onError: (e) => {
            const error = e as AxiosError;
            alert((error?.response?.data as { message: string })?.message)
        }
    })

    const mutationEdit = useMutation({
        mutationFn: ({ commentId, content }: EditCommentParams) =>
            editComment(commentId, content),
        onSuccess: () => refetchFn(),
        onError: (e) => alert(e.message)
    })
    const { data } = useQuery({
        queryKey: ['doctor-info'],
        queryFn: getDoctorInfo,
    })
    const [isReplyOpen, setIsReplyOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [editText, setEditText] = useState('')

    console.log(comment);

    return (
        <div style={{ paddingLeft: mg + 10 }}>
            <Card >
                <Card.Header>{comment.author == data?.name ? `Вы` : comment.author}</Card.Header>
                <Card.Body>
                    {comment.content}
                </Card.Body>
                <Card.Footer>
                    <div className='d-flex flex-column justify-content-center align-items-center'>
                        <div>

                            {comment.createTime == comment.modifiedDate ? (

                                <div>{formatDateForInputInsp(comment.createTime)}</div>
                            ) : (
                                <OverlayTrigger
                                    placement="right"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={renderTooltip}
                                >
                                    <div>{formatDateForInputInsp(comment.createTime)} (изм)</div>
                                </OverlayTrigger>
                            )}

                            {comment.children?.length && comment.children?.length > 0 ? (
                                <Button variant="link" onClick={() => setOpen(!open)}> {open ? 'Скрыть ответы' : `Показать ответы (${comment.children.length})`} </Button>
                            ) : (<div></div>)}
                            <Button variant="link" onClick={() => { setIsReplyOpen(prev => !prev); setIsEditOpen(false) }}>
                                Ответить
                            </Button>
                            {comment.authorId == data?.id && (
                                <Button variant="link" onClick={() => { setIsEditOpen(prev => !prev); setIsReplyOpen(false); }}>
                                    Редактировать
                                </Button>
                            )}
                        </div>
                        {isReplyOpen && (
                            <div className='d-flex justify-content-center flex-column'>
                                <hr />
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Введите ответ"
                                    className='mt-1 mb-3'
                                />
                                <Button
                                    onClick={() => {
                                        setReplyText(''),
                                            setIsReplyOpen(false),
                                            mutation.mutate({
                                                consultId,
                                                parentId: comment.id,
                                                content: replyText
                                            });
                                    }}>
                                    Отправить
                                </Button>
                            </div>
                        )}
                        {isEditOpen && (
                            <div className='d-flex justify-content-center flex-column'>
                                <hr />
                                <Form.Control
                                    defaultValue={comment.content}
                                    as="textarea"
                                    rows={2}
                                    onChange={(e) => setEditText(e.target.value)}
                                    placeholder="Введите ответ"
                                    className='mt-1 mb-3'
                                />
                                <Button
                                    onClick={() => {
                                        setIsEditOpen(false),
                                            mutationEdit.mutate({
                                                commentId: comment.id,
                                                content: editText
                                            });
                                    }}>
                                    Редактировать
                                </Button>
                            </div>
                        )}
                    </div>
                </Card.Footer>
            </Card >
            {open && comment.children && comment.children.map(child => (
                <Comment comment={child} consultId={consultId} mg={mg + 13} key={child.id} refetchFn={refetchFn} />
            ))}
        </div>
    )
}

export default Comment