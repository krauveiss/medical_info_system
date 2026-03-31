import React, { act } from 'react'
import MainLayout from '../../components/MainLayout/MainLayout'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../shared/api/axiosConfig'
import type { InspectionModel } from '../../shared/api/Models/InspectionModel'
import { useQuery } from '@tanstack/react-query'
import { Badge, Button, Card, Col, Container, Placeholder, Row, Spinner, Toast } from 'react-bootstrap'
import type { InspectionCommentModel } from '../../shared/api/Models/InspectionCommentModel'
import type { CommentModel } from '../../shared/api/Models/CommentModel'
import type { ConsultationModel } from '../../shared/api/Models/ConsultationModel'
import { ConsultationItem } from '../../components/Inspection/ConsultationItem'


async function getInspections(userId: string): Promise<InspectionModel> {
    const { data } = await axiosInstance.get(`/inspection/${userId}`)
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



const InspectionDetails = () => {
    const { id } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['inspection', id],
        queryFn: () => getInspections(id as string),

    })
    console.log(data);




    return (
        <MainLayout>
            <Container className='mt-5'>
                <div className="d-flex justify-content-between align-items-center">
                    <Col className="d-flex justify-content-between align-items-center">
                        <h2>
                            <b>
                                Амбулаторный осмотр от{" "}
                                {isLoading ? (
                                    <Badge>XX.XX.XXXX — XX:XX</Badge>
                                ) : (
                                    <span><Badge >{formatDateForInputInsp(data?.date)}</Badge></span>
                                )}
                            </b>
                        </h2>
                        <Button ><b>Редактировать осмотр</b></Button>
                    </Col>
                </div>
                <Card className='mt-3'>

                    <Card.Header><b>{isLoading ? (
                        <Placeholder as="span" animation="glow" > <Placeholder xs={3} bg="secondary" /> </Placeholder>
                    ) : (
                        <span><Badge bg="secondary">{data?.patient?.name}</Badge></span>
                    )}
                    </b></Card.Header>


                    <Card.Body>
                        <p>
                            Пол: {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={1} bg="secondary" /> </Placeholder>
                            ) : (
                                <span><b>{data?.patient?.gender}</b></span>
                            )}
                        </p>
                        <p>
                            Дата рождения: {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={1} bg="secondary" /> </Placeholder>
                            ) : (
                                <span><b>{formatDateForInput(data?.patient?.birthday)}</b></span>
                            )}
                        </p>
                        <p style={{ color: 'gray' }}>
                            Медицинский работник: {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={1} bg="secondary" /> </Placeholder>
                            ) : (
                                <span>{formatDateForInput(data?.doctor?.name)}</span>
                            )}
                        </p>
                    </Card.Body>
                </Card>

                <Card className='mt-3'>
                    <Card.Header><b>Жалобы</b></Card.Header>
                    <Card.Body>
                        <p>
                            {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /></Placeholder>
                            ) : (
                                <span>{formatDateForInput(data?.complaints)}</span>
                            )}
                        </p>
                    </Card.Body>
                </Card>
                <Card className='mt-3'>
                    <Card.Header><b>Анамнез заболевания</b></Card.Header>
                    <Card.Body>
                        <p>
                            {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /></Placeholder>
                            ) : (
                                <span>{formatDateForInput(data?.anamnesis)}</span>
                            )}
                        </p>
                    </Card.Body>
                </Card>
                <Card className='mt-3'>
                    <Card.Header><b>Консультации</b></Card.Header>
                    <Card.Body>
                        <div>
                            {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /></Placeholder>
                            ) : (
                                <>
                                    {data?.consultations?.length == 0 ? (
                                        <Card.Text><b>Не проводились</b></Card.Text>
                                    ) : <></>}
                                    {data?.consultations?.length && data?.consultations?.length > 0 && data?.consultations?.map((consult, index) =>
                                    (
                                        <Col lg={4}>
                                            <ConsultationItem consult={consult}></ConsultationItem>


                                        </Col>

                                    ))}
                                </>

                            )}
                        </div>

                    </Card.Body>
                </Card>
                <Card className='mt-3'>
                    <Card.Header><b>Диагнозы</b></Card.Header>
                    <Card.Body>
                        <Row className='gap-2 align-items-center justify-content-center'>

                            {isLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <Col lg={5} >
                                        <Card key={i}>
                                            <Card.Header>
                                                <Placeholder as="span" animation="glow">
                                                    <Placeholder xs={2} /> <Placeholder xs={4} />
                                                </Placeholder>
                                            </Card.Header>
                                            <Card.Body>
                                                <Card.Text>Тип: <Placeholder as="span" animation="glow"> <Placeholder xs={2} /> </Placeholder></Card.Text>
                                                <Card.Text>Тип в осмотре: <Placeholder as="span" animation="glow"> <Placeholder xs={2} /> </Placeholder></Card.Text>
                                                <Card.Text>Расшифровка: <Placeholder as="span" animation="glow"> <Placeholder xs={2} />  <Placeholder xs={4} /> <Placeholder xs={2} /></Placeholder></Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                                : data?.diagnoses?.map((diag) => (
                                    <Col lg={5}>
                                        <Card key={diag.id}>
                                            <Card.Header>
                                                <span>{diag.code} — <b>{diag.name}</b></span>
                                            </Card.Header>
                                            <Card.Body>
                                                <Card.Text>Тип в осмотре: {diag.type}</Card.Text>
                                                <Card.Text>Расшифровка: {diag.description}</Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            }
                        </Row>
                    </Card.Body>
                </Card>
                <Card className='mt-3'>
                    <Card.Header><b>Рекомендации по лечению</b></Card.Header>
                    <Card.Body>
                        <p>
                            {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /></Placeholder>
                            ) : (
                                <span>{data?.treatment}</span>
                            )}
                        </p>
                    </Card.Body>
                </Card>

                <Card className='mt-3'>
                    <Card.Header><b>Заключение</b></Card.Header>
                    <Card.Body>
                        <p>
                            {isLoading ? (
                                <Placeholder as="span" animation="glow" > <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /></Placeholder>
                            ) : (
                                <span><b>{data?.conclusion}</b></span>
                            )}
                        </p>
                        <p>
                            {data?.nextVisitDate == undefined ? (data?.deathDate == undefined ? '' : `Дата смерти: ${data.deathDate}`) : `Дата следующего визита: ${formatDateForInputInsp(data.nextVisitDate)}`}
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        </MainLayout >
    )
}

export default InspectionDetails