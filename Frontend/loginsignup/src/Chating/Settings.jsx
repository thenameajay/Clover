import "../Styles/settings.css"
import defaultDP from "../assets/dp.png"
import saveIcon from "../assets/save.svg"
import { useEffect, useState } from "react"

function Settings(props) {
    const [blockList, setBlockList] = useState()
    const [newName, setNewName] = useState()
    const [loggedInDevices, setLoggedInDevices] = useState()
    const [newQuote, setNewQuote] = useState()

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/get-block-list`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username
            })
        }).then((res) => res.json()).then((res1) => {
            setBlockList(res1)
            // console.log(res1)
        })

        fetch(`${import.meta.env.VITE_BACKEND_URL}/logged-in-devices-info`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username
            })
        }).then((res) => res.json()).then((res1) => {
            setLoggedInDevices(res1)
            // console.log(res1)
        })
    }, [])

    const handleUnblock = async (blockedUser) => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/block-user`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username,
                blockedUser: blockedUser,
                unBlock: true
            })
        })
        const newBlockList = blockList.filter((blockedContact) => blockedContact.username !== blockedUser.username)
        setBlockList(newBlockList)
    }

    const handleSaveName = async () => {
        // console.log(newName)
        if (newName.trim() == "" || newName.trim() == props.user.name) {
            return
        }
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/change-name`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username,
                newName: newName.trim()
            })
        })
        if (result.status == 200) {
            props.changeName(newName.trim())
        }
        const msg = await result.json()
        alert(msg.message)
    }

    const handleSaveQuote = async () => {
        // console.log("saving quote...")
        // console.log(newName)
        if (newQuote.trim() == "" || newQuote.trim() == props.user.quote) {
            return
        }
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/change-quote`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: props.user.username,
                newQuote: newQuote.trim()
            })
        })
        if (result.status == 200) {
            props.changeQuote(newQuote.trim())
        }
        const msg = await result.json()
        // console.log(msg)
        alert(msg.message)
    }

    const handleLogoutAllDevices = async () => {
        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/logoutalldevices`, {
                method: 'GET',
                headers: {
                    'authorization': `${props.user.idToken}`, // Include token in the Authorization header
                },
            });
            if (result.status == 200) {
                props.handleUserLogout()
                alert("Logout From All Devices Successfull")
            }
            else {
                const msg = await result.json()
                alert(msg.message)
            }
        } catch (error) {
            console.log(error)
            alert("An Error occured !")
        }
    }

    const handleLogoutSpecificDevice = async (device) => {
        try {
            // console.log(props.user.email)
            // console.log(device._id)
            // console.log(device)
            // console.log(loggedInDevices)
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/logoutspecificaccount`, {
                method: 'POST',
                headers: {
                    'authorization': `${props.user.idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: props.user.email,
                    device_id: device._id
                })
            });
            if (result.status == 200) {
                const newLoggedInDevices = loggedInDevices.filter((element) => element._id !== device._id)
                setLoggedInDevices(newLoggedInDevices)
                alert("Device Logged Out Successfully")
            }
            else {
                const msg = await result.json()
                alert(msg.message)
            }
        } catch (error) {
            console.log(error)
            alert("An Error occured !")
        }
    }

    // useEffect(() => {
    //     console.log("blocklist change -----------------------")
    //     console.log(blockList)
    //     console.log("blocklist change -----------------------")
    // }, [blockList])

    return (
        <div id="settings-outer-div">
            <div id="settings-div">
                <img id="settings-profile-pic" src={props.user?.dp ? props.user?.dp : defaultDP} alt="profile pic" onClick={() => props.changeShowDpComponentDetails({
                    username: props.user.username,
                    dpUrl: props.user.dp,
                    isUserDp: true,
                })} />
                <div className="user-info-div">
                    {/* <label htmlFor="setting_name">Name</label> */}
                    <input type="text" id="setting_name" defaultValue={props.user.name} onChange={(e) => setNewName(e.target.value)} />
                    <img className="settings-icons" src={saveIcon} alt="save" onClick={handleSaveName} />
                </div>

                <div className="user-info-div">
                    {/* <label htmlFor="setting_name">Name</label> */}
                    <input type="text" id="setting-quote" defaultValue={props.user.quote} placeholder={!props.user.quote ? "Enter a Quote..." : null} onChange={(e) => setNewQuote(e.target.value)} />
                    <img className="settings-icons" src={saveIcon} alt="save" onClick={handleSaveQuote} />
                </div>

                <div className="user-info-div">
                    {/* <label htmlFor="setting_email">Email</label> */}
                    <input type="text" id="setting_email" readOnly value={props.user.email} />
                </div>

                <div id="login-devices-outer-div">
                    {loggedInDevices ? <h2>Logged in Devices</h2> : null}
                    {
                        loggedInDevices?.map((device, idx) => {
                            // console.log(device)
                            return (
                                <div key={device._id} className="login-devices-div">
                                    <h3>{`Device ${idx + 1}`}</h3>
                                    <div className="login-device-details">
                                        <label>Device Model</label>
                                        <p>{device.device_model}</p>
                                    </div>
                                    <div className="login-device-details">
                                        <label>Device Type</label>
                                        <p>{device.device_type}</p>
                                    </div>
                                    <div className="login-device-details">
                                        <label>Browser</label>
                                        <p>{device.browser_name}</p>
                                    </div>
                                    <div className="login-device-details">
                                        <label>Operting System</label>
                                        <p>{device.os}</p>
                                    </div>
                                    <div className="login-device-details">
                                        <label>OS Version</label>
                                        <p>{device.os_version}</p>
                                    </div>
                                    <div className="login-device-details">
                                        <label>Location</label>
                                        <p>{device.location}</p>
                                    </div>
                                    <div className="login-device-details">
                                        <label>Last Login Time</label>
                                        <p>{device.last_visit}</p>
                                    </div>
                                    <button className="settings-btns" onClick={() => handleLogoutSpecificDevice(device)}>Logout This Device</button>
                                </div>
                            )
                        })
                    }
                </div>

                <div id="settings-btn-div">
                    <button className="settings-btns">Dark Mode</button>
                    <button className="settings-btns" onClick={handleLogoutAllDevices}>Logout all devices</button>
                    <button className="settings-btns">Delete my account</button>
                </div>

                <div id="blocklist-div" className="user-info-div">
                    {blockList && blockList.length !== 0 ? <h2>Blocked Contacts</h2> : null}
                    {
                        blockList ? (blockList.map((blockedContact) => {
                            if (blockedContact) {
                                return (
                                    <div key={blockedContact._id} className="blocklist-inner-div">
                                        <div className="blocked-contact-info-outer-div">
                                            <img src={blockedContact?.dp ? blockedContact?.dp : defaultDP} alt="DP" className="blocked-contact-dp" onError={(e) => {
                                                e.target.src = defaultDP
                                            }} />
                                            <div className="blocked-contact-info-div">
                                                <div className="blocked-contact-info-inner-div">
                                                    <h3>{blockedContact.name} </h3>
                                                    <p> ~{blockedContact.username}</p>
                                                </div>
                                                <p className="blocked-contact-quote">{blockedContact?.quote ? blockedContact.quote : null}</p>
                                            </div>
                                        </div>
                                        <button className="settings-btns" onClick={() => handleUnblock(blockedContact)} >Unblock</button>
                                    </div>
                                )
                            }
                        })) : "no block list here"
                    }
                </div>
            </div>
        </div>
    )
}

export default Settings