import { useEffect, useRef, useState } from "react"
// import { io } from "socket.io-client"
import "../Styles/ChatScreen.css"
import dp from "../assets/dp.png"
import callIcon from "../assets/call.png"
import videoCallIcon from "../assets/video call.png"
import optionsIcon from "../assets/options.png"
import camera from "../assets/camera.png"
import attachmentIcon from "../assets/attachment.png"
import micIcon from "../assets/mic.png"
import backIcon from "../assets/back.png"
import closeIcon from "../assets/close.png"
import downloadIcon from "../assets/download.png"

function ChatBox(props) {
    const inputFileRef = useRef()
    const [file, setFile] = useState(null)
    const optionRef = useRef()
    const chatAreaRef = useRef()
    const [online, setOnline] = useState(false)
    const [username, setUsername] = useState(props.username)
    const [socket, setSocket] = useState()
    const [messages, setMessages] = useState([])
    const [isPrivateChat, setIsprivateChat] = useState(props.contactDetails != null)
    const [isAddingGroupMember, setIsAddingGroupMember] = useState(false)
    const [blockList, setBlockList] = useState([])
    const [isBlocked, setIsBlocked] = useState(false)

    // const tempGroup = {
    //     name: "Group1",
    //     dp: dp,
    //     lastMessage: "hello, are you there ?",
    //     unseenMessages: 5,
    //     lastMessageTime: "Today 5:36 pm"
    // }

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
            // console.log("your block list")
            // console.log(res1)
            // console.log("your block list")
            setBlockList(res1)
        })
    }, [isBlocked])

    useEffect(() => {
        // REMOVING ALL LISTENERS

        // console.log(props)
        // console.log("contact details changed in props")
        // console.log(props.chats)

        if (!socket) {
            setSocket(props.socket)
        }

        setMessages(props.chats)
        setUsername(props.username)
        // console.log(props)

        if (isPrivateChat && props.contactDetails && socket) {
            socket.emit('online status', props.contactDetails.username)
            socket.on(`${props.contactDetails?.username} online status`, (online_status) => {
                setOnline(online_status)
            })

        }
        setIsprivateChat(props.contactDetails != null)

        // migrated
        // if (!isPrivateChat && props.groupDetails && socket) {
        //     console.log("joined group")
        //     socket.emit('join group chat', props.groupDetails.group_id)
        // }

        if (blockList.some((user) => user?.username == props.contactDetails?.username)) {
            setIsBlocked(true)
        }
        else {
            setIsBlocked(false)
        }


        return () => {
            if (socket) {
                // console.log("removing event listeners...")
                // socket.removeAllListeners("server to client")
                // socket.removeAllListeners("group chat")
                // socket.removeAllListeners("message seen")
                socket.removeAllListeners(`${props.contactDetails?.username} online status`)
                // console.log("all listeners removed")
            }
        }

        // THE LINE BELOW MAY CAUSE ANY BUGS IN THE APPLICATION
    }, [props.contactDetails, props.groupDetails, props.chats, props.socket]) // added socket in props


    // migrating
    // useEffect(() => {
    //     // console.log("type of chat ==>> ", isPrivateChat)
    //     if (socket) {
    //         // console.log("socket already exist!")
    //         return
    //     }
    //     setSocket(io(`${import.meta.env.VITE_BACKEND_URL}`))
    // }, [])

    useEffect(() => {
        if (!socket) {
            // console.log("there is no socket now")
            return
        }

        // migrating
        // socket.emit('connection')
        // console.log(username)
        // socket.emit('auth', username)



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
            // console.log("your block list")
            // console.log(res1)
            // console.log("your block list")
            setBlockList(res1)
        })
    }, [socket])

    useEffect(() => {
        // console.log(messages)
        // console.log("listeners activated again")
        // console.log("check1")
        if (!socket) {
            return
        }
        if (isPrivateChat) {
            if (messages[messages.length - 1]?.sender == props.contactDetails.username) {
                // THIS BELOW LINE OF CODE IS FOR UPDATING THE SERVER THAT I SEEN THE MESSAGE
                socket.emit('message seen', { sender: props.contactDetails.username, reciever: props.user.username })
                // console.log(`sender: ${props.contactDetails.username} reciever: ${props.user.username}`)
            }


            //migrated
            // socket.on('server to client', (message) => {
            //     if (message.sender == props.contactDetails.username || message.sender == props.user.username) {
            //         console.log("you are talking to ", props.contactDetails.username)
            //         if (message.sender == props.contactDetails.username) {
            //             message.seen = true
            //             // console.log("setting message.seen = true")
            //         }
            //         // console.log(message)
            //         setMessages([...messages, message])
            //         // console.log("setting messages from socket server to client event")
            //         // console.log(message)
            //     }
            //     else {
            //         // HERE WE HANDLE THE MESSAGES COMMING FROM THE USER NOT IN CURRENT CONVERSATION
            //         console.log(`${message.sender} sent you a message.`)
            //     }

            //     props.handleLatestMessages(message)
            //     console.log("data sent to chat screen")
            // })




            // if (messages[messages.length - 1]?.seen == false) {
            //     socket.emit('message seen', { sender: props.contactDetails.username, reciever: props.user.username })
            // }
            socket.on('message seen', (status) => {

                // setAllMessagesSeen(status)

                if (status && messages[messages.length - 1]?.seen == false) {
                    // var updatedMessages = []
                    // messages.map((message) => {
                    //     if (!message.seen && message.sender == props.user.username && message.reciever == props.contactDetails.username) {
                    //         message.seen = true
                    //     }
                    //     updatedMessages.push(message)
                    // })

                    const updatedMessages = messages.map((message) => {
                        if (!message.seen && message.sender == props.user.username && message.reciever == props.contactDetails.username) {
                            return {
                                ...message,
                                seen: true,
                            }
                        }
                        return message
                    })
                    setMessages(updatedMessages)
                    // console.log("setting messages from messages seen event")
                    // console.log("all messages updated.")
                }
            })

            // console.log(`sender: ${props.contactDetails.username, reciever}`)

        }
        else {
            // migrated
            // socket.on('group chat', (message) => {
            //     console.log("setting messages from group chats")
            //     setMessages([...messages, message])
            // })

            // following code was replaced with above migrated code

        }
        chatAreaRef.current.scrollTo({
            top: chatAreaRef.current.scrollHeight,
            behavior: "smooth"
        })

        return () => {
            // console.log("all message seen listeners closed!")
            socket.removeAllListeners('message seen')
            // socket.removeAllListeners('server to client')
        }
    }, [messages])


    useEffect(() => {
        if (!props.newMessage) {
            return
        }
        // console.log(props.newMessage)

        setMessages([...messages, props.newMessage])
    }, [props.newMessage])

    const handleAddContact = async () => {
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/add-contact`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    email: props.email,
                    contact: {
                        username: props.contactDetails.username,
                        name: props.contactDetails.name,
                        dp: props.contactDetails.dp,
                        quote: props.contactDetails.quote
                    }
                }
            )
        })
        const msg = await result.json()
        alert(msg.message)
    }

    const handleRemoveContact = async () => {
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/remove-contact`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    email: props.email,
                    contact: {
                        username: props.contactDetails.username,
                        name: props.contactDetails.name
                    }
                }
            )
        })
        const msg = await result.json()
        alert(msg.message)
    }

    const handleSendMessage = async (text) => {
        // console.log("In sending: ", Number(new Date()))
        if (!socket || (!text && !file)) {
            return
        }
        try {
            if (!text) {
                text = file.name
            }
            if (isPrivateChat) {
                // console.log(props.contactDetails)
                const message = {
                    sender: username,
                    reciever: props.contactDetails.username,
                    content: text,
                    sender_dp: props.user.dp
                }
                if (file) {
                    const uploaded_file_details = await handleFileSend()
                    message.attachment = uploaded_file_details
                }
                socket.emit('client to server', message)
            }
            else {
                const message = {
                    groupId: props.groupDetails.group_id,
                    sender: props.user.username,
                    content: text
                }
                if (file) {
                    const uploaded_file_details = await handleFileSend()
                    message.attachment = uploaded_file_details
                }
                socket.emit('group chat', message)
            }
            // setMessages([...messages, message])
        } catch (error) {
            console.log(error)
        }
    }

    const handleBlockUser = async (unBlock) => {
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/block-user`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    username: props.user.username,
                    blockedUser: {
                        username: props.contactDetails.username,
                        name: props.contactDetails.name,
                        dp: props.contactDetails.dp,
                        quote: props.contactDetails.quote
                    },
                    unBlock: unBlock
                }
            )
        })
        if (result.status == 200) {
            setIsBlocked(!unBlock)
        }
        const msg = await result.json()
        alert(msg.message)
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
        // console.log("file is changed")
    }

    const handleFileSend = async () => {
        if (file) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('username', props.user.username)
            formData.append('fileName', file.name)
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cloud/upload`, {
                method: 'POST',
                body: formData
            })
            const uploadedFileDetails = await result.json()
            // console.log(uploadedFileDetails)
            setFile(null)
            return uploadedFileDetails
        }
        setFile(null)
    }

    const handleAttachmentIconClicked = () => {
        file ? setFile(null) : inputFileRef.current.click()
    }

    const handleLeaveGroup = async () => {
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/leave-group`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    username: props.user.username,
                    groupId: props.groupDetails.group_id
                }
            )
        })
        const msg = await result.json()
        alert(msg.message)
    }

    const AddMemberToGroup = () => {
        // console.log(props)
        const [selectedMembers, setSelectedMembers] = useState([])
        const toggle = (e) => {
            // e.stopPropagation()
            const selectedColor = "rgba(110, 0, 255, 0.24)"
            const notSelectedColor = "rgba(255, 255, 255, 1)"

            if (e.currentTarget.style.getPropertyValue("background-color") !== selectedColor) {
                // console.log(selectedColor)
                // console.log(e.currentTarget.style.getPropertyValue("background-color"))
                e.currentTarget.style.setProperty("background-color", selectedColor)
                // console.log("selected")
            }
            else {
                // console.log("disssselected")
                e.currentTarget.style.setProperty("background-color", notSelectedColor)
            }
        }
        const selected = (e, contact) => {
            toggle(e)
            if (selectedMembers.includes(contact)) {
                const newSelectedMembers = selectedMembers.filter(member => member !== contact)
                setSelectedMembers(newSelectedMembers)
            }
            else {
                setSelectedMembers([...selectedMembers, contact])
            }
            // console.log(selectedMembers)
        }

        const addMembers = async () => {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/add-members`, {
                method: 'POST',
                headers: {
                    // 'authorization': `${idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    { members: selectedMembers, group: { name: props.groupDetails.group_name, _id: props.groupDetails.group_id } }
                )
            })
            const response = await result.json()

            alert(response.message)
            setIsAddingGroupMember(false)
        }
        return (
            <div id="add-members-outer-div">
                <div id="add-members-close-div">
                    <p id="close-add-members" onClick={() => setIsAddingGroupMember(false)}>x</p>
                </div>
                < div id="add-members-div" >
                    {
                        props.contactList?.map((contact) => {
                            return (
                                <>
                                    <div onClick={(e) => selected(e, contact)} className="group-container">
                                        <div className="group-dp-div">
                                            <img src={dp} alt="no dp" />
                                        </div>
                                        <div className="group-container-mid">
                                            <h3>{contact.name}</h3>
                                        </div>
                                    </div>
                                    <hr />
                                </>
                            )
                        })
                    }
                </div >
                <button className="btns" style={{ margin: "10px", padding: "6px 0px" }} onClick={() => addMembers()}>Add</button>
            </div>
        )
    }


    const ShowFilePreview = ({ fileDetails }) => {
        // console.log("inside show file preview")
        // console.log(fileDetails)
        // console.log("inside show file preview")

        if (fileDetails.file_type == ".jpg" || fileDetails.file_type == ".jpeg" || fileDetails.file_type == ".png" || fileDetails.file_type == ".svg") {
            return <img className="file-preview-window" src={fileDetails.dbx_url} alt="" />
        }
        else if (fileDetails.file_type == ".mp3" || fileDetails.file_type == ".wav") {
            return <audio controls className="file-preview-window" src={fileDetails.dbx_url}></audio>
        }
        else if (fileDetails.file_type == ".mp4") {
            return <video controls className="file-preview-window" src={fileDetails.dbx_url}></video>
        }
        // else if (fileDetails.file_type == ".pdf") {
        //     return <iframe className="file-preview-window" src={fileDetails.dbx_url} title="PDF Preview" frameborder="0"></iframe>
        // }
        else {
            return <div className="file-preview-window" style={{ border: "1px solid white", fontFamily: "cursive", fontSize: "10px", width: "auto", maxWidth: "210px" }}>File: {fileDetails.file_name}</div>
        }
    }


    return (
        <div id="chat-box" className="chat-sub-screen">
            {isAddingGroupMember ? (<AddMemberToGroup />) : ''}
            <div id="contact-detail-bar">
                <div id="friend-profile-options">

                    <div >
                        <img id="contact-back-img" src={backIcon} alt="no dp" onClick={() => props.handleBackToContacts()} />
                    </div>

                    <div id="contact-detail-dp-div">
                        <img src={props.contactDetails?.dp ? props.contactDetails?.dp : dp} alt="no dp" />
                    </div>
                    <div id="sub-contact-detail-div">
                        <h2>{props.contactDetails ? props.contactDetails.name : props.groupDetails?.group_name}</h2>
                        <p>{online ? 'Online' : 'Offline'}</p>
                    </div>
                </div>
                <div id="other-options">
                    <div className="sub-other-options">
                        <img className="other-options-images" src={callIcon} alt="call" />
                    </div>
                    <div className="sub-other-options">
                        <img className="other-options-images" src={videoCallIcon} alt="video call" />
                    </div>
                    <div className="sub-other-options" id="contact-options-outer-div">
                        <img className="other-options-images" id="contact-options-icon" src={optionsIcon} alt="options" />

                        {/* {console.log(isPrivateChat)} */}
                        {
                            isPrivateChat ? (
                                <div ref={optionRef} id="contact-options">
                                    <div className="inner-contact-option-div" onClick={handleAddContact}>
                                        <p>Add To Contacts</p>
                                        <hr />
                                    </div>
                                    {/* <div className="inner-contact-option-div" >
                                        <p>Add To Groups</p>
                                        <hr />
                                    </div> */}
                                    <div className="inner-contact-option-div" onClick={handleRemoveContact}>
                                        <p>Remove From Contacts</p>
                                        <hr />
                                    </div>
                                    {
                                        isBlocked ? (
                                            <div className="inner-contact-option-div" onClick={() => handleBlockUser(true)}>
                                                <p>Unblock</p>
                                                <hr />
                                            </div>
                                        ) : (
                                            <div className="inner-contact-option-div" onClick={() => handleBlockUser(false)}>
                                                <p>Block</p>
                                                <hr />
                                            </div>
                                        )
                                    }
                                    <div className="inner-contact-option-div">
                                        <p>Report</p>
                                        <hr />
                                    </div>
                                </div>
                            ) : (
                                <div ref={optionRef} id="contact-options">

                                    <div id="add-members-option" className="inner-contact-option-div" onClick={() => setIsAddingGroupMember(true)}>
                                        <p>Add Members</p>
                                        <hr />
                                    </div>
                                    <div className="inner-contact-option-div" onClick={() => handleLeaveGroup()}>
                                        <p>Leave</p>
                                        <hr />
                                    </div>
                                    <div className="inner-contact-option-div">
                                        <p>Block</p>
                                        <hr />
                                    </div>
                                    <div className="inner-contact-option-div">
                                        <p>Report</p>
                                        <hr />
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <hr />
            <div id="chat-area" ref={chatAreaRef}>
                {
                    messages?.map((message, idx) => {
                        return (
                            <div key={message._id}>
                                {
                                    (idx == 0 || message.time?.slice(4, 15) !== messages[idx - 1].time?.slice(4, 15)) ? <div className="msg-date-outer-div"><hr className="msg-date-hr" /> <p className="msg-date">{message.time?.slice(4, 15)}</p> <hr className="msg-date-hr" /></div> : ''
                                }
                                <div className={message.sender == username ? `outgoing-msg-outer-shell` : `incoming-msg-outer-shell`} style={isPrivateChat && message.sender !== props.user.username && !message.seen ? { backgroundColor: "#e7e7e785" } : {}}>
                                    <div className="msg-shell">
                                        {
                                            isPrivateChat ? '' : <p className="sender-name">{message.sender}</p>
                                        }
                                        {
                                            message.attachment ? (
                                                <div id="file-dnld-outer-div">
                                                    {
                                                        <a href={message.attachment.dbx_url?.slice(0, -7) + "1"}>
                                                            <img id="file-dnld-btn" src={downloadIcon} alt="download" />
                                                        </a>
                                                    }
                                                    {
                                                        <ShowFilePreview fileDetails={message.attachment} />
                                                    }
                                                </div>
                                            ) : ('')
                                        }
                                        <div className="message-div">{message.content}</div>
                                        <p className="message-time">{message.time?.slice(16, 21)} {isPrivateChat && message.seen && message.sender == props.user.username ? (<>&#10003;</>) : ''}</p>
                                        {/* <p className="message-time">{message.time.slice(4, 21)}</p> */}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div id="typing-area">
                <div id="typing-bar-options">
                    <input type="file" ref={inputFileRef} onChange={handleFileChange} style={{ display: 'none' }} />
                    {/* <button onClick={handleFileSend}>sendFile</button> */}
                    <img src={file ? closeIcon : attachmentIcon} alt="" id="file-input-img" className="type-bar-buttons" onClick={handleAttachmentIconClicked} />
                    <input type="text" placeholder="Write a message..." onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage(e.target.value)
                            e.target.value = ''
                        }
                    }} />
                    <img src={camera} alt="" id="camera-img" className="type-bar-buttons" />
                </div>
                <img src={micIcon} alt="no image" id="mic-image" className="type-bar-buttons" />
            </div>
        </div>
    )
}
export default ChatBox

// End to end message encryption
// VOICE MESSAGE
// VOICE CALL ---
// VIDEO CALL ---


// -------------------- DONE ----------------------------------
// ADD REMOVE CONTACT FEATURE
// SEARCH ISSUE (ALL USERS ARE NOT SHOWN WHEN SEARCHED A SINGLE USER)
// LOADING ISSUE (starting chats)
// RESPONSIVENESS
// MANAGE AND CREATE GROUPS
// BLOCK USER
// SENDING FILES
// ONLINE STATUS
// UNREAD MESSAGES / seen-unseen messages
// LAST MESSAGE AND ITS TIME
// NOTIFICATIONS
// CHANGE DP