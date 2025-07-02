import { createBrowserRouter } from "react-router-dom";
import HomePage from "../features/Home/HomePage";
import PlayPage from "../features/Play/PlayPage";
import ScorePage from "../features/Score/ScorePage";
import WaitingRoom from "../features/Waiting/WaitingRoom";
import GamePage from "../features/Game/GamePage";
import GlobalRoomPage from "../features/GlobalRoom/GlobalRoomPage";
import Profile from "../features/Profile/Profile";
import ProtectedRoute from "./ProtectedRoute";

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
        path: '/game', 
        element: <GamePage />,
    },
    {
        path: '/globalRoom',
        element: <GlobalRoomPage />,
    },
    {
        path: '/profile',
        element: <Profile />
    },
    {
        path: '*',
        element: <ProtectedRoute fallback={<HomePage />} />,
    }
]);