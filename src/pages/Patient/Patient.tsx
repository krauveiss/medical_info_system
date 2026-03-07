import React from 'react'
import { useParams } from 'react-router-dom'
import MainLayout from '../../components/MainLayout/MainLayout';
import axiosInstance from '../../shared/api/axiosConfig';
import { useQuery } from '@tanstack/react-query';
import { Accordion, Alert, Badge, Card, CardHeader, Col, Container, ListGroup } from 'react-bootstrap';


type PatientCard = {
    id?: string,
    createTime?: string,
    name?: string,
    birthday?: string,
    gender?: string
}



const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};


async function getPatientInfo(id: string): Promise<PatientCard> {
    const { data } = await axiosInstance.get(`/patient/${id}`)
    return data;
}


const Patient = () => {
    const { id } = useParams();



    const { data, isError, isPending } = useQuery({
        queryKey: ['patient-info', id],
        queryFn: () => getPatientInfo(id as string),
        retry: false
    })


    return (
        <MainLayout>
            <div>
                {isError ? (
                    <div className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
                        <Alert variant='danger'>Произошла ошибка
                        </Alert>
                    </div>
                ) : (
                    <>
                        <Container className='mt-5'>
                            <div className="d-flex justify-content-between align-items-center">
                                <Col className="d-flex justify-content-between align-items-center">
                                    <h2><b>Медицинская карта пациента</b></h2>
                                </Col>
                            </div>
                            <Card className='mt-3' style={{
                                filter: isPending ? 'blur(4px)' : 'none',
                                transition: 'filter 0.3s ease'
                            }}>
                                <CardHeader className=''><b>{data?.name}</b></CardHeader>
                                <Card.Body>
                                    <Card.Text>
                                        Данные о пациенте:
                                    </Card.Text>
                                    <ListGroup>
                                        <ListGroup.Item>Пол — {data?.gender ? (<Badge bg='secondary'>{data.gender == "Male" ? ('Мужской') : ('Женский')}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</ListGroup.Item>
                                        <ListGroup.Item>Дата рождения — {data?.birthday ? (<Badge bg='secondary'>{formatDateForInput(data.birthday)}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</ListGroup.Item>
                                        <Accordion >
                                            <Accordion.Item eventKey="0">
                                                <Accordion.Header>Служебные поля</Accordion.Header>
                                                <Accordion.Body>
                                                    <ListGroup>
                                                        <ListGroup.Item>Дата создания — {data?.createTime ? (<Badge bg='secondary'>{formatDateForInput(data.createTime)}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</ListGroup.Item>
                                                        <ListGroup.Item>ID — {data?.id ? (<Badge bg='secondary'>{data.id}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</ListGroup.Item>
                                                    </ListGroup>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    </ListGroup>
                                    <Card.Text></Card.Text>
                                </Card.Body>

                            </Card>


                        </Container>

                    </>
                )}
            </div>
        </MainLayout>
    )
}

export default Patient
