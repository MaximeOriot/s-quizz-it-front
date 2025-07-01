import { useState } from "react";
import Button from "../../components/ui/Button";
import type { Profile } from "../../models/profile";
import { useLocation, useNavigate } from "react-router-dom";

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const path: string = location.state?.from ?? '/';
    const [onModif, setOnModif] = useState(false);
    const [user, setUser] = useState<Profile>({
        avatar: '',
        id: 1,
        pseudo: 'Nalator',
        elo: 10,
    }); //TODO récupérer le user du store

    const handlePseudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, pseudo: e.target.value });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="absolute top-4 left-4">
                <Button
                    onClick={() => navigate(path)}
                    variant="primary"
                    textSize="md"
                    width="6xl"
                >
                    ⬅️ Retour
                </Button>
            </div>
            <div className="w-full max-w-md p-8 text-center shadow-lg bg-thirdary rounded-2xl">
                <img
                src={user.avatar}
                alt={`Avatar de ${user.pseudo}`}
                className="object-cover w-24 h-24 mx-auto border-4 rounded-full border-thirdary"
                />
                {onModif ? (
                    <input
                        type="text"
                        value={user.pseudo}
                        onChange={handlePseudoChange}
                        className="mt-4 text-2xl font-bold text-center border rounded-md bg-thirdary text-primary"
                    />
                ) : (
                    <h1 className="mt-4 text-2xl font-bold text-primary">{user.pseudo}</h1>
                )}
                <p className="text-secondary">Niveau ELO : <span className="font-semibold text-primary">{user.elo}</span></p>

                <div className="mt-6">
                <Button
                onClick={() => setOnModif(!onModif)}
                variant='primary'
                textSize='md'
                width='6xl'
                >
                {onModif ? 'Enregistrer' : 'Modifier le profil'}
                </Button>
                </div>
            </div>
        </div>
    );
}
export default Profile;