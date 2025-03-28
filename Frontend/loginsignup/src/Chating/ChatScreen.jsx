// import { getAuth } from "firebase/auth"
import { io } from "socket.io-client"
import { auth, getToken, messaging, onAuthStateChanged } from "../Firebase"
import "../Styles/ChatScreen.css"
import ChatBox from "./ChatBox"
import Contacts from "./Contacts"
// import dp from "../assets/dp.jpg"
import Dashboard from "./Dashboard"
import { useState } from "react"
import { useEffect } from "react"
import ShowDpComponent from "./ShowDpComponent"
import Settings from "./Settings"
import Calls from "./Calls"
import Status from "./Status"
import LoginSignUp from "../Authentication/LoginSignup"

function ChatScreen() {
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [isSmartPhone, setIsSmartPhone] = useState(window.matchMedia("(max-width: 550px)").matches)
    const [username, setUsername] = useState()
    const [user, setUser] = useState()
    const [selectedContact, setSelectedContact] = useState()
    const [selectedGroup, setSelectedGroup] = useState()
    const [chatHistory, setChatHistory] = useState([])
    const [email, setEmail] = useState([])
    const [currentComponent, setCurrentComponent] = useState("contacts")
    const [contactList, setContactList] = useState()
    const [groupList, setGroupList] = useState()
    const [socket, setSocket] = useState()
    const [newMessage, setNewMessage] = useState()
    const [showDpComponentDetails, setShowDpComponentDetails] = useState(null)
    const [currentWindow, setCurrentWindow] = useState("home")


    useEffect(() => {
        // const auth = getAuth()
        const unsubscribe = onAuthStateChanged(auth, async (userDetails) => {
            // console.log("setting usrname")
            // console.log(userDetails)
            if (!userDetails) {
                setIsLoggedIn(false)
                return
            }

            setUsername(userDetails.email.split('@')[0])
            setEmail(userDetails.email)
            const idToken = await userDetails.getIdToken()

            try {
                var response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/protected-route`, {
                    method: 'GET',
                    headers: {
                        'authorization': `${idToken}`, // Include token in the Authorization header
                    },
                });
                // response = await response.json()
                if (response.status === 200) {
                    // setMessage("")
                    setIsLoggedIn(true)
                    // console.log("it is loged in")
                }
                else {
                    setIsLoggedIn(false)
                    // console.log("not loged in yet")
                    // setMessage(response.message)
                }

                const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/search-user`, {
                    method: 'POST',
                    headers: {
                        // 'authorization': `${idToken}`, // Include token in the Authorization header
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                        { username: userDetails.email.split('@')[0] }
                    )
                })
                if (result.status == 200) {
                    // console.log("setting contact list in search user")
                    const searchResult = await result.json()
                    // console.log(searchResult)

                    setUser({
                        name: searchResult.name,
                        username: searchResult.username,
                        email: userDetails.email,
                        dp: searchResult.dp,
                        quote: searchResult.quote,
                        idToken: idToken
                    })
                }
            } catch (error) {
                console.log("error occured while fetching user data")
                console.log(error)
            }

            // BROWSER NOTIFICATIONS--------------------------------------------
            await getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY }).then(async (currentToken) => {
                // console.log("getting notification token...")
                if (!idToken) {
                    // console.log("no id token there")
                    return
                }
                if (currentToken) {
                    await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/set-notification-token`, {
                        method: 'POST',
                        headers: {
                            'authorization': `${idToken}`, // Include token in the Authorization header
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(
                            { token: currentToken }
                        )
                    });

                    // Send the token to your server and update the UI if necessary
                    // ...
                }
                //  else {
                //     // Show permission request UI
                //     console.log('No registration token available. Request permission to generate one.');
                //     // ...
                // }
                return
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
                // ...
            });
            // BROWSER NOTIFICATIONS--------------------------------------------
        })

        if (!socket) {
            // console.log("connecting to socket...")
            setSocket(io(`${import.meta.env.VITE_BACKEND_URL}`))
        }

        const mediaQuery = window.matchMedia("(max-width: 550px)")
        const handleResize = () => setIsSmartPhone(mediaQuery.matches)
        mediaQuery.addEventListener('change', handleResize)

        return () => {
            mediaQuery.removeEventListener("change", handleResize);
            unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (currentComponent == 'contacts' && isSmartPhone) {
            setSelectedContact(null)
            setSelectedGroup(null)
        }
    }, [currentComponent])

    // useEffect(() => {
    //     console.log("user is---")
    //     console.log(user)
    // }, [user])

    useEffect(() => {
        if (!socket || !username) {
            // console.log(username)
            // console.log(socket)
            // console.log("there is no socket or username now")
            return
        }
        // console.log("socket is there")
        socket.emit('connection')
        // console.log(username)
        socket.emit('auth', username)
    }, [socket, username])


    // useEffect(() => {

    //     console.log("got username---------")
    //     console.log(username)
    //     console.log(socket?.id)
    //     console.log("got username---------")

    // }, [socket])

    // useEffect(() => {
    //     console.log(selectedContact)
    //     console.log(selectedGroup)
    // }, [selectedContact, selectedGroup])

    useEffect(() => {
        if (!socket || !user) {
            return
        }

        // socket.removeAllListeners('server to client')
        // if (newMessage) {
        //     handleLatestMessages(newMessage)
        // }


        socket.on('server to client', (message) => {
            handleLatestMessages(message)
            // console.log("In reciving ", Number(new Date()))
            if (message.sender == selectedContact?.username || message.sender == user.username) {
                // console.log("you are talking to ", selectedContact?.username)
                if (message.sender == selectedContact?.username) {
                    message.seen = true
                }
                setNewMessage(message)
            }
            // else {
            //     // HERE WE HANDLE THE MESSAGES COMMING FROM THE USER NOT IN CURRENT CONVERSATION
            //     console.log(`${message.sender} sent you a message: ${message.content}`)
            // }

            // props.handleLatestMessages(message)
            // console.log("data sent to chat screen")
        })

        return () => {
            // console.log("removing listener 1")
            socket.removeAllListeners('server to client')
        }
    }, [newMessage, socket, user, selectedContact, contactList])

    useEffect(() => {
        if (groupList && socket) {
            groupList.forEach(group => {
                socket.emit('join group chat', group.group_id)
            });

            // console.log("listening to group chat now....")
            socket.on('group chat', (message) => {
                handleLatestMessages(message)
                // console.log("you got message ", message.sender, ": ", message.content)
                if (selectedGroup && message.groupId == selectedGroup?.group_id) {
                    // setnewGroupMessage(message)
                    setNewMessage(message)
                    socket.emit('group last message seen', message.groupId)
                }
            })
        }

        return () => {
            // console.log("removing all group listeners...")
            // if (groupList && socket) {
            socket?.removeAllListeners("group chat")
            // }
        }
    }, [groupList, selectedGroup, newMessage])

    const handleChangeName = (newName) => {
        setUser({
            ...user,
            name: newName
        })
    }

    const handleChangeQuote = (newQuote) => {
        setUser({
            ...user,
            quote: newQuote
        })
    }

    const handleShowDpComponentDetails = (details) => {
        if (details?.isUserDp) {
            setUser({
                ...user,
                dp: details.dpUrl
            })
        }
        setShowDpComponentDetails(details)
    }

    const handleCurrentWindow = (newWindow) => {
        setCurrentWindow(newWindow)
        // console.log(newWindow)
    }

    const handleContactSelected = async (contact) => {
        setSelectedGroup(null)
        setSelectedContact(contact)
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/chat-history`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                { sender: contact.username, reciever: username }
            )
        })
        setCurrentComponent("chat area")
        // const x = await result.json()
        // setChatHistory(x)
        setChatHistory(await result.json())
        // console.log(x)
    }

    const handleGroupSelected = async (group) => {
        setSelectedContact(null)
        setSelectedGroup(group)
        await socket.emit('group last message seen', group.group_id)
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/get-group-chats`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                { groupId: group.group_id }
            )
        })
        setCurrentComponent("chat area")
        setChatHistory(await result.json())
    }

    const handleContactList = (contactList) => {
        setContactList(contactList)
    }
    const handleGroupList = (groupList) => {
        setGroupList(groupList)
    }
    const logoutCurrentUser = () => {
        setIsLoggedIn(false)
    }


    // useEffect(() => {
    //     console.log("contact list changed---------")
    //     console.log(contactList)
    //     console.log("contact list changed---------")
    // }, [contactList])

    const handleLatestMessages = async (message) => {

        if (message.groupId) {
            // console.log("groupList in handle latest message")
            // console.log(message)
            // console.log(contactList)

            var seen = false
            if (message?.groupId == selectedGroup?.group_id) {
                seen = true
            }
            const newGroupList = groupList.map((group) => {
                if (message.groupId == group?.group_id) {
                    return {
                        ...group,
                        last_message: message.content,
                        last_message_time: message.time,
                        last_message_sender: message.sender,
                        last_message_seen: seen,
                    }
                }
                // console.log(group)
                return group
            })
            // console.log("new contactList in handle latest message")
            // console.log(newGroupList)
            setGroupList(newGroupList)
        }
        else {
            // console.log("contactList in handle latest message")
            // console.log(contactList)
            const newContactList = contactList.map((contact) => {
                const seen = selectedContact?.username == contact.username ? true : false
                if (contact.username == message.sender || contact.username == message.reciever) {
                    return {
                        ...contact,
                        last_message: message.content,
                        last_message_time: message.time,
                        last_message_sender: message.sender,
                        last_message_seen: seen,
                    }
                }
                // console.log(contact)
                return contact
            })
            // console.log("new contactList in handle latest message")
            // console.log(newContactList)
            setContactList(newContactList)
        }
    }

    const handleBackToContacts = () => {
        setCurrentWindow("home")
        setCurrentComponent("contacts")
    }

    if (!isLoggedIn) {
        return (
            <LoginSignUp />
        )
    }

    if (isSmartPhone) {
        // console.log("smaller")
        if (currentComponent === "contacts") {
            return (
                <div id="chat-screen">
                    {
                        showDpComponentDetails ? <ShowDpComponent
                            componentDetails={showDpComponentDetails}
                            changeShowDpComponentDetails={handleShowDpComponentDetails}
                        /> : null
                    }
                    <Dashboard
                        changeShowDpComponentDetails={handleShowDpComponentDetails}
                        user={user}
                        changeCurrentWindow={handleCurrentWindow}
                    />
                    {
                        currentWindow == "settings" ? (
                            < Settings
                                user={user}
                                changeShowDpComponentDetails={handleShowDpComponentDetails}
                                changeName={handleChangeName}
                                handleBackToContacts={handleBackToContacts}
                                changeQuote={handleChangeQuote}
                                handleUserLogout={logoutCurrentUser}
                            />
                        ) : null
                    }

                    {
                        currentWindow == "calls" ? (<Calls />) : null
                    }
                    {
                        currentWindow == "status" ? <Status /> : null
                    }

                    {
                        currentWindow == "home" ? (
                            user ? (
                                <Contacts
                                    setContactList={handleContactList}
                                    setGroupList={handleGroupList}
                                    selectGroup={handleGroupSelected}
                                    selectContact={handleContactSelected}
                                    email={email}
                                    user={user}
                                    updatedContactList={contactList}
                                    updatedGroupList={groupList}
                                    changeShowDpComponentDetails={handleShowDpComponentDetails}
                                />
                            ) : (
                                <div id="contacts" className="chat-sub-screen">
                                    <div className="sub-contact-div" id="group-contacts-div" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}></div>
                                    <div className="sub-contact-div" id="individual-contacts-div" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}>Getting your contacts ready...</div>
                                </div>
                            )
                        ) : null
                    }
                </div >
            )
        }
        else if (currentWindow === "home" && currentComponent === "chat area") {
            return (
                <div id="chat-screen">
                    {
                        (selectedContact || selectedGroup) ? (
                            <ChatBox
                                contactList={contactList}
                                handleBackToContacts={handleBackToContacts}
                                groupDetails={selectedGroup}
                                chats={chatHistory}
                                contactDetails={selectedContact}
                                user={user}
                                username={username}
                                email={email}
                                handleLatestMessages={handleLatestMessages}
                                socket={socket}
                                newMessage={newMessage}
                            />
                        ) : (
                            <div id="chat-box" className="chat-sub-screen" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}>Select contact to start chat...</div>
                        )
                    }
                </div>
            )
        }
    }
    else {
        return (
            <div id="chat-screen">
                {
                    showDpComponentDetails ? <ShowDpComponent
                        componentDetails={showDpComponentDetails}
                        changeShowDpComponentDetails={handleShowDpComponentDetails}
                    /> : null
                }
                <Dashboard
                    changeShowDpComponentDetails={handleShowDpComponentDetails}
                    user={user}
                    changeCurrentWindow={handleCurrentWindow}
                />
                {
                    currentWindow == "home" ? (
                        // {
                        user ? (
                            <Contacts
                                setContactList={handleContactList}
                                setGroupList={handleGroupList}
                                selectGroup={handleGroupSelected}
                                selectContact={handleContactSelected}
                                email={email}
                                user={user}
                                updatedContactList={contactList}
                                updatedGroupList={groupList}
                                changeShowDpComponentDetails={handleShowDpComponentDetails}
                            />
                        ) : (
                            <div id="contacts" className="chat-sub-screen">
                                <div className="sub-contact-div" id="group-contacts-div" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}></div>
                                <div className="sub-contact-div" id="individual-contacts-div" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}>Getting your contacts ready...</div>
                            </div>
                        )
                        // }
                    ) : null
                }
                {
                    currentWindow == "home" ? (
                        // {
                        (selectedContact || selectedGroup) ? (
                            <ChatBox
                                contactList={contactList}
                                chats={chatHistory}
                                groupDetails={selectedGroup}
                                contactDetails={selectedContact}
                                user={user}
                                username={username}
                                email={email}
                                handleLatestMessages={handleLatestMessages}
                                socket={socket}
                                newMessage={newMessage}
                            />
                        ) : (
                            <div id="chat-box" className="chat-sub-screen" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "gray" }}>Select contact to start chat...</div>
                        )
                        // }
                    ) : null
                }
                {
                    currentWindow == "settings" ? (
                        <Settings
                            user={user}
                            changeShowDpComponentDetails={handleShowDpComponentDetails}
                            changeName={handleChangeName}
                            changeQuote={handleChangeQuote}
                            handleUserLogout={logoutCurrentUser}
                        />
                    ) : null
                }

                {
                    currentWindow == "calls" ? <Calls /> : null
                }

                {
                    currentWindow == "status" ? <Status /> : null
                }

            </div>
        )
    }
}

export default ChatScreen
// https://www.figma.com/design/oa4BgJWI2TnHcAHYTJifmM/Direct-messaging-app-(Community)?node-id=0-1&p=f&t=yJ2b7JBD9djvvyAQ-0