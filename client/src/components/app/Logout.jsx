import { useNavigate } from "react-router-dom";

export default function Logout() {
    function handleLogut() {
        const navigate = useNavigate();

        fetch("/logout")
            .then((res) => res.json())
            .then(() => {
                navigate("/login");
                window.location.reload();
            });
    }
    return (
        <>
            <div className="logout-btn" onClick={handleLogut}>
                Log Out
            </div>
        </>
    );
}
