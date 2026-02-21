import React from 'react'
import MainLayout from '../../components/MainLayout/MainLayout'
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap'
import type z from 'zod'
import { registerSchema } from './register.schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'


const Register = () => {
    type RegisterFormData = z.infer<typeof registerSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    function onSubmit(data: RegisterFormData) {
        console.log(data);
    }

    return (
        <MainLayout>
            <Container>
                <Row className='justify-content-center mt-4' >
                    <Col md={8} lg={6}>
                        <Card className='shadow-sm'>
                            <Card.Body>
                                <Card.Title className='text-center mb-4 fs-2 '>Регистрация</Card.Title>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Row>
                                        <Form.Group className='mb-3' controlId='name'>
                                            <Form.Label>ФИО</Form.Label>
                                            <Form.Control type='text' placeholder='Иванов Иван Иванович' required {...register("name")}
                                                isInvalid={!!errors.name}></Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.name?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Group className='mb-3' controlId='gender'>
                                                <Form.Label>Пол</Form.Label>
                                                <Form.Select
                                                    {...register("gender")}
                                                    isInvalid={!!errors.gender}
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
                                                <Form.Control type='date' required
                                                    {...register("birthday")}
                                                    isInvalid={!!errors.birthday}></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.birthday?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Form.Group className='mb-3' controlId='phone'>
                                            <Form.Label>Телефон</Form.Label>
                                            <Form.Control type='phone' required placeholder='+7 777 777 7777' {...register("phone")}
                                                isInvalid={!!errors.phone}></Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.phone?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group className='mb-3' controlId='speciality'>
                                            <Form.Label>Cпециальность</Form.Label>
                                            <Form.Select required {...register("speciality")}
                                                isInvalid={!!errors.speciality}>
                                                <option value="">Выберите специалность</option>
                                                <option value="doc1">Терапевт</option>
                                                <option value="doc2">Хирург</option>
                                                <option value="doс3">Ортопед</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.speciality?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group className='mb-3' controlId='email' >
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type='email' required placeholder='test@example.com' {...register("email")}
                                                isInvalid={!!errors.email}></Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.email?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Row>
                                        <Form.Group className='mb-3' controlId='password'>
                                            <Form.Label>Пароль</Form.Label>
                                            <Form.Control type='password' required placeholder='' {...register("password")}
                                                isInvalid={!!errors.password}></Form.Control>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Row>
                                    <Button variant='primary' type='submit' className='mt-3 w-100'>Зарегистрироваться</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </MainLayout>
    )
}

export default Register

