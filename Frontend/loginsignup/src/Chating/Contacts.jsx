import "../Styles/ChatScreen.css"
import dp from "../assets/dp.png"
import searchIcon from '../assets/search.svg'
import { useState, useEffect } from "react"

const Contacts = ({ setContactList, setGroupList, selectGroup, selectContact, email, user, updatedContactList, updatedGroupList, changeShowDpComponentDetails }) => {
    const [groups, setGroups] = useState([])
    const [contacts, setContacts] = useState([])
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)
    const [currentContact, setCurrentContact] = useState()
    const [currentGroup, setCurrentGroup] = useState()
    const [searchBarValue, setSearchBarValue] = useState('')

    // const [username, setUsername] = useState()
    // const [friendList, setFriendList] = useState([])
    useEffect(() => {

        // console.log("contact is created")
        // console.log(user)
        // console.log(email)
        // setUsername("ajaysharma.hawkscode")
        getContactList()
        getGroupList()

        // return () => {
        //     setContactList(contacts)
        // }

    }, [])

    useEffect(() => {
        if (currentContact) {
            handleLastMessageSeen(currentContact)
            // console.log("-----currnent contact use effect------")
            // console.log(currentContact)
            // console.log("-----currnent contact use effect------")
        }
    }, [currentContact])

    useEffect(() => {
        if (currentGroup) {
            handleLastGroupMessageSeen(currentGroup)
            // console.log("-----currnent group use effect------")
            // console.log(currentGroup)
            // console.log("-----currnent group use effect------")
        }
    }, [currentGroup])


    // useEffect(() => {
    //     if (user && currentContact) {
    //         console.log(user.username)
    //         console.log(currentContact.username)
    //         lastMessageSeen(user?.username, currentContact?.username)
    //     }

    //     return () => {
    //         if (user && currentContact) {
    //             console.log("return called")
    //             lastMessageSeen(user?.username, currentContact?.username)
    //         }
    //     }
    // }, [currentContact])

    // useEffect(() => {
    //     console.log("contacts changed >use effect<")
    // }, [contacts])

    useEffect(() => {
        if (!updatedContactList) {
            // console.log("nothing in contact list !")
        }
        else if (updatedContactList == contacts) {
            // console.log("both are equal")
        }
        else {
            setContacts(updatedContactList)
        }
    }, [updatedContactList])

    useEffect(() => {
        if (!updatedGroupList) {
            // console.log("nothing in contact list !")
        }
        else if (updatedGroupList == groups) {
            // console.log("both are equal")
        }
        else {

            // console.log("groupList---------------")
            // console.log(updatedGroupList)
            setGroups(updatedGroupList)
        }
    }, [updatedGroupList])

    const handleLastMessageSeen = async (updatedContact) => {
        const newContactList = contacts.map((contact) => {
            if (contact.username == updatedContact.username) {
                return {
                    ...contact,
                    last_message_seen: true,
                }
            }
            return contact
        })
        // console.log("setting contact list in HLMS in contacts and newcontact list ---<><><><><><>")
        // console.log(newContactList)
        // console.log('updated contact--')
        // console.log(updatedContact)
        // console.log('contacts--')
        // console.log(contacts)
        // console.log("setting contact list in HLMS in contacts and newcontact list ---<><><><><><>")
        setContactList(newContactList)
        setContacts(newContactList)
    }

    const handleLastGroupMessageSeen = async (updatedGroup) => {
        const newGroupList = groups.map((group) => {
            if (group.group_id == updatedGroup.group_id) {
                return {
                    ...group,
                    last_message_seen: true,
                }
            }
            return group
        })
        // console.log("setting contact list in HLMS in contacts and newcontact list ---<><><><><><>")
        // console.log(newContactList)
        // console.log('updated contact--')
        // console.log(updatedContact)
        // console.log('contacts--')
        // console.log(contacts)
        // console.log("setting contact list in HLMS in contacts and newcontact list ---<><><><><><>")
        // below two should be changed
        setGroupList(newGroupList)
        setGroups(newGroupList)
    }

    const getGroupList = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/get-group-list`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                { email: user.email }
            )
        }).then((res) => res.json()).then((groupList) => {
            // console.log("your group list", groupList)
            setGroups(groupList)
            setGroupList(groupList)
        })
    }
    const getContactList = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/contact-list`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                { email }
            )
        }).then((res) => res.json()).then((contactList) => {
            // console.log("contact list fetched")
            // console.log("get contact list api and newcontact list ---")
            // console.log(contactList)
            setContacts(contactList)
            setContactList(contactList)

        })
    }

    const searchUser = async (username) => {
        if (!username) {
            return
        }
        // console.log(username)
        try {
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/search-user`, {
                method: 'POST',
                headers: {
                    // 'authorization': `${idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    { username }
                )
            })
            if (result.status == 200) {
                // console.log("setting contact list in search user")
                const searchResult = await result.json()
                // console.log(searchResult)
                setContacts([searchResult])
                // console.log(searchResult)
            }
        } catch (error) {
            console.log("error occured while fetching searched user")
            console.log(error)
        }
    }

    const createNewGroup = async (groupName) => {
        if (!groupName) {
            return
        }
        const admin = {
            name: user.name,
            username: user.username
        }
        const members = []
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/create-group`, {
                method: 'POST',
                headers: {
                    // 'authorization': `${idToken}`, // Include token in the Authorization header
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    { admin, members, groupName }
                )
            })
            // if (result.status !== 200) {
            //     console.log(result.message)
            // }
            getGroupList()
        } catch (error) {
            console.log(error)
        }
    }


    const GroupCreateWindow = () => {
        const [isGroupCreated, setIsGroupCreated] = useState(false)
        const TextInputStyle = {
            padding: "3px",
            margin: "0px",
            outline: "none",
            width: "80%",
            backgroundColor: "#eff6fc",
            borderRadius: "5px",
            border: "0px",
            paddingLeft: "5px",
        }
        if (isGroupCreated) {
            setIsCreatingGroup(false)
            return
        }
        else {
            return (
                <div id="group-create-window" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <input type="text" style={TextInputStyle} placeholder="Group name..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                createNewGroup(e.target.value)
                                e.target.value = ''
                                setIsGroupCreated(true)
                            }
                        }} />
                </div>
            )
        }
    }

    return (
        <div id="contacts" className="chat-sub-screen">
            <div id="search-bar">
                <input id="search-bar-input" type="search" placeholder="  Search..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            searchUser(e.target.value)
                            // e.target.value = ""
                        }
                    }}
                    onChange={(e) => {
                        setSearchBarValue(e.target.value)
                        if (e.target.value === '') {
                            getContactList()
                        }
                    }}
                />
                <img id="search-icon-btn" src={searchIcon} alt="search" onClick={() => searchUser(searchBarValue)} />
            </div>

            {
                groups.length !== 0 ? (
                    <div className="sub-contact-div" id="group-contacts-div">
                        <h3 className="sub-contact-div-heading">Groups</h3>
                        <div id="group-outer-container">
                            {
                                groups.length === 0 ? (
                                    <div>
                                        <p> no groups yet... </p>
                                    </div>
                                ) : null
                            }
                            {
                                groups.map((group) => {
                                    return (
                                        <div key={group.group_id}>
                                            <div className="group-container" onClick={() => {
                                                selectGroup(group)
                                                setCurrentGroup(group)
                                            }}>
                                                <div className="group-dp-div">
                                                    <img src={dp} alt="no dp" />
                                                </div>
                                                <div className="group-container-mid">
                                                    <h3>{group.group_name}</h3>
                                                    {
                                                        group.last_message ? (
                                                            <p>
                                                                {group.last_message_sender == user.username ? `You: ${group.last_message}` : `${group.last_message_sender}: ${group.last_message}`}
                                                            </p>
                                                        ) : ''
                                                    }
                                                </div>
                                                <div className="unseen-messages">
                                                    <p className="last-msg-time">{group.last_message_time?.slice(0, 15) == new Date().toString().slice(0, 15) ? group.last_message_time?.slice(16, 21) : group.last_message_time?.slice(4, 15)}</p>
                                                    {
                                                        !group.last_message_seen ? (
                                                            <p className="total-unread-msg"></p>
                                                        ) : ''
                                                    }
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                ) : ''
            }

            <div className="sub-contact-div" id="individual-contacts-div" style={groups.length == 0 ? { height: '90%' } : {}}>
                <div id="create-group-div">
                    <h3 className="sub-contact-div-heading">People</h3>
                    {isCreatingGroup ? <GroupCreateWindow /> : <button className="btns" onClick={() => setIsCreatingGroup(true)}>Create Group</button>}
                </div>
                <div id="contact-outer-container">
                    {
                        contacts.map((contact) => {
                            return (
                                <div key={contact.username}>
                                    <div className="group-container" >
                                        <div className="group-dp-div">
                                            <img src={contact.dp ? contact.dp : dp} alt="no dp" onClick={() => changeShowDpComponentDetails({
                                                username: contact.username,
                                                dpUrl: contact.dp ? contact.dp : dp,
                                                isUserDp: false,
                                            })} />
                                        </div>
                                        <div className="group-container-mid" onClick={() => {
                                            selectContact(contact)
                                            setCurrentContact(contact)
                                        }}>
                                            <h3>{contact.name}</h3>
                                            {
                                                contact.last_message ? (
                                                    <p>{contact.last_message_sender == user?.username ? `You: ${contact.last_message}` : `${contact.last_message_sender}: ${contact.last_message}`}</p>
                                                ) : (
                                                    <p>{contact.quote ? contact.quote : ''}</p>
                                                )
                                            }
                                        </div>
                                        <div className="unseen-messages" onClick={() => {
                                            selectContact(contact)
                                            setCurrentContact(contact)
                                        }}>
                                            <p className="last-msg-time">{contact.last_message_time?.slice(0, 15) == new Date().toString().slice(0, 15) ? contact.last_message_time?.slice(16, 21) : contact.last_message_time?.slice(4, 15)}</p>
                                            {
                                                !contact.last_message_seen && contact.last_message_seen != undefined && contact.last_message_sender != user.username ? <p className="total-unread-msg"></p> : ''
                                            }
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}
export default Contacts