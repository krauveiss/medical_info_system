import React, { act, useEffect, useRef, useState } from 'react'
import MainLayout from '../../components/MainLayout/MainLayout'
import { useParams } from 'react-router-dom'
import axiosInstance from '../../shared/api/axiosConfig'
import type { InspectionModel } from '../../shared/api/Models/InspectionModel'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Badge, Button, Card, CardBody, CardText, Col, Container, Dropdown, Form, Modal, Placeholder, Row, Spinner, Toast } from 'react-bootstrap'
import type { InspectionCommentModel } from '../../shared/api/Models/InspectionCommentModel'
import type { CommentModel } from '../../shared/api/Models/CommentModel'
import type { ConsultationModel } from '../../shared/api/Models/ConsultationModel'
import { ConsultationItem } from '../../components/Inspection/ConsultationItem'
import type { DoctorModel } from '../../shared/api/Models/DoctorModel'
import { inspectionSchema } from '../CreateInpsections/inspectionSchema'
import type z from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editInspectionSchema } from './editInspectionSchema'
import type { DiagnosisType } from '../../shared/api/Models/DiagnosisType'
import type { DiagnosisModel } from '../../shared/api/Models/DiagnosisModel'


type DiagResponse = {
    records: DiagnosisModel[]
}




async function getDoctorInfo(): Promise<DoctorModel> {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;
}


