import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Profile from "../pages/Profile/Profile";
import CheckAuth from "../shared/api/CheckAuth";
import Patients from "../pages/Patients/Patients";
import Patient from "../pages/Patient/Patient";
import CreateInpspection from "../pages/CreateInpsections/CreateInpspection";
import InspectionDetails from "../pages/InspectionDetails/InspectionDetails";
import Consultations from "../pages/Consultation/Consultations";
import Reports from "../pages/Reports/Reports";

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
    ,
    {
        path: '/patients',
        element: <CheckAuth><Patients></Patients></CheckAuth>
    }
    ,
    {
        path: '/patient/:id',
        element: <CheckAuth><Patient></Patient></CheckAuth>
    },
    {
        path: '/inspection/create',
        element: <CheckAuth><CreateInpspection></CreateInpspection></CheckAuth>
    }
    ,
    {
        path: '/inspection/:id',
        element: <CheckAuth><InspectionDetails></InspectionDetails></CheckAuth>
    }
    ,
    {
        path: '/consultations',
        element: <CheckAuth><Consultations></Consultations></CheckAuth>
    }
    ,
    {
        path: '/reports',
        element: <CheckAuth><Reports></Reports></CheckAuth>
    }

])

export const AppRouter = () => <RouterProvider router={router}></RouterProvider>