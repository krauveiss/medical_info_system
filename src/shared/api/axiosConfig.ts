import axios from "axios";


function getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
}

const axiosInstance = axios.create({
    baseURL: 'https://mis-api.kreosoft.space/api',
    headers: {
        'Content-Type': 'application/json'
    }
});


axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            document.cookie = "token=; Max-Age=0; path=/"
        }
        return Promise.reject(error)
    }
)

export default axiosInstance; 