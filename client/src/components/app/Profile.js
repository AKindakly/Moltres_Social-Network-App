import ProfilePic from "./ProfilePic";
import BioEditor from "./BioEditor";

export default function Profile(props) {
    return (
        <>
            <div className="profile-big-cont">
                <div>
                    <ProfilePic
                        profilePic={props.profilePic}
                        togglePopup={props.togglePopup}
                        profilePicClass={"big-profile-pic"}
                    />
                </div>
                <div>
                    <h2>{props.fullName}</h2>

                    <div className="bio-cont">
                        <BioEditor
                            bio={props.bio}
                            updateBio={props.updateBio}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
