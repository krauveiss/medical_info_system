import React from 'react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../shared/api/axiosConfig';
import type { PatientCard } from '../../shared/api/Models/PatientCard';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/MainLayout/MainLayout';
import { Accordion, Alert, Badge, Button, Card, CardHeader, Col, Container, Form, ListGroup, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';


async function getPatientInfo(id: string): Promise<PatientCard> {
    const { data } = await axiosInstance.get(`/patient/${id}`)
    return data;
}
const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};




const CreateInpspection = () => {

    const location = useLocation();
    const patientId = location.state.id;

    const { data, isError, isPending } = useQuery({
        queryKey: ['patient-info', patientId],
        queryFn: () => getPatientInfo(patientId as string),
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
                            <Col className="d-flex flex-column">
                                <h2><b>Создание осмотра</b></h2>
                                <Card className='d-flex justify-content-center align-items-left mt-1'>
                                    <Card.Header><b><h5><Badge bg='secondary'>{data?.name}</Badge></h5></b> <Badge bg='primary'>{data?.gender == "Male" ? (
                                        <div className='d-flex align-items-center pl-2 gap-2'>
                                            <div>Пол: мужской</div>
                                        </div>) : (<div className="d-flex align-items-center">
                                            <div>Пол: женский</div>
                                        </div>)}</Badge> <Badge>Дата рождения: {formatDateForInput(data?.birthday)}</Badge></Card.Header>
                                </Card>
                            </Col>
                            <Container>
                                <Row className='justify-content-center mt-4' >
                                    <Card className='shadow-sm'>
                                        <Card.Body>
                                            <Form>
                                                <ListGroup >
                                                    <ListGroup.Item className='m-0' style={{ border: 'none' }}>
                                                        <Row className='justify-content-center align-items-center'>

                                                            <Col lg={6}>
                                                                <ToggleButtonGroup type="radio" name="options" defaultValue={1}>
                                                                    <ToggleButton id="tbg-radio-1" value={1}>
                                                                        Первичный осмотр
                                                                    </ToggleButton>
                                                                    <ToggleButton id="tbg-radio-2" value={2}>
                                                                        Повторный осмотр
                                                                    </ToggleButton>
                                                                </ToggleButtonGroup>

                                                            </Col>
                                                            <Col lg={6}>

                                                                <Form.Group className='mb-2 mt-2' controlId='birthday' >
                                                                    <Form.Label>Дата осмотра</Form.Label>
                                                                    <Form.Control type='date' required
                                                                    ></Form.Control>
                                                                    <Form.Control.Feedback type="invalid">
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                        <hr />
                                                    </ListGroup.Item>
                                                    <ListGroup.Item style={{ border: 'none' }} >
                                                        <h5><b>Жалобы</b></h5>
                                                        <Form.Control as="textarea" rows={4} placeholder="Головная боль, высокая температура" className='mt-3 mb-3' style={{ height: '60px' }} />

                                                    </ListGroup.Item>
                                                    <ListGroup.Item style={{ border: 'none' }} >
                                                        <h5><b>Анамнез заболевания</b></h5>
                                                        <Form.Control as="textarea" rows={4} placeholder="Болен в течение суток, доставлен бригадой СМП" className='mt-3' style={{ height: '60px' }} />
                                                    </ListGroup.Item>
                                                    <ListGroup.Item style={{ border: 'none' }} className='mt-3'>
                                                        <h5><b>Консультация</b></h5>
                                                        <Row className='justify-content-center align-items-center'>

                                                            <Col>
                                                                <Form.Check
                                                                    type="switch"
                                                                    id="custom-switch"
                                                                    label="Требуется консультация"
                                                                    defaultChecked={false}
                                                                />
                                                            </Col>
                                                            <Col>
                                                                <Form.Group className='' controlId='speciality'>
                                                                    <Form.Label>Cпециальность</Form.Label>
                                                                    <Form.Select required>

                                                                    </Form.Select>
                                                                    <Form.Control.Feedback type="invalid">
                                                                    </Form.Control.Feedback>

                                                                </Form.Group>
                                                            </Col>
                                                            <Row>
                                                                <Form.Control as="textarea" rows={4} placeholder="Комментарий" className='mt-3' style={{ height: '60px' }} />
                                                            </Row>

                                                        </Row>

                                                        <hr className='mb-3' />
                                                    </ListGroup.Item>
                                                </ListGroup>


                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </Row>
                            </Container>

                        </Container>

                    </>
                )}
            </div>
        </MainLayout >
    )
}

export default CreateInpspection
