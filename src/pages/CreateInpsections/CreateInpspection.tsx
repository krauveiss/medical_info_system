import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '../../shared/api/axiosConfig';
import type { PatientCard } from '../../shared/api/Models/PatientCard';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/MainLayout/MainLayout';
import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, ListGroup, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import type { SpecialityResponse } from '../../shared/api/Models/SpecialityResponse';
import type { Speciality } from '../../shared/api/Models/Speciality';
import axios from 'axios';
import { useState } from 'react';
import type { InpsectionPreviewModel } from '../../shared/api/Models/InspectionPreviewMode';
import type { DiagnosisModel } from '../../shared/api/Models/DiagnosisModel';
import type z from 'zod';
import { inspectionSchema } from './inspectionSchema';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


async function getPatientInfo(id: string): Promise<PatientCard> {
    const { data } = await axiosInstance.get(`/patient/${id}`)
    return data;
}
const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};

const formatDateForInputInsp = (isoDate?: string) => {
    if (!isoDate) return '';
    let k = isoDate.split('T');
    let b = k[1].split(':');
    return `${k[0]} ${b[0]}:${b[1]}`
};


async function getSpecialties(): Promise<SpecialityResponse> {
    const { data } = await axios.get('https://mis-api.kreosoft.space/api/dictionary/speciality/?size=50');
    return data;
}

type InpsectionPreviewResponse = {
    inspections: InpsectionPreviewModel[]
}

type DiagResponse = {
    records: DiagnosisModel[]
}



async function getPatientInpsections(patient: string): Promise<InpsectionPreviewResponse> {
    const { data } = await axiosInstance.get(`https://mis-api.kreosoft.space/api/patient/${patient}/inspections`);
    return data;
}



async function getDiags(request: string): Promise<DiagResponse> {
    const { data } = await axiosInstance.get(`https://mis-api.kreosoft.space/api/dictionary/icd10?request=${request}`);
    return data;
}




