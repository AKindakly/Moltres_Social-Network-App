import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();

    function handleLogout() {
        fetch("/logout")
            .then((res) => res.json())
            .then(() => {
                navigate("/login");
                window.location.reload();
            });
    }

    return (
        <>
            <div className="logout-btn" onClick={handleLogout}>
                Log Out
            </div>
        </>
    );
}
