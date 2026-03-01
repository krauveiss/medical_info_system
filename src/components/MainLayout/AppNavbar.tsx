import { Container, Navbar, Nav, NavDropdown, NavbarText, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../shared/api/axiosConfig';
import { useQuery } from '@tanstack/react-query';

async function getDoctorInfo() {
    const { data } = await axiosInstance.get('/doctor/profile');
    return data;

}
const AppNavbar = () => {
    const navigate = useNavigate();


    const destroyCookie = () => {
        document.cookie = "token=; Max-Age=0; path=/";
        navigate('/login');
        refetch();
    }
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

    const { data, isError, isPending, refetch } = useQuery({
        queryKey: ['doctor-infos'],
        queryFn: getDoctorInfo,
        enabled: !!token,
        retry: false
    })
    const auth = !!data && !isError;

    return (
        <Navbar bg="dark" variant='dark' expand="lg" style={{ position: "sticky", top: '0px', zIndex: 100 }}>
            <Container>
                <Navbar.Brand>h0spital</Navbar.Brand>
                {(isPending && token) ? (<><NavbarText>Подождите, пожалуйста...</NavbarText></>) : (<><Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {auth ? (
                            <>
                                <Nav><Nav.Link style={{ color: 'gray' }} onClick={() => navigate('/patients')}>Пациенты</Nav.Link>
                                    <Nav.Link style={{ color: 'gray' }}>Консультации</Nav.Link>
                                    <Nav.Link style={{ color: 'gray' }}>Отчеты и статистика</Nav.Link>
                                </Nav>

                            </>) : (
                            <><NavbarText>Пожалуйста, пройдите авторизацию.</NavbarText></>
                        )}
                        <Nav className="ms-auto">
                            {auth ? (
                                <>

                                    <NavDropdown title={data.name}>

                                        <NavDropdown.Item onClick={() => navigate('/profile')}>Профиль</NavDropdown.Item>
                                        <NavDropdown.Item onClick={destroyCookie}>Выход</NavDropdown.Item>

                                    </NavDropdown>
                                </>) : (
                                <><Nav.Link as={Link} to="/login">Вход</Nav.Link>
                                    <Nav.Link as={Link} to="/register">Регистрация</Nav.Link></>
                            )}
                        </Nav>
                    </Navbar.Collapse></>)}

            </Container>
        </Navbar>
    )
}

export default AppNavbar