async function getDiags(request: string): Promise<DiagResponse> {
    const { data } = await axiosInstance.get(`https://mis-api.kreosoft.space/api/dictionary/icd10?request=${request}`);
    return data;
}



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
    type CreateInspectionData = z.infer<typeof editInspectionSchema>;
    const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm<CreateInspectionData>({
        resolver: zodResolver(editInspectionSchema), defaultValues: {
            diagnoses: [],
        }
    });

    const { id } = useParams();

    function editInspection(data: CreateInspectionData, inspectionId: string) {
        return axiosInstance.put(`/inspection/${inspectionId}`, data)
    }

    const { data, isLoading } = useQuery({
        queryKey: ['inspection', id],
        queryFn: () => getInspections(id as string),

    })

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);



    const [selectedDiag, setSelectedDiag] = useState<DiagnosisModel | null>(null);
    const [value, setValue] = useState('');
    const [allDiags, setAllDiags] = useState<DiagnosisModel[]>([]);
    const [repeatInpsection, setRepeatInpsection] = useState(false);
    const [selectedDiagType, setSelectedDiagType] = useState<DiagnosisType>('Main');



    const { data: doctor } = useQuery({
        queryKey: ['doctor-info'],
        queryFn: getDoctorInfo,
    })

    const
        { data: dataDiag } = useQuery({
            queryKey: ['dataDiag', value],
            queryFn: () => getDiags(value),
        });


    useEffect(() => {
        if (data) {
            reset({
                complaints: data.complaints,
                anamnesis: data.anamnesis || undefined,
                treatment: data.treatment,
                diagnoses: data.diagnoses?.map(d => ({
                    icdDiagnosisId: d.id,
                    description: d.description,
                    type: d.type,
                    name: d.name
                })) ?? [],
                conclusion: data.conclusion || undefined,
                nextVisitDate: data.nextVisitDate || undefined,
                deathDate: data.deathDate || undefined

            })

        }
    }, [data, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'diagnoses'
    })

    function handleCodeChange(value: string) {
        setValue(value);
    }


    const mutation = useMutation({
        mutationFn: (data: CreateInspectionData) => editInspection(data, String(id)),
        onSuccess: () => console.log("Успешно обновлено"),
        onError: (e) => console.log(e.response.data?.message)

    })


    const submitForm = (data: CreateInspectionData) => {
        console.log(data);
        mutation.mutate(data);
    }

    const diadDescriptionRef = useRef<HTMLTextAreaElement>(null);
    function handleAddDiag() {
        if (selectedDiag == null) {
            alert('Не выбран диагноз');
            return;
        }

        selectedDiag.description = diadDescriptionRef.current?.value;
        selectedDiag.type = selectedDiagType;
        append({
            icdDiagnosisId: selectedDiag.id,
            description: selectedDiag.description,
            type: selectedDiag.type,
            name: selectedDiag.name
        });
        setAllDiags([...allDiags, selectedDiag]);
        setSelectedDiag(null);
        setValue('');
        diadDescriptionRef.current.value = "";
    }

    const conclType = watch('conclusion');
    console.log(data)
    return (
        <MainLayout>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title><b>Редактирование осмотра</b></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className='d-flex jusify-content-center align-items-center flex-column' onSubmit={handleSubmit(submitForm)}>
                        <Card style={{ width: '100%' }}>
                            <Card.Header>Жалобы</Card.Header>
                            <Card.Body>
                                <Form.Group className='mb-3' controlId='complaints'>
                                    <Form.Control as='textarea' placeholder='Введите жалобы' {...register("complaints")}></Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Card className='mt-3' style={{ width: '100%' }}>
                            <Card.Header>Анамнез заболевания</Card.Header>
                            <Card.Body>
                                <Form.Group className='mb-3' controlId='anamnesis'>
                                    <Form.Control as='textarea' placeholder='Введите анамнез' {...register("anamnesis")}></Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.treatment?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                        <Card className='mt-3' style={{ width: '100%' }}>
                            <Card.Header>Рекомендации по лечению</Card.Header>
                            <Card.Body>
                                <Form.Group className='mb-3' controlId='anamnesis'>
                                    <Form.Control as='textarea' placeholder='Введите рекомендации' {...register("treatment")}></Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors?.treatment?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <Card className='mt-3'>
                            <Card.Header>Диагнозы</Card.Header>
                            <Card.Body>
                                {fields.map((field, index) => (
                                    <Card key={field.icdDiagnosisId} className='mt-3'>
                                        <Card.Body>
                                            <Card.Header className='d-flex justify-content-center align-items-center'><Badge>{field.name}</Badge></Card.Header>
                                            <Form.Label className='mt-2'>Описание диагноза</Form.Label>
                                            <Form.Control type='text' placeholder='Введите описание диагноза' {...register(`diagnoses.${index}.description`)} ></Form.Control>
                                            <Form.Label className='mt-2'>Тип диагноза</Form.Label>
                                            <Form.Select className='mt-2' {...register(`diagnoses.${index}.type`)}>
                                                <option value="Main">Основной</option>
                                                <option value="Concomitant">Сопутствующий</option>
                                                <option value="Complication">Осложнение</option>
                                            </Form.Select>
                                            <Button variant='warning' className='mt-2' onClick={() => remove(index)}>Удалить диагноз</Button>
                                        </Card.Body>
                                    </Card>
                                ))}

                                <Row className='d-flex justify-content-center align-items-center'>
                                    <hr className='mt-3 ml-2'></hr>
                                    <CardText><b>Добавление нового диагноза</b></CardText>
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
                                <div className='d-flex justify-content-center align-items-center'>

                                    <Button className='mt-4' onClick={() => handleAddDiag()} variant="outline-primary">Добавить диагноз</Button>
                                </div>
                            </Card.Body>
                            <Form.Control.Feedback type="invalid">
                                {errors?.diagnoses?.message}
                            </Form.Control.Feedback>

                        </Card>
                        <Card className='mt-3' style={{ width: '100%' }}>
                            <Card.Header>Заключение</Card.Header>
                            <Card.Body>
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
                            </Card.Body>
                        </Card>
                        <div className='d-flex jusify-content-center align-items-center'>

                            <h4>

                                <Button type='submit' className='mt-4' >Применить изменения</Button>
                            </h4>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Отмена
                    </Button>
                </Modal.Footer>
            </Modal>
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

                        <Button disabled={doctor?.id != data?.doctor?.id} onClick={handleShow}><b>Редактировать осмотр</b></Button>
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