// import _ from "lodash"
import Group from "../Schema/GroupSchema.js"
import Message from "../Schema/Messages.js"
import User from "../Schema/UserSchema.js"
import { notifyUser } from "../Controllers/CommunicationControllers.js"
// import { writeFile } from "fs";
// import { UploadToDropBox } from "../Controllers/CloudStorageControllers.js";

const current_users = []


export const ListenToConnection = (io) => {
    // console.log("listening...")
    io.on('connection', (socket) => {
        // console.log("Connection established with socketId : " + socket.id)
        GetUsername(socket)
        ListenIncomingMessages(socket)
        isUserOnline(socket)
        ListenToMessageSeen(socket)
        ListenToGroupChats(socket, io)
        ListenGroupLastMessageSeen(socket)

        socket.on('disconnect', () => {
            // console.log("user disconnected")
            socket.broadcast.emit(`${socket.customData?.username} online status`, false)

            current_users.some((user, index) => {
                if (user.socket.id == socket.id) {
                    current_users.splice(index, 1)
                }
            })
            // console.log("Disconnected socketId : " + socket.id)
            // console.log("current users : ")
            // showElements(current_users)
        })
    })
}

const ListenGroupLastMessageSeen = async (socket) => {
    await socket.removeAllListeners("group last message seen")

    if (socket.listeners('group last message seen').length < 1) {
        socket.on('group last message seen', async (groupId) => {
            try {
                // console.log("updating last group message seen in sockets ...")
                await User.updateOne(
                    {
                        username: socket.customData.username,
                        "user_details.groups.group_id": groupId,
                    },
                    {
                        $set: {
                            "user_details.groups.$.last_message_seen": true,
                        }
                    }
                )
                // console.log(result)
            } catch (error) {
                console.log("error in updating last message seen")
                console.log(error)
            }
        })
    }
}

const ListenToGroupChats = async (socket, io) => {
    await socket.removeAllListeners("join group chat")

    if (socket.listeners('join group chat').length < 1) {
        socket.on('join group chat', async (groupId) => {
            // HERE THE SOCKET HAS JOINED A ROOM NAMED AFTER THE GROUPID
            // ALWAYS REMEMBER TO NOT ALLOCATE SAME LISTENER TO SINGLE SOCKET MULTIPLE TIME
            // CHECK MULTIPLE LISTENERS USING socket.listeners('group chat').length)

            // await socket.leaveAll()

            // const sockets = await io.in(groupId).fetchSockets();
            // const socketIds = sockets.map(socket => socket.id);
            // if (socketIds.includes(socket.id)) {
            //     console.log("socket id detected already")
            // }
            // else {
            //     console.log("no socket id matched")
            // }

            await socket.removeAllListeners("group chat")
            await socket.join(groupId)
            // console.log("Sending msg with socketId : " + socket.id)
            // console.log("before sending group msg")
            // console.log("before grp cht: " + socket.listeners('group chat').length);

            if (socket.listeners('group chat').length < 1) {
                socket.on('group chat', (message) => {
                    // console.log("inside grp cht: " + socket.listeners('group chat').length);
                    // console.log("sending group msg")
                    SendMessageToGroup(message.groupId, socket, io, message)
                })
            }

        })
    }


}

const SendMessageToGroup = async (groupId, socket, io, message) => {
    // console.log(socket.listeners('group chat').length);
    // console.log("sending group msg1")

    const detailed_message = {
        sender: message.sender,
        time: (new Date().toString()),
        content: message.content,
        attachment: message.attachment
    }
    await Group.updateOne(
        { _id: groupId },
        { $push: { messages: detailed_message } }
    )

    // NEW FEATURE TO SHOW LAST MESSAGE ON GROUP----------------
    const result = await Group.findOne(
        { _id: groupId },
        { members: 1 }
    )

    const allMembers = result.members
    // console.log("all members fetched")
    // console.log(allMembers)

    await User.updateMany(
        {
            username: { $in: allMembers.map(member => member.username) },
            "user_details.groups.group_id": groupId,
        },
        {
            $set: {
                "user_details.groups.$.last_message_seen": false,
                "user_details.groups.$.last_message_sender": detailed_message.sender,
                "user_details.groups.$.last_message_time": detailed_message.time,
                "user_details.groups.$.last_message": detailed_message.content,
            }
        }
    )
    // NEW FEATURE TO SHOW LAST MESSAGE ON GROUP----------------

    detailed_message.groupId = groupId
    // console.log(detailed_message)


    const sockets = await io.in(groupId).fetchSockets();
    sockets.map(socket => socket.id);
    // console.log(socketIds)



    io.to(groupId).emit('group chat', detailed_message)
}


