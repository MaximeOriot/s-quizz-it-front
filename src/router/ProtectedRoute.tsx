import PlayPage from "../features/Play/PlayPage";


export default function ProtectedRoute({ fallback }: { fallback: JSX.Element }) {
    const isAuthenticated = !!localStorage.getItem('token')
    
    if (isAuthenticated) {
        return <PlayPage />;
    }
    
    return fallback;
}