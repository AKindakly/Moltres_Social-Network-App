import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Registration from "./Registration";
import Login from "./Login";
import ForgetPassword from "./ForgetPassword";

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
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route
                            path="/registration"
                            element={<Registration />}
                        />
                        <Route
                            path="/forgetPassword"
                            element={<ForgetPassword />}
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    );
}
