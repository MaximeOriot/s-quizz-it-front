import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/Home/HomePage";
import PlayPage from "../features/Play/PlayPage";
import ScorePage from "../features/Score/ScorePage";
import WaitingRoom from "../features/Waiting/WaitingRoom";
import Profile from "../features/Profile/Profile";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/play',
        element: <PlayPage />,
    },
    {
        path: '/score',
        element: <ScorePage />,
    },
    {
        path: '/waitingRoom', 
        element: <WaitingRoom />,
    },
    {
        path: '/profile',
        element: <Profile />
    }
]);