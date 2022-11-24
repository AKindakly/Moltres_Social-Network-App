// // slice file should contain reducer AND actions

// // REDUCER:
// export default function friendsReducer(friends = [], action) {
//     if (action.type === "friends/received") {
//         return action.payload.friends;
//     } else if (action.type === "friends/accept") {
//         const newFriends =
//             friends.map(/** do something with action.payload.id... */);
//         return newFriends;
//     } else if (action.type === "friends/unfriend") {
//         const newFriends =
//             friends.map(/** do something with action.payload.id... */);
//         return newFriends;
//     }
//     return friends;
// }

// // ACTIONS:
// export function setFriendsAction(friends) {
//     return {
//         type: "friends/received",
//         payload: { friends },
//     };
// }

// export function addFriend(id) {
//     return {
//         type: "friends/accept",
//         payload: { id },
//     };
// }

// export function removeFriend(id) {
//     return {
//         type: "friends/unfriend",
//         payload: { id },
//     };
// }
