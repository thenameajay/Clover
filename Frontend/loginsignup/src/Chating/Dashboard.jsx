import "../Styles/ChatScreen.css"
import dp from "../assets/dp.png"
import homeIcon from "../assets/home.png"
import logoutIcon from "../assets/logout.png"
import statusIcon from "../assets/status.png"
import settingsIcon from "../assets/settings.png"
import calls from "../assets/call2.png"
import { useEffect, useState } from "react"
import { auth, signOut } from "../Firebase"

function Dashboard(props) {
    const [activeComponent, setActiveComponent] = useState("home")

    useEffect(() => {
        if (activeComponent) {
            props.changeCurrentWindow(activeComponent)
        }
    }, [activeComponent])

    const handleLogout = async () => {
        // Log out the user
        try {
            // const idToken = await user.getIdToken()
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                method: 'GET',
                headers: {
                    'authorization': `${props.user.idToken}`, // Include token in the Authorization header
                },
            });
            await signOut(auth).then(() => {
                console.log("user signed out")
                // console.log("User has been signed out successfully from firebase.");
                // setIsLoggedIn(false)
            }).catch((error) => {
                console.error("Error signing out:", error);
            });
        } catch (error) {
            console.log(error)
            alert("Server Error")
            // console.log(error)
        }
    }

    return (
        <div id="dashboard" className="chat-sub-screen">
            <div className="sub-dashboard-div" id="user-dp-div">
                <img className="dashboard-buttons" src={props?.user?.dp ? props.user.dp : dp} alt={":)"} onClick={() => props.changeShowDpComponentDetails({
                    username: props.user.username,
                    dpUrl: props.user.dp,
                    isUserDp: true,
                })} />
            </div>
            <div className="sub-dashboard-div" id="dashboard-options-div">
                <div className={`dashboard-inner-options-div${activeComponent == 'home' ? '-active' : ''}`} onClick={() => setActiveComponent("home")}>
                    <img className="dashboard-buttons" src={homeIcon} alt="Home" />
                </div>
                <div className={`dashboard-inner-options-div${activeComponent == 'calls' ? '-active' : ''}`} onClick={() => setActiveComponent("calls")}>
                    <img className="dashboard-buttons" src={calls} alt="calls" />
                </div>
                <div className={`dashboard-inner-options-div${activeComponent == 'status' ? '-active' : ''}`} onClick={() => setActiveComponent("status")}>
                    <img className="dashboard-buttons" src={statusIcon} alt="Status" />
                </div>
                <div className={`dashboard-inner-options-div${activeComponent == 'settings' ? '-active' : ''}`} onClick={() => setActiveComponent("settings")}>
                    <img className="dashboard-buttons" src={settingsIcon} alt="Settings" />
                </div>
            </div>
            <div className="sub-dashboard-div" id="logout-div">
                <img className="dashboard-buttons" src={logoutIcon} alt="Logout" onClick={handleLogout} />
            </div>
        </div>
    )
}

export default Dashboard