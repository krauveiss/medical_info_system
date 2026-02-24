import React from 'react'
import { Card, Container, Row } from 'react-bootstrap'
import MainLayout from '../../components/MainLayout/MainLayout'

const Profile = () => {
    return (
        <>
            <MainLayout>
                <Container>
                    <Row className='justify-content-center mt-4' >
                        <Card>
                            <Card.Title>Test</Card.Title>
                        </Card>
                    </Row>
                </Container>
            </MainLayout>
        </>
    )
}

export default Profile
