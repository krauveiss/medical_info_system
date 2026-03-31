import { useMutation, useQuery } from '@tanstack/react-query';
import type { CommentTreeItem } from '../../shared/api/Models/CommentTreeItem'
import { Button, Card, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import axiosInstance from '../../shared/api/axiosConfig';
import type { DoctorModel } from '../../shared/api/Models/DoctorModel';
import { useState } from 'react';

async function getDoctorInfo(): Promise<DoctorModel> {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;
}


async function addConsultComment(): Promise<DoctorModel> {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;
}


const formatDateForInputInsp = (isoDate?: string) => {
    if (!isoDate) return '';
    let k = isoDate.split('T');
    let b = k[1].split(':');
    return `${k[0]} — ${b[0]}:${b[1]}`
};

const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};



type Props = {
    comment: CommentTreeItem
}

const Comment = ({ comment }: Props) => {
    const renderTooltip = (props: any) => (
        <Tooltip id="button-tooltip" {...props}>
            Дата модификации: {formatDateForInputInsp(comment.modifiedDate)}
        </Tooltip>
    );

    const mutation = useMutation({
        mutationFn: 
    })
    const { data } = useQuery({
        queryKey: ['doctor-info'],
        queryFn: getDoctorInfo,
    })
    const [isReplyOpen, setIsReplyOpen] = useState(false)
    const [replyText, setReplyText] = useState('')

    return (
        <Card>
            <Card.Header>{comment.author == data?.name ? 'Вы' : comment.author}</Card.Header>
            <Card.Body>
                {comment.content}
            </Card.Body>
            <Card.Footer>
                <div className='d-flex flex-column justify-content-center align-items-center'>
                    <div>

                        {formatDateForInputInsp(comment.createTime) == formatDateForInputInsp(comment.modifiedDate) ? (

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
                            <Button variant="link">Показать ответы ({comment.children.length})</Button>
                        ) : (<div></div>)}
                        <Button variant="link" onClick={() => setIsReplyOpen(prev => !prev)}>
                            Ответить
                        </Button>
                    </div>
                    {isReplyOpen && (
                        <div>
                            <hr />
                            <Form.Control as="textarea" rows={2} placeholder="Введите ответ" className='mt-1 mb-3' />
                            <Button
                                onClick={() => {
                                    setReplyText('')
                                    setIsReplyOpen(false)
                                }}>
                                Отправить
                            </Button>
                        </div>
                    )}
                </div>
            </Card.Footer>
        </Card >
    )
}

export default Comment