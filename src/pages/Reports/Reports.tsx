import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Table, Alert, Dropdown } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../shared/api/axiosConfig'
import MainLayout from '../../components/MainLayout/MainLayout'
import type { Icd10SerachModel } from '../../shared/api/Models/Icd10SearchModel'

const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return ''
    return isoDate.split('T')[0]
}

async function getIcdRootsList(): Promise<Icd10SerachModel[]> {
    const { data } = await axiosInstance.get('/dictionary/icd10/roots')
    return data
}

type ReportResponse = {
    filters: {
        start: string
        end: string
        icdRoots: string[]
    }
    records: {
        patientName: string
        patientBirthdate: string
        gender: string
        visitsByRoot: Record<string, number>
    }[]
    summaryByRoot: Record<string, number>
}

const Reports = () => {
    

    const { data: icdRoots } = useQuery({
        queryKey: ['icdRootsList'],
        queryFn: getIcdRootsList
    })

    const [filters, setFilters] = useState({
        start: '',
        end: '',
        icdRoots: [] as string[]
    })

    const [enabled, setEnabled] = useState(false)

    async function getReport(): Promise<ReportResponse> {
        const params = new URLSearchParams()

        params.append('start', filters.start)
        params.append('end', filters.end)

        filters.icdRoots.forEach(root => {
            params.append('icdRoots', root)
        })

        const { data } = await axiosInstance.get(`/report/icdrootsreport?${params.toString()}`)
        return data
    }

    const { data, refetch, isError, isFetching } = useQuery({
        queryKey: ['report', filters],
        queryFn: getReport,
        enabled: false
    })

    const handleSubmit = () => {
        setEnabled(true)
        refetch()
    }

    const selectedRoots = filters.icdRoots

    return (
        <MainLayout>
            <Container className='mt-5'>

                <h2><b>Отчет по осмотрам</b></h2>

                <Card className="mt-3 shadow-sm">
                    <Card.Header><b>Фильтры</b></Card.Header>
                    <Card.Body>

                        <Row className="g-4">

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Дата начала</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filters.start}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            start: e.target.value
                                        }))}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Дата окончания</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={filters.end}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            end: e.target.value
                                        }))}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>МКБ-10</Form.Label>

                                    <Dropdown>
                                        <Dropdown.Toggle className="w-100 text-start">
                                            {filters.icdRoots.length
                                                ? `Выбрано: ${filters.icdRoots.length}`
                                                : 'Все диагнозы'}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu
                                            className="w-100 p-2"
                                            style={{ maxHeight: '250px', overflowY: 'auto' }}>

                                            {icdRoots?.map(root => (
                                                <Form.Check
                                                    key={root.id}
                                                    type="checkbox"
                                                    label={`${root.code} - ${root.name}`}
                                                    checked={filters.icdRoots.includes(root.id)}
                                                    onChange={(e) => {
                                                        const updated = e.target.checked
                                                            ? [...filters.icdRoots, root.id]
                                                            : filters.icdRoots.filter(id => id !== root.id)

                                                        setFilters(prev => ({
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

                            <Col md={6} className="d-flex align-items-end justify-content-end">
                                <Button onClick={handleSubmit} disabled={!filters.start || !filters.end}>
                                    Сформировать отчет
                                </Button>
                            </Col>

                        </Row>
                    </Card.Body>
                </Card>

                {isError && (
                    <Alert variant="danger" className="mt-3">
                        Ошибка при получении отчета
                    </Alert>
                )}

                {data && (
                    <Card className="mt-4 shadow-sm">
                        <Card.Header><b>Результат</b></Card.Header>
                        <Card.Body style={{ overflowX: 'auto' }}>

                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>Пациент</th>
                                        <th>Дата рождения</th>
                                        <th>Пол</th>

                                        {selectedRoots.map(root => {
                                            const found = icdRoots?.find(i => i.id === root)
                                            return (
                                                <th key={root}>
                                                    {found?.code}
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.records.map((rec, idx) => (
                                        <tr key={idx}>
                                            <td>{rec.patientName}</td>
                                            <td>{formatDateForInput(rec.patientBirthdate)}</td>
                                            <td>{rec.gender === 'Male' ? 'Муж' : 'Жен'}</td>

                                            {selectedRoots.map(root => (
                                                <td key={root}>
                                                    {rec.visitsByRoot[root] ?? 0}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>

                            </Table>

                        </Card.Body>
                    </Card>
                )}

            </Container>
        </MainLayout>
    )
}

export default Reports