// ------------------------------------------------------------------------------------------------------------
async function updateLastMessage(newMessage) {
    await User.updateMany(
        {
            username: newMessage.sender,
            "user_details.contacts.username": newMessage.reciever,
        },
        {
            $set: {
                "user_details.contacts.$.last_message": newMessage.content,
                "user_details.contacts.$.last_message_time": newMessage.time,
                "user_details.contacts.$.last_message_sender": newMessage.sender,
                "user_details.contacts.$.last_message_seen": false,
            }
        }
    )

    await User.updateMany(
        {
            username: newMessage.reciever,
            "user_details.contacts.username": newMessage.sender,
        },
        {
            $set: {
                "user_details.contacts.$.last_message": newMessage.content,
                "user_details.contacts.$.last_message_time": newMessage.time,
                "user_details.contacts.$.last_message_sender": newMessage.sender,
                "user_details.contacts.$.last_message_seen": false,
            }
        }
    )
}

const ListenIncomingMessages = (socket) => {
    socket.on('client to server', async (message) => {
        // console.log("user customs>>> ", socket.customData.username)
        if (message.sender && message.reciever && message.content) {


            const result = await User.findOne({ username: message.reciever }, { "user_details.blocked_users": 1 })
            const recieverBlockList = result.user_details.blocked_users
            // console.log("block list------------------------")
            // console.log(recieverBlockList)
            // console.log("block list------------------------")
            if (!(recieverBlockList.some((user) => user.username == message.sender))) {
                const newMessage = new Message({
                    sender: message.sender,
                    reciever: message.reciever,
                    time: new Date().toString(),
                    content: message.content,
                    attachment: message.attachment,
                    seen: false
                })
                // console.log(newMessage)
                socket.emit('server to client', newMessage)
                newMessage.save()

                updateLastMessage(newMessage)

                // const detailed_message = {
                //     ...newMessage,
                //     sender_dp: message.sender_dp
                // }


                SendMesage(newMessage, message.sender_dp)
                // console.log('Sending message __\\\|/__')
            }
        }
    })
}

const GetUsername = (socket) => {
    socket.on('auth', (username) => {
        socket.customData = {
            username: username
        }
        socket.broadcast.emit(`${socket.customData.username} online status`, true)
        if (current_users.some((element) => element.username == username)) {
            // console.log("user already present")
            return
        }
        // console.log("auth done : " + username)
        current_users.push({
            username: username,
            socket: socket
        })
        // console.log("current users>> " + current_users)
    })
}

const isUserOnline = (socket) => {
    socket.removeAllListeners('online status')
    socket.on("online status", (username) => {
        if (current_users.some((user) => user.username == username)) {
            // console.log(username + " is online")
            socket.emit(`${username} online status`, true)
        }
        else {
            // console.log(username + " is offline")
            socket.emit(`${username} online status`, false)
        }
    })
}

const SendMesage = (message, sender_dp) => {
    var reciever
    if (current_users.some((user) => {
        if (user.username == message.reciever) {
            reciever = user
            return true
        }
        else {
            return false
        }
    })) {
        // console.log(new Date())
        reciever.socket.emit("server to client", message)
    }
    else {
        // console.log("reciever is offline !")
        // console.log(message)
        notifyUser(message.sender, message.content, message.reciever, sender_dp)
    }
}

const ListenToMessageSeen = async (socket) => {
    try {
        socket.removeAllListeners('message seen')
        socket.on('message seen', async (messageSeenData) => {
            // console.log("updating seen messages")
            await Message.updateMany(
                { sender: messageSeenData.sender, reciever: messageSeenData.reciever, $or: [{ seen: false }, { seen: { $exists: false } }] },
                { $set: { seen: true } }
            )

            // console.log(`sender: ${messageSeenData.sender} reciever: ${messageSeenData.reciever}`)

            const recieverSocket = findCurrentUserSocket(messageSeenData.sender)
            recieverSocket?.emit('message seen', true)

            // console.log(`username: ${messageSeenData.reciever} contact: ${messageSeenData.sender}`)

            await User.updateOne(
                {
                    username: messageSeenData.reciever,
                    "user_details.contacts.username": messageSeenData.sender,
                },
                {
                    $set: {
                        "user_details.contacts.$.last_message_seen": true,
                    }
                    // this above line may cause error
                }
            )
            // console.log(result)

            // if (recieverSocket) {
            //     console.log("sending message seen in realtime")
            // }
            // else {
            //     console.log("user is offline :(")
            // }
        })
    } catch (error) {
        console.log("error in message seen feature")
        console.log(error)
    }
}

// function showElements(arr) {
//     arr.forEach(element => {
//         console.log(element.username)
//     });
// }

function findCurrentUserSocket(username) {
    var userSocket = null
    current_users.map((user) => {
        if (user.username == username) {
            userSocket = user.socket
        }
    })
    return userSocket
}

// export const cu = async (req, res) => {
//     console.log(current_users)
//     res.send("helo")
// }