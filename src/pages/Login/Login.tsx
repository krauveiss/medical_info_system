import MainLayout from '../../components/MainLayout/MainLayout'
import { Card, Container, Row, Col, Form, Button } from 'react-bootstrap'
import type z from 'zod'
import { loginschema } from './login.schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import axiosInstance from '../../shared/api/axiosConfig'
import { useNavigate } from 'react-router-dom'

function setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
}

const Login = () => {
    const navigate = useNavigate();
    type LoginFormData = z.infer<typeof loginschema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginschema)
    });

    async function login(data: LoginFormData) {
        return axios.post('https://mis-api.kreosoft.space/api/doctor/login', data)
    }

    async function getDoctorInfo() {
        const { data } = await axiosInstance.get('/doctor/profile')
        return data
    }

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: (response) => {
            console.log(response.data);
            reset();
            setCookie('token', response.data.token, 7);
            navigate('/profile')
        },
        onError: (error) => { alert(error.response?.data.message) },

    })

    function onSubmit(data: LoginFormData) {
        mutation.mutate(data);
    }
    const { data } = useQuery({
        queryKey: ['doctor-info'],
        queryFn: getDoctorInfo,
        enabled: false
    });


    return (
        <MainLayout>
            <Container className=''>
                <Row className='justify-content-center mt-4' >
                    <Col md={8} lg={6}>
                        <Card className='shadow-sm'>
                            <Card.Header className='text-center mb-4 fs-2 '>Вход</Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleSubmit(onSubmit)}>
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
                                    <Button variant='primary' type='submit' className='mt-3 w-100' disabled={mutation.isPending}>{mutation.isPending ? 'Вход...' : 'Войти'}</Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </MainLayout >
    )
}

export default Login

