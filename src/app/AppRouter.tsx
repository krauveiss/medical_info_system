import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Profile from "../pages/Profile/Profile";
import CheckAuth from "../shared/api/CheckAuth";

const router = createBrowserRouter([
    {
        path: '/register',
        element: <Register></Register>
    },
    {
        path: '/login',
        element: <Login></Login>
    },
    {
        path: '/profile',
        element: <CheckAuth><Profile></Profile></CheckAuth>
    }
])

export const AppRouter = () => <RouterProvider router={router}></RouterProvider>