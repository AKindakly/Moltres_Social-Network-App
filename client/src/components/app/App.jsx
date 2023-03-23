import { Component } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Logo from "./Logo.jsx";
import ProfilePic from "./ProfilePic.jsx";
import Uploader from "./Uploader.jsx";
import Profile from "./Profile.jsx";
import FindPeople from "./FindPeople.jsx";
import OtherProfile from "./OtherProfile.jsx";
import Friends from "./Friends.jsx";
import Chat from "./Chat.jsx";
import Logout from "./Logout.jsx";

import "../../../style.css";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            fullName: "",
            profilePic: "",
            bio: "",
            isPopupOpen: false,
        };

        // console.log("state ", this.state);
        this.togglePopup = this.togglePopup.bind(this);
        this.updateBio = this.updateBio.bind(this);
    }

    componentDidMount() {
        // fetch user info from server
        // add it to the state!
        fetch("/user", {
            method: "GET",
        })
            .then((res) => res.json())
            .then((data) => {
                // console.log("data from GET /user: ", data);

                this.setState({
                    firstName: data.first_name,
                    lastName: data.last_name,
                    fullName: data.full_name,
                    profilePic: data.profile_pic,
                    bio: data.bio,
                });
            })
            .catch((err) => {
                // if something goes wrong => render an error
                console.log("error in submiting login", err);
            });
    }

    togglePopup() {
        this.setState({
            // set it to the opposite of its current value!
            isPopupOpen: !this.state.isPopupOpen,
        });
    }

    setProfilePic(newProfilePic) {
        // update the state with new profile pic url!
        // close the popup!
        this.setState({
            profilePic: newProfilePic,
        });
        this.togglePopup();
    }

    updateBio(newBio) {
        this.setState({
            bio: newBio,
        });
    }

    render() {
        return (
            <div>
                <div className="bg"></div>
                <div className="bg bg2"></div>
                <div className="bg bg3"></div>
                <BrowserRouter>
                    <div>
                        <div className="app-header">
                            <div className="logo">
                                <Logo />
                            </div>
                            <div className="small-pic">
                                <ProfilePic
                                    profilePic={this.state.profilePic}
                                    togglePopup={this.togglePopup}
                                    profilePicClass={"sml-profile-pic"}
                                />
                            </div>
                            <div>
                                <p> Hi {this.state.firstName}</p>
                            </div>
                        </div>
                        <div className="app-navbar">
                            <div className="navbar">
                                <Link to="/profile">Profile</Link>
                            </div>
                            <div className="navbar">
                                <Link to="/friends">Friends</Link>
                            </div>
                            <div className="navbar">
                                <Link to="/chat">Live Chat</Link>
                            </div>
                            <div className="navbar">
                                <Link to="/people">Find People</Link>
                            </div>
                            <div className="navbar">
                                <Logout />
                            </div>
                        </div>
                    </div>
                    <div>
                        {this.state.isPopupOpen && (
                            <Uploader
                                setProfilePic={(newProfilePic) => {
                                    this.setProfilePic(newProfilePic);
                                }}
                            />
                        )}
                    </div>
                    <Routes>
                        <Route
                            exact
                            path="/profile"
                            element={
                                <Profile
                                    firstName={this.state.firstName}
                                    lastName={this.state.lastName}
                                    fullName={this.state.fullName}
                                    profilePic={this.state.profilePic}
                                    bio={this.state.bio}
                                    updateBio={this.updateBio}
                                    togglePopup={this.togglePopup}
                                />
                            }
                        />

                        <Route path="/people" element={<FindPeople />} />

                        <Route path="/users/:id" element={<OtherProfile />} />

                        <Route exact path="/friends" element={<Friends />} />

                        <Route path="/chat" element={<Chat />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    }
}
