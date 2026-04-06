import React, { Children, useEffect, useState } from 'react'
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


async function getIcdRootsList(): Promise<Icd10SerachModel[]> {
    const { data } = await axiosInstance.get('/dictionary/icd10/roots');
    return data;
}


const Consultations = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page') ?? 1);
    const size = Number(searchParams.get('size') ?? 5);
    const grouped = searchParams.get('grouped') === 'true';
    const icd = searchParams.getAll('icdRoots') ?? [];
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

        const { data } = await axiosInstance.get(`/consultation/?${params.toString()}`);
        return data;
    }


    const { data: inspectionsData, refetch, isError } = useQuery({
        queryKey: ['patient-info-inpsections', page, size],
        queryFn: () => getInspections(),
        retry: false
    })


    const handleInspectionClick = () => {
        navigate('/inspection/create', {
            state: {
                id: '',
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
        const roots = []

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
    console.log(datas);

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
                                    <h2><b>Консультации</b></h2>
                                </Col>
                            </div>
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
                                                <Button onClick={() => console.log(filters.icdRoots)}>

                                                </Button>
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
                                    {filters.grouped && datas.map((inspection) => (
                                        <Col xs={12} lg={6} key={inspection.id}>
                                            <InspectionItem
                                                inspection={inspection}
                                                id={''}
                                                navigate={navigate}
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

export default Consultations
