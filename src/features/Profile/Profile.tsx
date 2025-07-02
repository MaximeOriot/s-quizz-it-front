import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import type { Profile } from "../../models/profile";
import { useLocation, useNavigate } from "react-router-dom";
import { FriendsService } from "../../services/friends.service";
import { ProfileService } from "../../services/profile.service";
import type { Avatar } from "../../models/avatar";
import { RequestResponseEnum } from "../../enums/request-response.enum";

function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const path: string = location.state?.from ?? '/';
    const [onModif, setOnModif] = useState<boolean>(false);
    const [friends, setFriends] = useState<Profile[]>([])
    const [user, setUser] = useState<Profile>({
        avatar: { idAvatar: 1, urlavatar: './src/assets/logo-squizzit.png'},
        id: 1,
        pseudo: '',
        elo: 0,
        idAvatar: 1,
    });
    const [friendRequests, setFriendRequests] = useState<Profile[]>([]);
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
    const [showFriendsModal, setShowFriendsModal] = useState<boolean>(false);
    const [newRequest, setNewRequest] = useState<string>('');
    const [requestResponse, setRequestResponse] = useState<RequestResponseEnum>(RequestResponseEnum.NONE);
    
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

        const fetchRequests = async () => {
            try {
                const data = await FriendsService.getRequests();
                setFriendRequests(data);
            } catch (error) {
                console.error('Error fetching avatars :', error);
            }
        }

        Promise.all([
            fetchFriends(),
            fetchProfile(),
            fetchAvatar(),
            fetchRequests(),
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

    const answerRequest = (applicant: Profile, isAccepted: boolean) => {
        try {
            const response: string = isAccepted ? 'accepter' : 'refuser';
            FriendsService.answerRequest(applicant.id.toString(), response);
        } catch (error) {
            console.error('Error answering request:', error);
        }
        setFriendRequests(friendRequests.filter(request => request.id !== applicant.id));
        if(isAccepted){
            setFriends([...friends, applicant]);
        }
    }

    const sendRequest = async () => {
        try {
            const response: { success: boolean } = await FriendsService.sendRequest(newRequest);
            setRequestResponse(response.success ? RequestResponseEnum.ACCEPTED : RequestResponseEnum.ERROR);
        } catch (error) {
            setRequestResponse(RequestResponseEnum.ERROR);
            console.error('Error sending request:', error);
        }
    }

    const deleteFriend = (id: number) => {
        try {
            FriendsService.deleteFriend(id.toString());
        } catch (error) {
            console.error('Error deleting friend :', error);
        }
        setFriends(friends.filter(friend => friend.id !== id));
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
                <p className="text-secondary">Score : <span className="font-semibold text-primary">{user.elo}</span></p>

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
            <div className="absolute right-40 top-40">
                <Button
                onClick={() => setShowFriendsModal(true)}
                variant="thirdary"
                textSize="sm"
                width='5xl'
                >
                    Gérer vos amis
                </Button>
            </div>
            <div className="absolute p-4 transform -translate-y-1/2 shadow-md w-102 right-24 top-80 rounded-xl">
                {friends.length > 0 ? (
                    <>
                        <h2 className="mb-4 text-lg text-center font-syne text-primary">Vos amis :</h2>
                        <ul>
                            {friends.map((friend, index) => (
                                <li key={index} className="flex items-center mb-2">
                                    <img
                                        src={friend.avatar?.urlavatar || './src/assets/logo-squizzit.png'}
                                        alt={`Avatar de ${friend.pseudo}`}
                                        className="object-cover w-8 h-8 mr-3 border-2 rounded-full border-thirdary"
                                    />
                                    <span className="text-secondary">{`${friend.pseudo} | Score : ${friend.elo}`}</span>
                                    <Button
                                    variant="primary"
                                    textSize="sm"
                                    width="xl"
                                    className="m-2"
                                    onClick={() => deleteFriend(friend.id)}
                                    >
                                        Supprimer
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <h2 className="m-20 text-center text-primary">Vous n'avez pas d'ami</h2>
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

            {showFriendsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
                        <h2 className="mb-4 text-xl font-bold text-center text-primary">Demandes d'amis</h2>
                        <div className="mb-4">
                            {friendRequests.length > 0 ? (
                                <ul>
                                    {friendRequests.map((request, index) => (
                                        <li key={index} className="flex items-center mb-2">
                                            <span className="text-secondary">{`${request.pseudo}`}</span>
                                            <Button
                                            variant="primary"
                                            textSize="sm"
                                            width="xl"
                                            className="m-2"
                                            onClick={() => answerRequest(request, true)}
                                            >
                                                Accepter
                                            </Button>
                                            <Button
                                            variant="primary"
                                            textSize="sm"
                                            width="xl"
                                            onClick={() => answerRequest(request, false)}
                                            >
                                                Refuser
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-primary">Aucune demande en attente</p>
                            )}
                        </div>

                        <h2 className="mb-4 text-xl font-bold text-center text-primary">Ajouter un amis</h2>
                        {requestResponse === RequestResponseEnum.ERROR && (
                            <p className="mb-2 text-center text-secondary">Impossible d'envoyer la demande pour ce pseudo</p>
                        )}
                        {requestResponse === RequestResponseEnum.ACCEPTED && (
                            <p className="mb-2 text-center text-green">Demande d'amis envoyer !</p>
                        )}
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                onChange={(e) => setNewRequest(e.target.value)}
                                placeholder="Entrez un pseudo"
                                className="w-2/3 p-2 border rounded-md"
                            />
                            <Button
                                variant="primary"
                                textSize="sm"
                                width="4xl"
                                onClick={sendRequest}
                            >
                                Envoyer
                            </Button>
                        </div>

                        <button
                            onClick={() => setShowFriendsModal(false)}
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