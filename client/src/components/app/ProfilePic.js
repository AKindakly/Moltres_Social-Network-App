export default function ProfilePic({
    profilePic,
    togglePopup,
    profilePicClass,
}) {
    profilePic = profilePic || "../emptyProfilePic.png";

    return (
        <>
            <img
                className={profilePicClass}
                src={profilePic}
                alt="..."
                onClick={togglePopup}
            />
        </>
    );
}
