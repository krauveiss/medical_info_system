import React, { useState } from 'react'
import { Badge, Button, Card, Col, ListGroup } from 'react-bootstrap';
import type { NavigateFunction } from 'react-router-dom';

interface Props {
    inspection,
    id: string | undefined,
    navigate: NavigateFunction,
}

const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};

const InspectionItem = ({ inspection, id, navigate }: Props) => {

    const [open, setOpen] = useState(false);

    return (
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
                        <Button variant='light'>Детали осмотра</Button>
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
                        <Button variant='outline-primary'>Детали осмотра</Button>

                        {inspection.children.length !== undefined ? (<div></div>) : (
                            <Button size="sm" onClick={() => setOpen(!open)}> {open ? '−' : '+'} </Button>
                        )}

                    </div>

                )}

            </Card.Body>
            {open && inspection.children && (

                <InspectionItem inspection={inspection.children} id={id} navigate={navigate} />

            )}
        </Card>
    );
}

export default InspectionItem