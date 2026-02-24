import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';



type Prop = {
    children: React.JSX.Element;
}
const CheckAuth = ({ children }: Prop) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            navigate('/login');
            return;
        }

        axiosInstance.get('doctor/profile').catch(() => navigate('/login'));
    });

    return children;


}

export default CheckAuth
