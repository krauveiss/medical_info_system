import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";

const router = createBrowserRouter([
    {
        path: '/register',
        element: <Register></Register>
    },
    {
        path: '/login',
        element: <Login></Login>
    }
])

export const AppRouter = () => <RouterProvider router={router}></RouterProvider>