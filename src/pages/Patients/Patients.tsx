import { useQuery } from '@tanstack/react-query'
import MainLayout from '../../components/MainLayout/MainLayout'
import { Badge, Button, Card, CardHeader, Col, Container, Form, ListGroup, Modal, Pagination, Row, Spinner } from 'react-bootstrap'
import axiosInstance from '../../shared/api/axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import RegisterPatientForm from '../../components/Patient/RegisterPatientForm';
import './patients.css'

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
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams()
    const page = Number(searchParams.get('page') ?? 1)
    const size = Number(searchParams.get('size') ?? 5)
    const nameP = String(searchParams.get('name') ?? '')
    const concl = String(searchParams.get('conclusions') ?? '')
    const sorting = String(searchParams.get('sorting') ?? '')
    const visits = Boolean(searchParams.get('scheduledVisits') ?? false)
    const onlyMine = Boolean(searchParams.get('onlyMine') ?? false)

    const [filters, setFilters] = useState({
        name: nameP,
        conclusions: concl,
        scheduledVisits: visits,
        onlyMine: onlyMine,
        sorting: sorting
    });

    async function getPatients(): Promise<PatientResponse> {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            ...(filters.name ? { name: filters.name } : {}),
            ...(filters.conclusions ? { conclusions: filters.conclusions } : {}),
            ...(filters.sorting ? { sorting: filters.sorting } : {}),
            ...(filters.scheduledVisits ? { scheduledVisits: 'True' } : {}),
            ...(filters.onlyMine ? { onlyMine: 'True' } : {}),
        });

        const { data } = await axiosInstance.get(`/patient/?${params.toString()}`);
        return data;
    }
    const { data, isPending, refetch } = useQuery({
        queryFn: getPatients,
        queryKey: ['patients', page, size],
    });

    function handlePagClick(newPage: number) {
        setSearchParams(prev => {
            const params = Object.fromEntries(prev.entries());
            return {
                ...params,
                page: String(newPage),
                size: String(size)
            }
        })
    }

    function handleSerachButton() {
        setSearchParams({
            page: '1',
            size: String(size),
            name: filters.name || '',
            conclusions: filters.conclusions || '',
            sorting: filters.sorting || '',
            scheduledVisits: filters.scheduledVisits ? '1' : '',
            onlyMine: filters.onlyMine ? '1' : ''
        });
        refetch();
    }

    function handlePageSizeChange(newSize: number) {
        setSearchParams(prev => {
            const params = Object.fromEntries(prev.entries());
            return {
                ...params,
                page: String(page),
                size: String(newSize)
            }
        })
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

    const [modalShow, setModalShow] = useState(false);

    const handleClose = () => setModalShow(false);
    const handleShow = () => setModalShow(true);


    return (
        <>
            <MainLayout>
                <Modal show={modalShow} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title><b>Регистрация пациента</b></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <RegisterPatientForm></RegisterPatientForm>
                    </Modal.Body>
                </Modal>

                <Container className='mt-5'>
                    <div className="d-flex justify-content-between align-items-center">
                        <Col className="d-flex justify-content-between align-items-center">
                            <h2><b>Пациенты</b></h2>
                        </Col>

                        <Col className="d-flex justify-content-end align-items-center">
                            <Button onClick={handleShow}><b>Регистрация нового пациента</b></Button>
                        </Col>
                    </div>
                    <Card className='mt-3'>
                        <CardHeader className=''><b>Фильтры и сортировка</b></CardHeader>
                        <Card.Body>
                            <Row>
                                <Col xs={12} xl={6} className='mb-2'>
                                    <Form.Label>Имя</Form.Label>
                                    <Form.Control defaultValue={nameP} type='text' placeholder='Иванов Иван Иванович' onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}></Form.Control>
                                </Col>
                                <Col>
                                    <Form.Label style={{
                                        whiteSpace: 'nowrap',
                                    }}>Имеющиеся заключения</Form.Label>
                                    <Form.Select defaultValue={concl} onChange={(e) => setFilters(prev => ({ ...prev, conclusions: e.target.value }))}>
                                        <option value="">Не выбрано</option>
                                        <option value="Death">Смерть</option>
                                        <option value="Recovery">Выздоровление</option>
                                        <option value="Disease">Заболевание</option>
                                    </Form.Select>

                                </Col>
                            </Row>
                            <Row className='mt-4 justify-content-between align-items-center'>
                                <Col xs={6}>
                                    <Form.Check defaultChecked={visits} type='switch' id='have-planned-visits' label='Есть запланированные визиты' onChange={(e) => setFilters(prev => ({ ...prev, scheduledVisits: e.target.checked }))}></Form.Check>
                                </Col>
                                <Col>
                                    <Form.Check defaultChecked={onlyMine} type='switch' id='my-patients' label='Мои пациенты' onChange={(e) => setFilters(prev => ({ ...prev, onlyMine: e.target.checked }))}></Form.Check>
                                </Col>
                                <Col className='mt-3' md={4}>
                                    <Form.Label>Сортировка пациентов
                                    </Form.Label>
                                    <Form.Select defaultValue={sorting} onChange={(e) => setFilters(prev => ({ ...prev, sorting: e.target.value }))}>
                                        <option value="">Не выбрано</option>
                                        <option value="NameAsc">По имени (А-Я)</option>
                                        <option value="NameDesc">По имени (Я-А)</option>
                                        <option value="CreateAsc">По дате создания (сначала новые)</option>
                                        <option value="CreateDesc">По дате создания (сначала старые)</option>
                                        <option value="InspectionAsc">По дате осмотров(сначала старые)</option>
                                        <option value="InspectionDesc">По дате осмотров (сначала новые)</option>
                                    </Form.Select>
                                </Col>
                            </Row>

                            <Row className='mt-4'>
                                <Col xs={5}>
                                    <Form.Label style={{
                                        whiteSpace: 'nowrap',
                                    }}>Число пацинентов на странице
                                    </Form.Label>
                                    <Form.Select onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </Form.Select>
                                </Col>
                                <Col className='d-flex justify-content-end align-items-end'>
                                    <Button onClick={() => handleSerachButton()}>
                                        <b>Поиск</b>
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
                                            <Card className='mt-3 patient-card' id={patient?.id ?? crypto?.randomUUID()} onClick={() => navigate(`/patient/${patient?.id}`)} key={patient.id}>
                                                <Card.Header >Пациент: <b>{patient?.name ? (<Badge style={{
                                                    display: "inline-block",
                                                    maxWidth: "80%",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                    verticalAlign: "middle"
                                                }} bg='secondary'>{patient.name}</Badge>) : (<Badge style={{ color: "black" }} bg="danger">Не указано</Badge>)}</b></Card.Header>
                                                <ListGroup>
                                                    <ListGroup.Item>Пол — <b>{patient?.gender ? (<Badge bg='secondary'>{patient.gender == 'Male' ? 'Мужской' : "Женский"}</Badge>) : (<Badge style={{ color: 'black' }} bg="warning">Не указано</Badge>)}</b></ListGroup.Item>
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
