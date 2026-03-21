import { useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '../../shared/api/axiosConfig';
import type { PatientCard } from '../../shared/api/Models/PatientCard';
import { useMutation, useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/MainLayout/MainLayout';
import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, ListGroup, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import type { SpecialityResponse } from '../../shared/api/Models/SpecialityResponse';
import type { Speciality } from '../../shared/api/Models/Speciality';
import axios, { all } from 'axios';
import { useRef, useState } from 'react';
import type { InpsectionPreviewModel } from '../../shared/api/Models/InspectionPreviewMode';
import type { DiagnosisModel } from '../../shared/api/Models/DiagnosisModel';
import type z from 'zod';
import { inspectionSchema } from './inspectionSchema';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DiagnosisType } from '../../shared/api/Models/DiagnosisType';


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
    const { register, handleSubmit, formState: { errors }, reset, control, watch, getValues } = useForm<CreateInspectionData>({
        resolver: zodResolver(inspectionSchema), defaultValues: {
            diagnoses: [],
            consultations: []
        }
    });

    const navigate = useNavigate();
    const diadDescriptionRef = useRef<HTMLTextAreaElement>(null);

    const [selectedDiag, setSelectedDiag] = useState<DiagnosisModel | null>(null);
    const [value, setValue] = useState('');
    const [allDiags, setAllDiags] = useState<DiagnosisModel[]>([]);
    const [repeatInpsection, setRepeatInpsection] = useState(false);
    const [selectedDiagType, setSelectedDiagType] = useState<DiagnosisType>('Main');

    const location = useLocation();
    const patientId = String(location.state.id);

    async function createInspection(data: CreateInspectionData) {
        return axiosInstance.post(`https://mis-api.kreosoft.space/api/patient/${patientId}/inspections`, data)
    }


    const { fields, append, remove } = useFieldArray({
        control,
        name: 'consultations'
    });

    const { fields: diags, append: appendDiags } = useFieldArray({
        control,
        name: 'diagnoses'
    });

    const { data, isError } = useQuery({
        queryKey: ['patient-info', patientId],
        queryFn: () => getPatientInfo(patientId as string),
        retry: false
    })
    function handleAddDiag() {
        if (selectedDiag == null) {
            alert('Не выбран диагноз');
            return
        }

        selectedDiag.description = diadDescriptionRef.current?.value;
        selectedDiag.type = selectedDiagType;
        appendDiags({
            icdDiagnosisId: selectedDiag.id,
            description: selectedDiag.description,
            type: selectedDiag.type
        });
        setAllDiags([...allDiags, selectedDiag]);
        setSelectedDiag(null);
        setValue('');
        diadDescriptionRef.current.value = "";




    }


    const needConsult = watch('consultations')?.length > 0;
    const conclType = watch('conclusion');

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


    const onError = (errors: any) => {
        console.log('ERRORS:', errors);
    };

    const mutation = useMutation({
        mutationFn: createInspection,
        onSuccess: () => { alert("Success register"); },
        onError: (error: any) => {
            alert(error.response?.data?.message);
        }
    });

    const handleSendForm = (data: CreateInspectionData) => {
        console.log(data);
        mutation.mutate(data);
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
                                            <Form onSubmit={handleSubmit(handleSendForm, onError)}>
                                                <ListGroup >
                                                    <ListGroup.Item className="m-0 border-0">
                                                        <Row className="align-items-end g-3">
                                                            <Col lg={4}>
                                                                <Form.Label>Тип осмотра</Form.Label>
                                                                <ToggleButtonGroup
                                                                    type="radio"
                                                                    name="inspectionType"
                                                                    value={repeatInpsection ? 2 : 1}
                                                                    onChange={(val: number) => {
                                                                        setRepeatInpsection(val === 2); reset({
                                                                            ...getValues(),
                                                                            previousInspectionId: 'k'
                                                                        })
                                                                    }}
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
                                                                <Card className='p-2' style={{ border: 'none' }} key={field.id}>
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
                                                            <Form.Control.Feedback type="invalid">
                                                                {errors.consultations?.message}
                                                            </Form.Control.Feedback>

                                                        </Row>

                                                        <hr className='mb-3' />
                                                    </ListGroup.Item>

                                                    <ListGroup.Item style={{ border: 'none' }} className='mt-3'>
                                                        <h5><b>Диагноз</b></h5>


                                                        {/* {diags.map((field, index) => (
                                                            <Card key={field.id} className='p-2 mt-2'>
                                                                <Row className='g-2 align-items-start' style={{ border: 'None' }}>
                                                                    <Col>
                                                                        <h6>Диагноз: <b>{field.icdDiagnosisId}</b></h6>
                                                                        <h6>Тип диагноза: <b>{field.type}</b></h6>
                                                                        <h6>Описание: <b>{field.description}</b></h6>
                                                                    </Col>
                                                                    <Col>
                                                                        <Button onClick={() => removeDiags(index)}>
                                                                            Удалить из списка
                                                                        </Button>
                                                                    </Col>
                                                                </Row>

                                                            </Card>

                                                        ))} */}
                                                        {allDiags.map((e) => (
                                                            <Card key={e.id} className='p-2 mt-2'>
                                                                <Row className='g-2 align-items-start' style={{ border: 'None' }}>
                                                                    <Col>
                                                                        <h6>Диагноз: <b>{e.name} ({e.code})</b></h6>
                                                                        <h6>Тип диагноза: <b>{e.type}</b></h6>
                                                                        {e.description == "" ? (<h6>Без описания</h6>) : (<h6>Описание: <b>{e.description}</b></h6>)}

                                                                    </Col>
                                                                </Row>

                                                            </Card>
                                                        ))

                                                        }
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
                                                                <Form.Control as="textarea" rows={4} placeholder="Расшифровка" style={{ height: '60px' }} ref={diadDescriptionRef} />
                                                                <Form.Select className='mt-2' onChange={(e) => setSelectedDiagType(e.target.value as DiagnosisType)}>
                                                                    <option value="Main">Основной</option>
                                                                    <option value="Concomitant">Сопутствующий</option>
                                                                    <option value="Complication">Осложнение</option>
                                                                </Form.Select>
                                                            </Row>


                                                        </Row>
                                                        <Button className='mt-2' onClick={() => handleAddDiag()}>Добавить диагноз</Button>
                                                        {errors.diagnoses?.message && (
                                                            <div className="text-danger mt-2">
                                                                {errors.diagnoses.message}
                                                            </div>
                                                        )}

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
                                                                <Form.Select isInvalid={!!errors.conclusion} {...register('conclusion')} >
                                                                    <option value="Disease">Болезнь</option>
                                                                    <option value="Recovery">Выздоровление</option>
                                                                    <option value="Death">Смерть</option>
                                                                </Form.Select>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.conclusion?.message}
                                                                </Form.Control.Feedback>
                                                            </Col>
                                                            <Col lg={4}>

                                                                {conclType === 'Death' && (
                                                                    <Form.Group controlId="deathDate">
                                                                        <Form.Label className='mt-2'>Дата и время смерти</Form.Label>
                                                                        <Form.Control type="datetime-local" isInvalid={!!errors.deathDate}  {...register('deathDate')} />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.deathDate?.message}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                )}
                                                                {conclType === 'Disease' && (
                                                                    <Form.Group controlId="nextInspectionDate" >
                                                                        <Form.Label className='mt-2'>Дата и время следующего осмотра</Form.Label>
                                                                        <Form.Control type="datetime-local" isInvalid={!!errors.nextVisitDate}  {...register('nextVisitDate')} />
                                                                        <Form.Control.Feedback type="invalid">
                                                                            {errors.nextVisitDate?.message}
                                                                        </Form.Control.Feedback>
                                                                    </Form.Group>
                                                                )}


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
