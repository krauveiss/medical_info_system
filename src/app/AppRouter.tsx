import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../pages/Register/Register";

const router = createBrowserRouter([
    {
        path: '/register',
        element: <Register></Register>


    }
])

export const AppRouter = () => <RouterProvider router={router}></RouterProvider>