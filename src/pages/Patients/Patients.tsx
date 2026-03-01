import { useQuery } from '@tanstack/react-query'
import MainLayout from '../../components/MainLayout/MainLayout'
import { Badge, Button, Card, CardHeader, Col, Container, Form, ListGroup, Pagination, Row, Spinner } from 'react-bootstrap'
import axiosInstance from '../../shared/api/axiosConfig';
import { useSearchParams } from 'react-router-dom';



const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};

type Patient = {
    id?: string
    name?: string
    gender?: 'Male' | 'Female'
    birthday?: string | null
    createTime?: string
}

type Pagination = {
    size: number
    count: number
    current: number
}

type PatientResponse = {
    patients: Patient[]
    pagination: Pagination
}

const Patients = () => {

    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get('page') ?? 1)
    const size = Number(searchParams.get('size') ?? 5)

    async function getPatients(): Promise<PatientResponse> {
        const { data } = await axiosInstance.get(`/patient/?page=${page}&size=${size}`);
        return data;
    }
    const { data, isPending, refetch } = useQuery({
        queryFn: getPatients,
        queryKey: ['patients', page, size],
    });

    function handlePagClick(newPage: number) {
        setSearchParams({ page: String(newPage), size: String(size) })
    }


    const renderPagination = () => {
        if (!data?.pagination) return null;
        const { current, count } = data.pagination;

        const items = [];
        const start = Math.max(1, current - 2);
        const end = Math.min(count, current + 2);

        if (start > 1) items.push(<Pagination.Ellipsis />);

        for (let i = start; i <= end; i++) {
            items.push(
                <Pagination.Item key={i} active={current === i} onClick={() => handlePagClick(i)}>
                    {i}
                </Pagination.Item>
            );
        }

        if (end < count) items.push(<Pagination.Ellipsis />);

        return (
            <Pagination className="flex-wrap justify-content-center">
                <Pagination.Prev onClick={() => handlePagClick(current - 1)} disabled={current === 1} />
                {items}
                <Pagination.Next onClick={() => handlePagClick(current + 1)} disabled={current === count} />
            </Pagination>
        );
    }


    return (
        <>
            <MainLayout>
                <Container className='mt-5'>
                    <div className="d-flex justify-content-between align-items-center">
                        <Col className="d-flex justify-content-between align-items-center">
                            <h2><b>Пациенты</b></h2>
                        </Col>

                        <Col className="d-flex justify-content-end align-items-center">
                            <Button>Регистрация нового пациента</Button>
                        </Col>
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
                                    <Button onClick={() => refetch()}>
                                        Поиск
                                    </Button>
                                </Col>
                            </Row>

                        </Card.Body>

                    </Card>
                    <Container>
                        <Row>
                            {!isPending || data === undefined ?
                                data?.patients.map((patient) => (
                                    <>
                                        <Col xs={12} lg={6}>
                                            <Card className='mt-3' id={patient?.id ?? crypto?.randomUUID()}>
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
                                )) :
                                (<div style={{
                                    width: '100%',
                                    height: '50vh',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Spinner animation='border' />
                                </div>)}


                        </Row>
                        <div className="d-flex justify-content-center mt-4" style={{
                            position: 'sticky',
                            bottom: -20,
                            zIndex: 1000,
                            background: 'white',
                            padding: '1rem 0'
                        }}>
                            {renderPagination()}
                        </div>
                    </Container>

                </Container>
            </MainLayout >
        </>
    )
}

export default Patients
