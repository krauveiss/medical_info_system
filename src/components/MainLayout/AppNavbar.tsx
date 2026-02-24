import axios from 'axios';
import React from 'react'
import { Container, Navbar, Nav, Button, NavDropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../shared/api/axiosConfig';
import { useQuery } from '@tanstack/react-query';

async function getDoctorInfo() {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;

}
const AppNavbar = () => {

    const navigate = useNavigate();
    const { data, isError } = useQuery({
        queryKey: ['doctor-info'],
        queryFn: getDoctorInfo,
    })

    const destroyCookie = () => {
        document.cookie = "token=; Max-Age=0; path=/";
        navigate('/login');
        window.location.reload();
    }

    const auth = !!data && !isError;

    return (
        <Navbar bg="dark" variant='dark' expand="lg">
            <Container>
                <Navbar.Brand>h0spital</Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {auth ? (
                            <>
                                <NavDropdown title={data.name}>
                                    <NavDropdown.Item>Профиль</NavDropdown.Item>
                                    <NavDropdown.Item onClick={destroyCookie}>Выход</NavDropdown.Item>

                                </NavDropdown>
                            </>) : (
                            <><Nav.Link as={Link} to="/login">Вход</Nav.Link>
                                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link></>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default AppNavbar
