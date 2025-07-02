import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import type { Profile } from "../../models/profile";
import { useLocation, useNavigate } from "react-router-dom";
import { FriendsService } from "../../services/friends.service";
import { ProfileService } from "../../services/profile.service";
import type { Avatar } from "../../models/avatar";

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const path: string = location.state?.from ?? '/';
    const [onModif, setOnModif] = useState(false);
    const [friends, setFriends] = useState<Profile[]>([])
    const [user, setUser] = useState<Profile>({
        avatar: { idAvatar: 1, urlavatar: './src/assets/logo-squizzit.png'},
        id: 1,
        pseudo: '',
        elo: 0,
        idAvatar: 1,
    });
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const data = await FriendsService.getAll();
                setFriends(data);
            } catch (error) {
                console.error("Error fetching friends :", error);
            }
        };

        const fetchProfile = async () => {
            try {
                const data = await ProfileService.getProfile();
                setUser(data);
            } catch (error) {
                console.error('Error fetching profile :', error);
            }
        };

        const fetchAvatar = async () => {
            try {
                const data = await ProfileService.getAvatars();
                setAvatars(data);
            } catch (error) {
                console.error('Error fetching avatars :', error);
            }
        };

        Promise.all([
            fetchFriends(),
            fetchProfile(),
            fetchAvatar(),
        ]);
    }, []);

    const handlePseudoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            ProfileService.updateProfile(e.target.value, user.idAvatar);
        } catch (error) {
            console.error('Error updating profile :', error)
        }
        setUser({ ...user, pseudo: e.target.value });
    };

    const saveAvatar = (avatar: Avatar) => {
        try {
            ProfileService.updateProfile(user.pseudo, avatar.idAvatar);
        } catch (error) {
            console.error('Error updating profile :', error);
        }
        setUser({...user, idAvatar: avatar.idAvatar, avatar: avatar});
    }

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
                <div className="relative w-24 h-24 mx-auto">
                    <img
                        src={user.avatar.urlavatar}
                        alt={`Avatar de ${user.pseudo}`}
                        className="object-cover w-24 h-24 border-4 rounded-full border-thirdary"
                    />
                    {onModif && (
                        <img
                        src="./src/assets/icon-crayon.png"
                        alt="Modifier"
                        className="absolute top-0 right-0 w-6 h-6 cursor-pointer"
                        onClick={() => setShowAvatarModal(true)}
                        />
                    )}
                </div>

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
            <div className="absolute w-64 p-4 transform -translate-y-1/2 shadow-md right-24 top-1/2 rounded-xl">
                {friends.length > 0 ? (
                    <>
                        <h2 className="mb-4 text-lg text-center font-syne text-primary">Vos amis :</h2>
                        <ul>
                            {friends.map((friend, index) => (
                                <li key={index} className="flex items-center mb-2">
                                    <img
                                        src={friend.avatar.urlavatar}
                                        alt={`Avatar de ${friend.pseudo}`}
                                        className="object-cover w-8 h-8 mr-3 border-2 rounded-full border-thirdary"
                                    />
                                    <span className="text-secondary">{friend.pseudo}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <h2 className="text-center text-primary">Vous n'avez pas d'ami</h2>
                )}
            </div>
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
                    <h2 className="mb-4 text-xl font-bold text-center text-primary">Choisissez un avatar</h2>
                    <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-64">
                        {avatars.map((avatar) => (
                        <img
                            key={avatar.idAvatar}
                            src={avatar.urlavatar}
                            alt={`Avatar ${avatar.idAvatar}`}
                            className="object-cover w-16 h-16 border-2 rounded-full cursor-pointer hover:border-primary"
                            onClick={() => {
                            saveAvatar(avatar);
                            setShowAvatarModal(false);
                            }}
                        />
                        ))}
                    </div>
                    <button
                        onClick={() => setShowAvatarModal(false)}
                        className="absolute text-xl text-gray-400 top-2 right-3 hover:text-gray-600"
                    >
                        ✖
                    </button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Profile;