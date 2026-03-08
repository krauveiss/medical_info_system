import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../../components/MainLayout/MainLayout';
import axiosInstance from '../../shared/api/axiosConfig';
import { useQuery } from '@tanstack/react-query';
import { Accordion, Alert, Badge, Button, Card, CardHeader, Col, Container, ListGroup, Row } from 'react-bootstrap';
import type { PatientCard } from '../../shared/api/Models/PatientCard';



const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};


async function getPatientInfo(id: string): Promise<PatientCard> {
    const { data } = await axiosInstance.get(`/patient/${id}`)
    return data;
}

async function getInpsectionsInfo(id: string) {
    const { data } = await axiosInstance.get(`/patient/${id}/inspections`)
    return data;
}



const Patient = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const patient = {
        name: "test",
        birthday: "test",
        gender: 'Male'
    }


    const { data, isError, isPending } = useQuery({
        queryKey: ['patient-info', id],
        queryFn: () => getPatientInfo(id as string),
        retry: false
    })

    const { inpsections, isErrorInspections, isPendingInpsections } = useQuery({
        queryKey: ['patient-info-inpsections', id],
        queryFn: () => getInpsectionsInfo(id as string),
        retry: false
    })
    console.log(inpsections);


    const handleInspectionClick = () => {
        navigate('/inspection/create', {
            state: {
                id: id
            }
        })
    }
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
                                    <Button onClick={handleInspectionClick}><b>Добавить осмотр</b></Button>
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

                                        <ListGroup.Item>Пол — {data?.gender ? (<Badge bg='secondary'>{data.gender == "Male" ? (
                                            <div className='d-flex align-items-center pl-2 gap-2'>
                                                <div>Мужской</div>
                                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15 3C15 2.44772 15.4477 2 16 2H20C21.1046 2 22 2.89543 22 4V8C22 8.55229 21.5523 9 21 9C20.4477 9 20 8.55228 20 8V5.41288L15.4671 9.94579C15.4171 9.99582 15.363 10.0394 15.3061 10.0767C16.3674 11.4342 17 13.1432 17 15C17 19.4183 13.4183 23 9 23C4.58172 23 1 19.4183 1 15C1 10.5817 4.58172 7 9 7C10.8559 7 12.5642 7.63197 13.9214 8.69246C13.9587 8.63539 14.0024 8.58128 14.0525 8.53118L18.5836 4H16C15.4477 4 15 3.55228 15 3ZM9 20.9963C5.68831 20.9963 3.00365 18.3117 3.00365 15C3.00365 11.6883 5.68831 9.00365 9 9.00365C12.3117 9.00365 14.9963 11.6883 14.9963 15C14.9963 18.3117 12.3117 20.9963 9 20.9963Z" fill="#ffffff" />
                                                </svg>
                                            </div>) : (<div className="d-flex align-items-center">
                                                <div>Женский</div>
                                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20 9C20 13.0803 16.9453 16.4471 12.9981 16.9383C12.9994 16.9587 13 16.9793 13 17V19H14C14.5523 19 15 19.4477 15 20C15 20.5523 14.5523 21 14 21H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V21H10C9.44772 21 9 20.5523 9 20C9 19.4477 9.44772 19 10 19H11V17C11 16.9793 11.0006 16.9587 11.0019 16.9383C7.05466 16.4471 4 13.0803 4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9ZM6.00365 9C6.00365 12.3117 8.68831 14.9963 12 14.9963C15.3117 14.9963 17.9963 12.3117 17.9963 9C17.9963 5.68831 15.3117 3.00365 12 3.00365C8.68831 3.00365 6.00365 5.68831 6.00365 9Z" fill="#ffffff" />
                                                </svg>
                                            </div>)}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</ListGroup.Item>
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
                            <Container>
                                <Row>
                                    <>
                                        <Col xs={12} lg={6}>
                                            <Card className='mt-3 patient-card'>
                                                <Card.Header >Пациент: <b>{patient?.name ? (<Badge style={{
                                                    display: "inline-block",
                                                    maxWidth: "80%",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                    verticalAlign: "middle"
                                                }} bg='secondary'>{patient.name}</Badge>) : (<Badge style={{ color: "black" }} bg="danger">Не указано</Badge>)}</b></Card.Header>
                                                <ListGroup>
                                                    <ListGroup.Item>Пол — <b>{patient?.gender ? (<Badge bg='secondary'>{patient.gender}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</b></ListGroup.Item>
                                                    <ListGroup.Item>Дата рождения — <b>{patient?.birthday ? (<Badge bg='secondary'>{formatDateForInput(patient?.birthday)}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</b></ListGroup.Item>
                                                </ListGroup>
                                            </Card>
                                        </Col >
                                    </>


                                </Row>
                                <div className="d-flex justify-content-center mt-4" style={{
                                    position: 'sticky',
                                    bottom: -20,
                                    zIndex: 1000,
                                    background: 'white',
                                    padding: '1rem 0'
                                }}>

                                </div>
                            </Container>

                        </Container>

                    </>
                )}
            </div>
        </MainLayout>
    )
}

export default Patient
