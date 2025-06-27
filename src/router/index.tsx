import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/Home/HomePage";
import PlayPage from "../features/Play/PlayPage";
import WaitingRoom from "../features/Waiting/WaitingRoom";

export const router = createBrowserRouter([
    {
        path: '/aa',
        element: <HomePage />,
    },
    {
        path: '/play',
        element: <PlayPage />,
    },
    {
        path: '/', //Todo: remettre les bons path avant de merge
        element: <WaitingRoom />,
    },
]);