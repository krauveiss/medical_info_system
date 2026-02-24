import { Card, Col, Container, Form, Row, Button } from 'react-bootstrap'
import MainLayout from '../../components/MainLayout/MainLayout'
import type z from 'zod'
import { changeprofileSchema } from './changeprofile.schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'




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

    const { register, handleSubmit, formState: { errors } } = useForm<changeFormData>({ resolver: zodResolver(changeprofileSchema) });

    const { data, isPending, } = useQuery({
        queryKey: ['doctor-infos'],
        queryFn: getDoctorInfo,
    })
    console.log(data);

    return (
        <>
            <MainLayout>
                <Container>
                    <Row className='justify-content-center mt-4' >
                        <Col md={8} lg={6}>
                            <Card className='shadow-sm'>
                                <Card.Header className='text-center mb-4 fs-3 '>Личный кабинет</Card.Header>
                                <Card.Body>
                                    <Form>
                                        <Row>
                                            <Form.Group className='mb-3' controlId='name'>
                                                <Form.Label>ФИО</Form.Label>
                                                <Form.Control type='text' placeholder='Иванов Иван Иванович' style={{
                                                    filter: isPending ? 'blur(4px)' : 'none',
                                                    transition: 'filter 0.1s ease'
                                                }} defaultValue={data?.name}></Form.Control>
                                                <Form.Control.Feedback type="invalid">
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
                                                    }} defaultValue={data?.gender?.toLowerCase() || ''}>
                                                        <option value="">Выберите пол</option>
                                                        <option value="male">Мужской</option>
                                                        <option value="female">Женский</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">

                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className='mb-3' controlId='birthday' >
                                                    <Form.Label>Дата рождения</Form.Label>
                                                    <Form.Control type='date' style={{
                                                        filter: isPending ? 'blur(4px)' : 'none',
                                                        transition: 'filter 0.1s ease'
                                                    }} defaultValue={formatDateForInput(data?.birthday)}></Form.Control>
                                                    <Form.Control.Feedback type="invalid">

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
                                                }} defaultValue={data?.phone}></Form.Control>
                                                <Form.Control.Feedback type="invalid">

                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Row>
                                            <Form.Group className='mb-3' controlId='email' >
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control type='email' required placeholder='test@example.com' style={{
                                                    filter: isPending ? 'blur(4px)' : 'none',
                                                    transition: 'filter 0.1s ease'
                                                }} defaultValue={data?.email}></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Row>
                                        <Button variant='primary' type='submit' className='mt-3 w-100' >Сохранить изменения</Button>
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
