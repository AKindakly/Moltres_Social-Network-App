// import { useState, useEffect } from "react";

// export default function Friends() {
//     const [friends, setFriends] = useState([]);

//     useEffect(() => {
//         fetch(`/friendships`, {
//             method: "GET",
//         })
//             .then((res) => res.json())
//             .then((data) => {
//                 setFriends(data.friends);
//                 console.log("data friends ", data.friends);
//             });
//     }, []);

//     return (
//         <>
//             <ul>
//                 {friends.map((friend) => (
//                     <li key={friend.id}>
//                         <img src={friend.profile_pic} alt="" />
//                         <p>{friend.full_name}</p>
//                     </li>
//                 ))}
//             </ul>
//         </>
//     );
// }

import { useState, useEffect } from "react";
import FriendButton from "./FriendButton.jsx";
import { Link } from "react-router-dom";

import "../../../style.css";

export default function Friends() {
    const [friends, setFriends] = useState([]);
    const [count, setCount] = useState([]);

    useEffect(() => {
        fetch(`/friendships`, {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                // console.log("data friends ", data.count.count);
                setFriends(data.friends);
                setCount(data.count.count);
            });
    }, []);

    const YourFriends = ({ friends }) => {
        return (
            <>
                {friends.map(({ id, full_name, profile_pic, accepted }) => {
                    if (accepted) {
                        return (
                            <>
                                <ul>
                                    <li key={id}>
                                        <div>
                                            <Link
                                                to={`/users/${id}`}
                                                target="_blank"
                                            >
                                                <img
                                                    src={
                                                        profile_pic ||
                                                        "../emptyProfilePic.png"
                                                    }
                                                    alt=""
                                                />
                                            </Link>
                                        </div>
                                        <div>
                                            <p>{full_name}</p>

                                            <FriendButton friendsId={id} />
                                        </div>
                                    </li>
                                </ul>
                            </>
                        );
                    }
                })}
            </>
        );
    };

    const FriendRequests = ({ friends }) => {
        return (
            <>
                {friends.map(({ id, full_name, profile_pic, accepted }) => {
                    if (!accepted) {
                        return (
                            <>
                                <ul>
                                    <li key={id}>
                                        <div>
                                            <Link
                                                to={`/users/${id}`}
                                                target="_blank"
                                            >
                                                <img
                                                    src={
                                                        profile_pic ||
                                                        "../emptyProfilePic.png"
                                                    }
                                                    alt=""
                                                />
                                            </Link>
                                        </div>
                                        <div>
                                            <p>{full_name}</p>

                                            <FriendButton friendsId={id} />
                                        </div>
                                    </li>
                                </ul>
                            </>
                        );
                    }
                })}
            </>
        );
    };

    return (
        <div className="friends-big-cont">
            <>
                <h3>friends requests</h3>
                <div className="friends-sml-cont">
                    <FriendRequests friends={friends} />
                </div>
            </>
            <hr />
            <>
                <h3>Your friends ({count})</h3>
                <div className="friends-sml-cont">
                    <YourFriends friends={friends} />
                </div>
            </>
        </div>
    );
}
