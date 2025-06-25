import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/Home/HomePage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
]);