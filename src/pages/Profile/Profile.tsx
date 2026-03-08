import { Card, Col, Container, Form, Row, Button, Spinner, Placeholder } from 'react-bootstrap'
import MainLayout from '../../components/MainLayout/MainLayout'
import type z from 'zod'
import { changeprofileSchema } from './changeprofile.schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import axiosInstance from '../../shared/api/axiosConfig'
import { useEffect } from 'react'




async function getDoctorInfo() {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;
}



const formatDateForInput = (isoDate?: string) => {
    if (!isoDate) return '';
    return isoDate.split('T')[0];
};

const Profile = () => {

    type changeFormData = z.infer<typeof changeprofileSchema>

    function updateDoctorInfo(data: changeFormData) {
        return axiosInstance.put('/doctor/profile', data);
    }


    const { register, handleSubmit, reset, formState: { errors } } = useForm<changeFormData>({ resolver: zodResolver(changeprofileSchema) });

    const { data, isPending, } = useQuery({
        queryKey: ['doctor-info'],
        queryFn: getDoctorInfo,
    })

    const mutation = useMutation({
        mutationFn: updateDoctorInfo,
        onSuccess: () => { alert("Профиль успешно обновлен"); },
        onError: (error) => { alert(error.response?.data.message || 'Ошибка при обновлении профиля'); },

    })

    function onSubmitForm(data: changeFormData) {
        console.log(data);
        mutation.mutate(data);

    }

    useEffect(() => {
        if (data) {
            reset({
                name: data.name,
                email: data.email,
                phone: data.phone,
                gender: data.gender.toLowerCase(),
                birthday: formatDateForInput(data.birthday),
            });
        }
    }, [data, reset]);

    return (
        <>
            <MainLayout>
                <Container>
                    <Row className='justify-content-center mt-4' >
                        <Col md={8} lg={6}>
                            <Card className='shadow-sm'>
                                <Card.Header className='text-center mb-4 fs-3 '>Личный кабинет</Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit(onSubmitForm, console.log)}>
                                        <Row>
                                            <Form.Group className='mb-3' controlId='name'>
                                                <Form.Label>ФИО</Form.Label>
                                                <Form.Control type='text' placeholder='Иванов Иван Иванович' style={{
                                                    filter: isPending ? 'blur(4px)' : 'none',
                                                    transition: 'filter 0.1s ease'
                                                }} required {...register("name")} isInvalid={!!errors.name}></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Group className='mb-3' controlId='gender'>
                                                    <Form.Label>Пол</Form.Label>
                                                    <Form.Select style={{
                                                        filter: isPending ? 'blur(4px)' : 'none',
                                                        transition: 'filter 0.1s ease'
                                                    }} {...register("gender")}
                                                        isInvalid={!!errors.gender}>
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
                                                    <Form.Control type='date' style={{
                                                        filter: isPending ? 'blur(4px)' : 'none',
                                                        transition: 'filter 0.1s ease'
                                                    }} required {...register("birthday")}
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
                                                <Form.Control type='tel' required placeholder='+7 777 777 7777' style={{
                                                    filter: isPending ? 'blur(4px)' : 'none',
                                                    transition: 'filter 0.1s ease'
                                                }} {...register("phone")}
                                                    isInvalid={!!errors.phone}></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.phone?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group className='mb-3' controlId='email' >
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control type='email' required placeholder='test@example.com' style={{
                                                    filter: isPending ? 'blur(4px)' : 'none',
                                                    transition: 'filter 0.1s ease'
                                                }} {...register("email")}
                                                    isInvalid={!!errors.email}></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Button variant='primary' type='submit' className='mt-3 w-100' disabled={mutation.isPending}>{mutation.isPending ? (<Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />) : 'Сохранить изменения'}</Button>

                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </MainLayout>
        </>
    )


}

export default Profile
