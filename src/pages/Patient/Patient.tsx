import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import MainLayout from '../../components/MainLayout/MainLayout';
import axiosInstance from '../../shared/api/axiosConfig';
import { useQuery } from '@tanstack/react-query';
import { Accordion, Alert, Badge, Button, Card, CardHeader, Col, Container, Dropdown, Form, ListGroup, Pagination, Row } from 'react-bootstrap';
import type { PatientCard } from '../../shared/api/Models/PatientCard';
import type { InspectionPreviewModel } from '../../shared/api/Models/InspectionPreviewMode';
import type { Icd10SerachModel } from '../../shared/api/Models/Icd10SearchModel';
import InspectionItem from '../../components/Inspection/InspectionItem';



const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};

type InspectionResponse = {
    inspections: InspectionPreviewModel[],
    pagination: {
        size: number,
        count: number,
        current: number
    }
}


async function getPatientInfo(id: string): Promise<PatientCard> {
    const { data } = await axiosInstance.get(`/patient/${id}`)
    return data;
}

async function getIcdRootsList(): Promise<Icd10SerachModel[]> {
    const { data } = await axiosInstance.get('/dictionary/icd10/roots');
    return data;
}


const Patient = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const size = Number(searchParams.get('size') ?? 5);
    const grouped = searchParams.get('grouped') === 'true';
    const icd = searchParams.getAll('icdRoots') ?? [];
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: icdR } = useQuery({
        queryKey: ['icdRootsList'],
        queryFn: getIcdRootsList
    })


    const [filters, setFilters] = useState({
        grouped: grouped,
        icdRoots: icd,
    });

    async function getInspections(): Promise<InspectionResponse> {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
        });

        if (filters.grouped !== undefined) {
            params.append('grouped', String(filters.grouped));
        }

        if (filters.icdRoots) {
            filters.icdRoots.forEach(root => {
                params.append('icdRoots', String(root));
            });
        }

        const { data } = await axiosInstance.get(`/patient/${id}/inspections/?${params.toString()}`);
        return data;
    }

    const { data, isError, isPending } = useQuery({
        queryKey: ['patient-info', id],
        queryFn: () => getPatientInfo(id as string),
        retry: false
    })

    const { data: inspectionsData, refetch } = useQuery({
        queryKey: ['patient-info-inpsections', id, page, size],
        queryFn: () => getInspections(),
        retry: false
    })


    const handleInspectionClick = () => {
        navigate('/inspection/create', {
            state: {
                id: id,
                prev: null
            }
        })
    }

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

    const renderPagination = () => {
        if (!inspectionsData?.pagination) return null;
        const { current, count } = inspectionsData.pagination;

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
    console.log(inspectionsData);


    function buildTree(inspections: InspectionPreviewModel[] | undefined) {
        const map = new Map();

        if (!inspections || inspections.length === 0) {
            return [];
        }

        inspections.forEach(item => {
            map.set(item.id, { ...item, children: [] })
        })
        const roots: any = []

        inspections.forEach(element => {
            if (element.previousId) {
                const parent = map.get(element.previousId)
                if (parent) {
                    parent.children = map.get(element.id)
                }
            }
            else {
                console.log(1)
                roots.push(map.get(element.id));
            }
        });
        return roots;
    }



    const datas = buildTree(inspectionsData?.inspections);

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
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M15 3C15 2.44772 15.4477 2 16 2H20C21.1046 2 22 2.89543 22 4V8C22 8.55229 21.5523 9 21 9C20.4477 9 20 8.55228 20 8V5.41288L15.4671 9.94579C15.4171 9.99582 15.363 10.0394 15.3061 10.0767C16.3674 11.4342 17 13.1432 17 15C17 19.4183 13.4183 23 9 23C4.58172 23 1 19.4183 1 15C1 10.5817 4.58172 7 9 7C10.8559 7 12.5642 7.63197 13.9214 8.69246C13.9587 8.63539 14.0024 8.58128 14.0525 8.53118L18.5836 4H16C15.4477 4 15 3.55228 15 3ZM9 20.9963C5.68831 20.9963 3.00365 18.3117 3.00365 15C3.00365 11.6883 5.68831 9.00365 9 9.00365C12.3117 9.00365 14.9963 11.6883 14.9963 15C14.9963 18.3117 12.3117 20.9963 9 20.9963Z" fill="#ffffff" />
                                                </svg>
                                            </div>) : (<div className="d-flex align-items-center">
                                                <div>Женский</div>
                                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M20 9C20 13.0803 16.9453 16.4471 12.9981 16.9383C12.9994 16.9587 13 16.9793 13 17V19H14C14.5523 19 15 19.4477 15 20C15 20.5523 14.5523 21 14 21H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V21H10C9.44772 21 9 20.5523 9 20C9 19.4477 9.44772 19 10 19H11V17C11 16.9793 11.0006 16.9587 11.0019 16.9383C7.05466 16.4471 4 13.0803 4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9ZM6.00365 9C6.00365 12.3117 8.68831 14.9963 12 14.9963C15.3117 14.9963 17.9963 12.3117 17.9963 9C17.9963 5.68831 15.3117 3.00365 12 3.00365C8.68831 3.00365 6.00365 5.68831 6.00365 9Z" fill="#ffffff" />
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
                            <Card className="mt-3 shadow-sm">
                                <Card.Header>
                                    <b>Фильтры и сортировка</b>
                                </Card.Header>

                                <Card.Body>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>МКБ-10</Form.Label>

                                                <Dropdown>
                                                    <Dropdown.Toggle className="w-100 text-start">
                                                        {filters.icdRoots?.length
                                                            ? `Выбрано: ${filters.icdRoots.length}`
                                                            : 'Выберите диагнозы'}
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu
                                                        className="w-100 p-2"
                                                        style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                        {icdR?.map((root) => (
                                                            <Form.Check
                                                                key={root.id}
                                                                type="checkbox"
                                                                label={`${root.code} - ${root.name}`}
                                                                checked={filters.icdRoots?.includes(root.id) || false}
                                                                onChange={(e) => {
                                                                    const updated = e.target.checked ?
                                                                        [...(filters.icdRoots || []), root.id] : filters.icdRoots?.filter(id => id !== root.id);

                                                                    setFilters((prev) => ({
                                                                        ...prev,
                                                                        icdRoots: updated
                                                                    }))

                                                                }}
                                                                className="mb-2"
                                                            />
                                                        ))}
                                                    </Dropdown.Menu>
                                                </Dropdown>

                                            </Form.Group>
                                        </Col>
                                        <Col md={6} className="d-flex align-items-end">
                                            <Form.Group>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Сгруппировать по повторным"
                                                    checked={filters.grouped}
                                                    onChange={(e) => {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            grouped: e.target.checked
                                                        }))
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Осмотров на странице</Form.Label>
                                                <Form.Select
                                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                                >
                                                    <option value="5">5</option>
                                                    <option value="10">10</option>
                                                    <option value="15">15</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>


                                        <Col md={6} className="d-flex align-items-end justify-content-end">
                                            <Button className="px-4" onClick={() => refetch()}>
                                                Поиск
                                            </Button>
                                        </Col>

                                    </Row>
                                </Card.Body>
                            </Card>
                            <Container>
                                <Row>
                                    {filters.grouped && datas.map((inspection: any) => (
                                        <Col xs={12} lg={6} key={inspection.id}>
                                            <InspectionItem
                                                inspection={inspection}
                                                id={id}
                                                navigate={navigate}
                                                hideCreateButton={false}
                                            />
                                        </Col>
                                    ))}

                                    {!filters.grouped && inspectionsData?.inspections.map((inspection) => (
                                        <Col xs={12} lg={6} key={inspection.id}>
                                            <Card className='mt-3 patient-card' bg={inspection.conclusion == 'Death' ? "danger" : ''}>
                                                <Card.Header ><b>{inspection.date ? (<Badge style={{
                                                    display: "inline-block",
                                                    maxWidth: "80%",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                    verticalAlign: "middle"

                                                }} bg='secondary'>{formatDateForInput(inspection.date)}</Badge>) : (<Badge style={{ color: "black" }} bg="danger">Не указано</Badge>)} <span className='m-3'>Амбулаторный осмотр</span></b> </Card.Header>
                                                <Card.Body>
                                                    <ListGroup>
                                                        <ListGroup.Item>Заключение — <b>{inspection?.conclusion == 'Death' ? 'Смерть' : (inspection?.conclusion == 'Disease' ? 'Болезнь' : 'Выздоровление')}</b></ListGroup.Item>
                                                        <ListGroup.Item>Основной диагноз — <b>{inspection?.diagnosis.name} ({inspection?.diagnosis.code})</b></ListGroup.Item>
                                                        <ListGroup.Item>Медицинский работник — <b>{inspection?.doctor}</b></ListGroup.Item>
                                                    </ListGroup>
                                                    {inspection?.conclusion == 'Death' ? (
                                                        <div style={{ width: '100%' }} className='d-flex justify-content-center gap-2 mt-3'>
                                                            <Button variant='light' disabled={true}>Добавить осмотр невозможно</Button>
                                                            <Button variant='light' onClick={() => {
                                                                navigate(`/inspection/${inspection.id}`)
                                                            }}>Детали осмотра</Button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: '100%' }} className='d-flex justify-content-center gap-2 mt-3'>
                                                            <Button variant='outline-primary' disabled={inspection?.hasNested == true} onClick={() => {
                                                                navigate('/inspection/create', {
                                                                    state: {
                                                                        id: id,
                                                                        prev: inspection.id
                                                                    }
                                                                })
                                                            }}>Добавить осмотр</Button>
                                                            <Button variant='outline-primary' onClick={() => {
                                                                navigate(`/inspection/${inspection.id}`)
                                                            }}>Детали осмотра</Button>

                                                        </div>

                                                    )}

                                                </Card.Body>
                                            </Card>
                                        </Col>

                                    ))}
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

                    </>
                )}
            </div>
        </MainLayout>
    )
}

export default Patient