const CreateInpspection = () => {
    type CreateInspectionData = z.infer<typeof inspectionSchema>;
    const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<CreateInspectionData>({ resolver: zodResolver(inspectionSchema) });

    const navigate = useNavigate();

    const [selectedDiag, setSelectedDiag] = useState<DiagnosisModel | null>(null);
    const [value, setValue] = useState('');
    const [conclType, setconclType] = useState('Болезнь');

    const [repeatInpsection, setRepeatInpsection] = useState(false);

    const location = useLocation();
    const patientId = String(location.state.id);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'consultations'
    });

    const { data, isError } = useQuery({
        queryKey: ['patient-info', patientId],
        queryFn: () => getPatientInfo(patientId as string),
        retry: false
    })


    const needConsult = watch('consultations')?.length > 0;

    const
        { data: dataSpec, isLoading } = useQuery({
            queryKey: ['specialties'],
            queryFn: getSpecialties
        });

    const
        { data: dataInpsections } = useQuery({
            queryKey: ['inpsectionsPrev'],
            queryFn: () => getPatientInpsections(patientId)
        });

    const
        { data: dataDiag } = useQuery({
            queryKey: ['dataDiag', value],
            queryFn: () => getDiags(value),
        });

    function handleCodeChange(value: string) {
        setValue(value);
    }
    const handleSendForm = (data: CreateInspectionData) => {
        console.log('s');
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
                        <Container className='mt-5 mb-5'>
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
                                            <Form onSubmit={handleSubmit(handleSendForm)}>
                                                <ListGroup >
                                                    <ListGroup.Item className="m-0 border-0">
                                                        <Row className="align-items-end g-3">
                                                            <Col lg={4}>
                                                                <Form.Label>Тип осмотра</Form.Label>
                                                                <ToggleButtonGroup
                                                                    type="radio"
                                                                    name="inspectionType"
                                                                    value={repeatInpsection ? 2 : 1}
                                                                    onChange={(val: number) => { setRepeatInpsection(val === 2); reset({ previousInspectionId: 'k' }) }}
                                                                    className="w-100">
                                                                    <ToggleButton id="tbg-radio-1" value={1} variant="outline-primary">
                                                                        Первичный осмотр
                                                                    </ToggleButton>
                                                                    <ToggleButton id="tbg-radio-2" value={2} variant="outline-primary">
                                                                        Повторный осмотр
                                                                    </ToggleButton>
                                                                </ToggleButtonGroup>
                                                            </Col>

                                                            <Col lg={5}>
                                                                <Form.Group>
                                                                    <Form.Label>Предыдущий осмотр</Form.Label>
                                                                    <Form.Select
                                                                        disabled={!repeatInpsection}
                                                                        required={repeatInpsection}
                                                                        {...register('previousInspectionId')}
                                                                        isInvalid={!!errors.previousInspectionId}>
                                                                        <option value='k'>
                                                                            {isLoading ? 'Загрузка...' : 'Выберите осмотр'}
                                                                        </option>
                                                                        {dataInpsections?.inspections.map((insp: InpsectionPreviewModel) => (
                                                                            <option value={insp.id}>{formatDateForInputInsp(insp.date)} — {insp.diagnosis.code} ({insp.diagnosis.name})</option>
                                                                        ))}
                                                                    </Form.Select>
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.previousInspectionId?.message}
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>

                                                            <Col lg={3}>
                                                                <Form.Group controlId="inspectionDate">
                                                                    <Form.Label>Дата осмотра</Form.Label>
                                                                    <Form.Control type="datetime-local" required {...register('date')} isInvalid={!!errors.date} />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        {errors.date?.message}
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>

                                                        </Row>

                                                        <hr className="mt-4" />
                                                    </ListGroup.Item>
                                                    <ListGroup.Item style={{ border: 'none' }} >
                                                        <h5><b>Жалобы</b></h5>
                                                        <Form.Control as="textarea" rows={4} placeholder="Головная боль, высокая температура" isInvalid={!!errors.complaints} className='mt-3 mb-3' style={{ height: '60px' }} {...register('complaints')} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.complaints?.message}
                                                        </Form.Control.Feedback>
                                                    </ListGroup.Item>
                                                    <ListGroup.Item style={{ border: 'none' }} >
                                                        <h5><b>Анамнез заболевания</b></h5>
                                                        <Form.Control as="textarea" rows={4} isInvalid={!!errors.anamnesis} placeholder="Болен в течение суток, доставлен бригадой СМП" className='mt-3' style={{ height: '60px' }} {...register('anamnesis')} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.anamnesis?.message}
                                                        </Form.Control.Feedback>
                                                    </ListGroup.Item>
                                                    <hr />
                                                    <ListGroup.Item style={{ border: 'none' }} className='mt-3'>
                                                        <h5><b>Консультация</b></h5>
                                                        <Row className='justify-content-center align-items-center'>

                                                            <Col>
                                                                <Form.Check
                                                                    type="switch"
                                                                    id="custom-switch"
                                                                    label="Требуется консультация"
                                                                    defaultChecked={false}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            append({
                                                                                specialityId: '',
                                                                                comment: { content: '' }
                                                                            });
                                                                        }
                                                                        else {
                                                                            remove();
                                                                        }
                                                                        console.log(watch())
                                                                    }}
                                                                    className='mt-2'
                                                                />
                                                            </Col>

                                                            {fields.map((field, index) => (
                                                                <Card className='p-2' style={{ border: 'none' }} >
                                                                    <Row className='g-2 align-items-start'>
                                                                        <Col lg={4}>
                                                                            <Form.Select {...register(`consultations.${index}.specialityId`)}>
                                                                                <option value=''>Выберите специальность</option>
                                                                                {dataSpec?.specialties.map((spec: Speciality) => (
                                                                                    <option key={spec.id} value={spec.id}>
                                                                                        {spec.name}
                                                                                    </option>
                                                                                ))}
                                                                            </Form.Select>
                                                                        </Col>
                                                                        <Col lg={6}>
                                                                            <Form.Control {...register(`consultations.${index}.comment.content`)} placeholder='Комментарий (обязательно)'></Form.Control>
                                                                        </Col>
                                                                        <Col lg={2}>
                                                                            <Button onClick={() => remove(index)}>
                                                                                Удалить
                                                                            </Button>
                                                                        </Col>

                                                                    </Row>
                                                                </Card>
                                                            ))}
                                                            <Button onClick={
                                                                () => {
                                                                    append({
                                                                        specialityId: '',
                                                                        comment: { content: '' }
                                                                    })
                                                                }
                                                            } className={needConsult ? 'mt-2 d-block' : 'mt-2 d-none'}>
                                                                Добавить еще
                                                            </Button>

                                                        </Row>

                                                        <hr className='mb-3' />
                                                    </ListGroup.Item>

                                                    <ListGroup.Item style={{ border: 'none' }} className='mt-3'>
                                                        <h5><b>Диагноз</b></h5>
                                                        <Row className='justify-content-center align-items-center'>

                                                            <Dropdown className='mt-2'>
                                                                <Dropdown.Toggle className="w-100 p-0 border-0 bg-transparent">
                                                                    <Form.Control
                                                                        placeholder="Начинайте вводить диагноз"
                                                                        value={value}
                                                                        onChange={(e) => handleCodeChange(e.target.value)}
                                                                    />
                                                                </Dropdown.Toggle>

                                                                <Dropdown.Menu className="w-100">
                                                                    {dataDiag?.records.map((item, index) => (
                                                                        <Dropdown.Item
                                                                            key={index}
                                                                            onClick={() => { setValue(item.name); setSelectedDiag(item) }}
                                                                        >
                                                                            {item.code} — {item.name}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <Row>
                                                                <Form.Control as="textarea" rows={4} placeholder="Расшифровка" style={{ height: '60px' }} />
                                                            </Row>

                                                        </Row>
                                                        <hr className='mb-3' />
                                                    </ListGroup.Item>

                                                    <ListGroup.Item style={{ border: 'none' }} >
                                                        <h5><b>Рекомендации по лечению</b></h5>
                                                        <Form.Control as="textarea" rows={4} placeholder="..." {...register('treatment')} isInvalid={!!errors.treatment} className='mt-3' style={{ height: '60px' }} />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.treatment?.message}
                                                        </Form.Control.Feedback>
                                                    </ListGroup.Item>
                                                    <hr className='mb-2' />

                                                    <ListGroup.Item style={{ border: 'none' }} >
                                                        <h5><b>Заключение</b></h5>
                                                        <Row className='align-items-end justify-content-center'>
                                                            <Col lg={4}>
                                                                <Form.Select onChange={(e) => setconclType(e.target.value)}>
                                                                    <option value="Болезнь">Болезнь</option>
                                                                    <option value="Выздоровление">Выздоровление</option>
                                                                    <option value="Смерть">Смерть</option>
                                                                </Form.Select>
                                                            </Col>
                                                            <Col lg={4}>
                                                                <Form.Group controlId="nextInspectionDate" className={conclType == 'Болезнь' ? 'd-block' : 'd-none'}>
                                                                    <Form.Label className='mt-2'>Дата следующего осмотра</Form.Label>
                                                                    <Form.Control type="date" />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        Укажите дату
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>

                                                                <Form.Group controlId="deathDate" className={conclType == 'Смерть' ? 'd-block' : 'd-none'}>
                                                                    <Form.Label className='mt-2'>Дата смерти</Form.Label>
                                                                    <Form.Control type="date" />
                                                                    <Form.Control.Feedback type="invalid">
                                                                        Укажите дату
                                                                    </Form.Control.Feedback>
                                                                </Form.Group>
                                                            </Col>

                                                        </Row>
                                                    </ListGroup.Item>

                                                </ListGroup>
                                                <hr className='mb-2' />
                                                <div className='d-flex justify-content-center mt-3 gap-3'>
                                                    <Button type='submit'>Сохранить осмотр</Button>
                                                    <Button variant="secondary" onClick={() => navigate(`/patient/${patientId}`)}>Отмена</Button>
                                                    <Button variant="secondary" onClick={() => console.log(watch())}>test</Button>
                                                </div>

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
