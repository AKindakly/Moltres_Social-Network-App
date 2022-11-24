import { BrowserRouter, Route, Redirect } from "react-router-dom";
import Registration from "./Registration.jsx";
import Login from "./Login.jsx";
import ForgetPassword from "./ForgetPassword.jsx";

import "../../../style.css";

export default function Welcome() {
    return (
        <div className="welcome-cont">
            <div className="welcome-sml-cont">
                <h1>Moltres</h1>
                <h2>
                    The social network for meeting <br></br>new people :)
                </h2>
            </div>
            <div className="forms-sml-cont">
                <BrowserRouter>
                    <div>
                        <Route exact path="/">
                            <Login />
                        </Route>
                        <Route path="/registration">
                            <Registration />
                        </Route>
                        <Route path="/forgetPassword">
                            <ForgetPassword />
                        </Route>
                        <Route path="/">
                            <Redirect to="/" />
                        </Route>
                    </div>
                </BrowserRouter>
            </div>
        </div>
    );
}
