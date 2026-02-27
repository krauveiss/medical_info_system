import MainLayout from '../../components/MainLayout/MainLayout'
import { Button, Card, CardHeader, Col, Container, Form, ListGroup, Row } from 'react-bootstrap'

const Patients = () => {
    return (
        <>
            <MainLayout>
                <Container className='mt-5'>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2><b>Пациенты</b></h2>
                        <Button>Регистрация нового пациента</Button>
                    </div>
                    <Card className='mt-3'>
                        <CardHeader className=''><b>Фильтры и сортировка</b></CardHeader>
                        <Card.Body>
                            <Row>
                                <Col>
                                    <Form.Label>Имя</Form.Label>
                                    <Form.Control type='text' placeholder='Иванов Иван Иванович'></Form.Control>
                                </Col>
                                <Col>
                                    <Form.Label style={{
                                        whiteSpace: 'nowrap',
                                    }}>Имеющиеся заключения</Form.Label>
                                    <Form.Select>
                                        <option value=""></option>
                                    </Form.Select>

                                </Col>
                            </Row>
                            <Row className='mt-4 justify-content-between align-items-center'>
                                <Col xs={6}>
                                    <Form.Check type='switch' id='have-planned-visits' label='Есть запланированные визиты' ></Form.Check>
                                </Col>
                                <Col>
                                    <Form.Check type='switch' id='my-patients' label='Мои пациенты'></Form.Check>
                                </Col>
                                <Col className='mt-3' md={4}>
                                    <Form.Label>Сортировка пациентов
                                    </Form.Label>
                                    <Form.Select>
                                        <option value=""></option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Row className='mt-4'>
                                <Col xs={5}>
                                    <Form.Label style={{
                                        whiteSpace: 'nowrap',
                                    }}>Число пацинентов на странице
                                    </Form.Label>
                                    <Form.Select>
                                        <option value=""></option>
                                    </Form.Select>
                                </Col>
                                <Col className='d-flex justify-content-end align-items-end'>
                                    <Button>
                                        Поиск
                                    </Button>
                                </Col>
                            </Row>

                        </Card.Body>

                    </Card>
                    <Container>
                        <Row>

                            <Col xs={12} lg={6}>
                                <Card className='mt-3'>
                                    <Card.Header ><b>Test Test Test</b></Card.Header>
                                    <ListGroup>
                                        <ListGroup.Item variant='info'>Email — <b>Test</b></ListGroup.Item>
                                        <ListGroup.Item>Пол — <b>Мужчина</b></ListGroup.Item>
                                        <ListGroup.Item>Дата рождения — <b>26.02.1991</b></ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            <Col xs={12} lg={6}>
                                <Card className='mt-3'>
                                    <Card.Header ><b>Test Test Test</b></Card.Header>
                                    <ListGroup>
                                        <ListGroup.Item variant='info'>Email — <b>Test</b></ListGroup.Item>
                                        <ListGroup.Item>Пол — <b>Мужчина</b></ListGroup.Item>
                                        <ListGroup.Item>Дата рождения — <b>26.02.1991</b></ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            <Col xs={12} lg={6}>
                                <Card className='mt-3'>
                                    <Card.Header ><b>Test Test Test</b></Card.Header>
                                    <ListGroup>
                                        <ListGroup.Item variant='info'>Email — <b>Test</b></ListGroup.Item>
                                        <ListGroup.Item>Пол — <b>Мужчина</b></ListGroup.Item>
                                        <ListGroup.Item>Дата рождения — <b>26.02.1991</b></ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            <Col xs={12} lg={6}>
                                <Card className='mt-3'>
                                    <Card.Header ><b>Test Test Test</b></Card.Header>
                                    <ListGroup>
                                        <ListGroup.Item variant='info'>Email — <b>Test</b></ListGroup.Item>
                                        <ListGroup.Item>Пол — <b>Мужчина</b></ListGroup.Item>
                                        <ListGroup.Item>Дата рождения — <b>26.02.1991</b></ListGroup.Item>
                                    </ListGroup>
                                </Card>
                            </Col>
                            
                        </Row>
                    </Container>

                </Container>
            </MainLayout>
        </>
    )
}

export default Patients
