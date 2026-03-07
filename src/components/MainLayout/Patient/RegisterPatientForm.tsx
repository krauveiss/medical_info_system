import React, { useState } from 'react'
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import type z from 'zod'
import { registerPatientSchema } from './registerPatientSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axiosInstance from '../../../shared/api/axiosConfig'

const RegisterPatientForm = () => {

    type registerPatientData = z.infer<typeof registerPatientSchema>;


    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<registerPatientData>({ resolver: zodResolver(registerPatientSchema) });


    async function registerPatient(data: registerPatientData) {
        return axiosInstance.post('https://mis-api.kreosoft.space/api/patient', data)
    }

    const mutation = useMutation({
        mutationFn: registerPatient,
        onSuccess: () => { setAlertShow(true) },
        onError: () => { setAlertShow(true) },
    })

    const [alertShow, setAlertShow] = useState(false);
    function onSubmit(data: registerPatientData) {
        console.log(data);
        mutation.mutate(data);
    }
    return (
        <div>
            <Container>
                <Row className='justify-content-center' >
                    <Col>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col>
                                    <Form.Group className='mb-3' controlId='name'>
                                        <Form.Label>ФИО</Form.Label>
                                        <Form.Control type='text' placeholder='Иванов Иван Иванович' required {...register("name")} isInvalid={!!errors?.name}></Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.name?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group className='mb-3' controlId='gender'>
                                        <Form.Label>Пол</Form.Label>
                                        <Form.Select
                                            {...register("gender")} isInvalid={!!errors?.gender}
                                        >
                                            <option value="">Выберите пол</option>
                                            <option value="male">Мужской</option>
                                            <option value="female">Женский</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.gender?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className='mb-3' controlId='birthday' >
                                        <Form.Label>Дата рождения</Form.Label>
                                        <Form.Control type='date' required {...register("birthday")} isInvalid={!!errors?.birthday}
                                        ></Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.birthday?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Alert variant={mutation.isSuccess ? 'success' : 'danger'} show={alertShow} dismissible onClose={() => setAlertShow(false)}>
                                {mutation.isSuccess ? 'Пользователь успешно создан, можнно закрыть окно' : 'Произошла ошибка'}
                            </Alert>
                            <div className='d-flex flex-row-reverse'>
                                <Button type='submit' disabled={mutation.isPending}>{mutation.isPending ? (<Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />) : 'Зарегистрироваться'}</Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default RegisterPatientForm
