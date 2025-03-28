import { config } from 'dotenv';
import sgMail from '@sendgrid/mail';
import { admin } from '../Firebase.js';
import User from '../Schema/UserSchema.js';
import Message from '../Schema/Messages.js';
import Group from '../Schema/GroupSchema.js';
import { deleteFile } from './CloudStorageControllers.js';

config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
export const SendMail = async (req, res) => {
    const { to, subject, message } = req.body

    const msg = {
        to: to,
        from: 'ajaysharma.hawkscode@gmail.com',
        subject: subject,
        text: message,
        html: message,
    }
    await sgMail.send(msg).then(() => {
        // console.log('Email sent')
        res.send({ message: `mail sent to ${to}` })
    }).catch((error) => {
        console.log("error occured")
        console.error(error)
        res.status(400).json({ message: 'Internal server error' })
    })
}

// BROWSER NOTIFICATIONS ---------------------------------------------------------
export const notifyUser = async (title, body, reciever, imageUrl) => {
    try {
        // console.log("sending notification")
        const user = await User.findOne({ username: reciever }, { device_details: 1 })
        user.device_details.forEach(async (element) => {
            if (element.notification_token) {
                console.log(element.notification_token)
                // Define the message payload
                const message = {
                    token: element.notification_token, // The device token
                    notification: {
                        title: title,
                        body: body,
                    },
                    webpush: {
                        notification: {
                            icon: imageUrl && imageUrl != undefined ? imageUrl : 'https://w7.pngwing.com/pngs/560/93/png-transparent-a-o-t-wings-of-freedom-attack-on-titan-logo-eren-yeager-corps.png', // Replace with your image URL
                        },
                        fcm_options: {
                            link: process.env.FRONTEND_URL
                        }
                    }
                }

                await admin.messaging().send(message);
            }
        });
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

export const SendBrowserNotification = async (req, res) => {
    const { title, body, reciever } = req.body; // Get title, body, and token from the request
    try {
        const isSent = notifyUser(title, body, reciever)
        if (isSent) {
            // console.log('Notification sent successfully:');
            res.status(200).send('Notification sent successfully!');
        }
        else {
            // console.log('Notification not sent');
            res.status(400).send('Notification not sent!');
        }
    } catch (error) {
        console.log('Error sending notification:', error);
        res.status(500).send('Error sending notification');
    }
}

export const SetNotificationToken = async (req, res) => {
    const { token } = req.body
    const idToken = req.headers['authorization']
    const user = req.user
    const email = user.email

    try {
        await User.updateOne(
            { email: email, "device_details.login_token": idToken },
            { $set: { "device_details.$.notification_token": token } }
        )

        res.status(200).send('Notification token set successfully!');
    } catch (error) {
        console.log(error)
        res.status(404).send({ message: 'Notification token is not updated!' });
    }

}

// BROWSER NOTIFICATIONS ---------------------------------------------------------

export const showChatHistory = async (req, res) => {
    const { sender, reciever } = req.body

    try {
        const chatHistory = await Message.find({ $or: [{ sender: sender, reciever: reciever }, { sender: reciever, reciever: sender }] })
        res.status(200).send(chatHistory)
    } catch (error) {
        console.log(error)
        res.status(400).send({ message: "unable to load chat" })
    }
}

export const ShowContactList = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        const contactList = user?.user_details.contacts
        res.status(200).send(contactList)
    } catch (error) {
        console.log("error in getting contact list: " + error)
        res.status(400).send({ message: "something went wrong" })
    }
}

export const SearchUser = async (req, res) => {
    const { username } = req.body
    if (!username) {
        res.status(400).send({ message: "Username Required" })
        return
    }
    try {
        // console.log(username)
        var searchedUser = await User.findOne({ username })
        if (!searchedUser) {
            res.status(404).send({ message: "User Not Found" })
            return
        }
        searchedUser = {
            name: searchedUser.user_details.name,
            username: searchedUser.username,
            dp: searchedUser.user_details.picture,
            quote: searchedUser.user_details.quote
        }
        // console.log(searchedUser)
        res.status(200).send(searchedUser)
    } catch (error) {
        console.log("error in getting searched user data: " + error)
        res.status(400).send({ message: "something went wrong" })
    }
}

export const AddToContacts = async (req, res) => {
    const { email, contact } = req.body
    // console.log(email)
    // console.log("----------------------------------------------------------------------------------")
    // console.log(contact)
    if (!email || !contact || !contact.username) {
        res.status(400).send({ message: "unable to add contact" })
        return
    }
    try {
        const user = await User.findOne({ email })
        if (user.user_details.contacts.some((friend) => friend.username == contact.username)) {
            // console.log("user already exist")
            res.status(200).send({ message: "contact already exists" })
            return
        }
        await User.updateOne(
            { email: email },
            { $push: { "user_details.contacts": { username: contact.username, name: contact.name, dp: contact.dp, quote: contact.quote } } }
        )
        // console.log("added to contacts")
        res.status(200).send({ message: "added to contact" })
    } catch (error) {
        console.log("error in adding contacts : " + error)
        res.status(400).send({ message: "unable to add contact" })
    }
}

export const RemoveContact = async (req, res) => {
    const { email, contact } = req.body
    if (!email || !contact || !contact.username) {
        res.status(400).send({ message: "unable to remove contact" })
        return
    }
    try {
        await User.updateOne(
            { email: email },
            { $pull: { "user_details.contacts": { username: contact.username } } }
        )
        // console.log("Removed from contacts")
        res.status(200).send({ message: "Removed from contacts" })
    } catch (error) {
        console.log("error in removing contacts : " + error)
        res.status(400).send({ message: "unable to remove contact" })
    }
}

const addMembers = async (members, group) => {
    // console.log(group)
    // console.log(members)
    // const all_usernames = ["ajay", "parth", "nitin"]
    // const user = await User.find({ username: { $in: all_usernames } }, { username: 1, user_details: 1 })
    // console.log(JSON.stringify(user, null, 2))

    // const isUser = await User.find({ username: "ajay", "user_details.contacts": { $elemMatch: { username: { $eq: "nitin" } } } }, { username: 1 })
    // console.log(isUser)


    // THE FOLLOWING LINE MAKES SURE THAT ALL THE MEMBERS EXISTS AND HAS ADMIN IN THEIR CONTACT LIST 
    // const valid_members = await User.find({ username: { $in: members }, "user_details.contacts": { $elemMatch: { username: { $eq: "amrudh" } } } }, { username: 1, _id: 0 })
    // console.log(valid_members)

    try {
        // THE FOLLOWING LINE MAKES SURE THAT ALL THE MEMBERS EXISTS AND HAS ADMIN IN THEIR CONTACT LIST  AND THEN ADD GROUP TO THEIR DETAILS
        // -------
        //     db.collection('users').updateMany(
        //         { username: { $in: allMembers.map(m => m.username) } },
        //         { $set: { somefield: 'somevalue' } } // Your desired updates
        //     );
        // --------
        //     TRY THIS CODE ABOVE
        // await User.updateMany(
        //     { username: { $in: members.map(m => m.username) }, "user_details.contacts": { $elemMatch: { username: { $eq: admin.username } } } },
        //     { $push: { "user_details.groups": { group_name: group.name, group_id: group._id } } }
        // )

        // DATA UPDATING BELOW IS INSERTED AGAIN IN THE ARRAY IF IT ALREADY EXISTED OR NOT
        // const result = await User.findOne({ username: "parth" }, { "user_details.groups": 1 })

        // console.log(result.user_details.groups)

        // console.log(temp)
        // console.log(typeof temp.group_id)


        // CODE BELOW WILL ADD THE ELEMENTS AGAIN IF THEY ARE ALREADY PRESENT BECAUSE THESE OBJECTS ARE NOT EXACTLY SAME AS IN THE MONGODB.
        // OBJECTS IN MONGODB ARE HAVING AN _id FIELD WHICH FOLLOWING OBJECTS NOT HAVE. THIS WILL ONLY HAPPEN WHEN ADDING NEW OBJECTS TO AN ARRAY, NOT WHEN ADDING STRINGS IN ARRAY BECAUSE IN MONGODB, EACH OBJECT HAS A UNIQUE ID BUT STRINGS DON'T HAVE ANY 
        // await User.updateOne(
        //     { username: "parth" },
        //     { $addToSet: { "user_details.groups": temp } }
        // )


        const temp = { group_name: group.name, group_id: group._id }
        await User.updateMany(
            {
                username: { $in: members.map(m => m.username) },
                "user_details.groups": { $not: { $elemMatch: { group_id: temp.group_id } } }
            },
            { $addToSet: { "user_details.groups": temp } }
        )

        for (const member of members) {
            await Group.updateOne(
                {
                    _id: group._id,
                    members: { $not: { $elemMatch: { username: member.username } } }
                },
                { $addToSet: { members: member } }
            )
        }

        return true
    } catch (error) {
        console.log(error)
        return false
    }
    // if (user.user_details.contacts.some((friend) => friend.username == admin.username)) {
    //     User.updateOne(
    //         { username: member.username },
    //         { $push: { "user_details.groups": { group_name: group.name, group_id: group.id } } }
    //     )
    // }
}

export const AddMembersToGroup = async (req, res) => {
    const { members, group } = req.body
    const areMembersAdded = await addMembers(members, group)
    if (areMembersAdded) {
        res.status(200).send({ message: "Members added successfully" })
    }
    else {
        res.status(400).send({ message: "Members not added" })
    }
}

export const CreateGroup = async (req, res) => {
    const { admin, members, groupName } = req.body
    if (!groupName) {
        // console.log("no group name")
        res.status(400).send({ message: "Group name required" })
        return
    }
    // HERE ADMIN>>STRING   MEMBERS>>ARRAY OF OBJECTS   GROUPNAME>>STRING 

    try {
        const group = new Group({
            admin: admin,
            name: groupName,
            members: members
        })
        group.members.push(admin)
        const createdGroup = await group.save()

        await User.updateOne(
            { username: admin.username },
            { $push: { "user_details.groups": { group_name: createdGroup.name, group_id: createdGroup._id } } }
        )

        var areMembersAdded = true

        if (members && members.length !== 0) {
            areMembersAdded = await addMembers(members, createdGroup)
        }
        if (areMembersAdded) {
            res.status(200).send({ message: "Group created successfully" })
        }
        else {
            res.status(400).send({ message: "Members not added" })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({ message: "Group not created" })
    }
}

export const GroupListOfUser = async (req, res) => {
    const { email } = req.body
    try {
        const groupList = await User.findOne({ email }, { "user_details.groups": 1 })
        if (!groupList) {
            res.status(404).send({ message: "No groups found" })
            return
        }
        else {
            res.status(200).send(groupList.user_details.groups)
        }
    } catch (error) {
        console.log("Error in finding group list: " + error)
        res.status(400).send({ message: "error in finding group list" })
    }
}

export const ShowGroupChats = async (req, res) => {
    const { groupId } = req.body
    try {
        const groupChats = await Group.findOne({ _id: groupId }, { messages: 1 })
        res.status(200).send(groupChats.messages)
    } catch (error) {
        console.log("error in retrieving group chats : " + error)
        res.status(400).send({ message: "unable to get group chats" })
    }
}

export const LastGroupMessageSeen = async (req, res) => {
    const { username, groupId } = req.body

    try {
        // console.log("updating last group message seen...")
        await User.updateOne(
            {
                username: username,
                "user_details.groups.group_id": groupId,
            },
            {
                $set: {
                    "user_details.groups.$.last_message_seen": true,
                }
            }
        )
        // console.log(result)
        res.status(200).send({ message: "updated successfully" })
    } catch (error) {
        console.log("error in updating last message seen")
        console.log(error)
        res.status(400).send({ message: "last message seen not updated !" })
    }
}

export const LeaveGroup = async (req, res) => {
    const { username, groupId } = req.body

    try {
        if (!username || !groupId) {
            res.status(400).send({ message: "both username and groupId required !" })
            return
        }
        await User.updateOne(
            { username: username },
            { $pull: { "user_details.groups": { group_id: groupId } } }
        )
        // console.log(result1)
        const result3 = await Group.findOne({ _id: groupId }, { members: 1 })
        if (result3.members.length == 1) {
            // console.log("deleting...")
            await Group.deleteOne({ _id: groupId })
            // console.log(r)
        }
        else {
            // console.log("updating...")
            await Group.updateOne(
                { _id: groupId },
                { $pull: { members: { username: username } } }
            )
            // console.log(result2)
        }
        res.status(200).send({ message: "Group leaved successfully" })
    } catch (error) {
        console.log(error)
        res.status(400).send({ message: "Internal server error, please try again later." })
    }
}

export const BlockUser = async (req, res) => {
    const { username, blockedUser, unBlock } = req.body
    try {
        if (unBlock) {
            await User.updateOne(
                {
                    username: username,
                },
                { $pull: { "user_details.blocked_users": { username: blockedUser.username } } }
            )
            res.status(200).send({ message: "User Unblocked successfully" })
        }
        else {
            // console.log("blocking user")
            await User.updateOne(
                {
                    username: username,
                    "user_details.blocked_users": { $not: { $elemMatch: { username: blockedUser.username } } }
                },
                { $addToSet: { "user_details.blocked_users": blockedUser } }
            )
            res.status(200).send({ message: "User blocked successfully" })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({ message: "User not blocked" })
    }
}

export const showBlockList = async (req, res) => {
    const { username } = req.body
    try {
        const result = await User.findOne({ username }, { "user_details.blocked_users": 1 })
        const blockList = result.user_details.blocked_users
        res.status(200).send(blockList)
    } catch (error) {
        console.log(error)
        res.status(404).send({ message: "Unable to fetch block list" })
    }
}

export const changeDp = async (req, res) => {
    const { username, imageUrl } = req.body

    if (!username || !imageUrl) {
        res.status(404).send({ message: "bad request: Both username and Image URL required !" })
        return
    }

    try {
        // console.log(imageUrl)
        // console.log(username)
        const result2 = await User.findOne({ username: username }, { "user_details.picture": 1 })
        await User.updateOne(
            { username: username },
            { "user_details.picture": imageUrl }
        )
        // console.log(result)
        // console.log("result<><><>")
        // console.log(result2)
        // console.log("result<><><><>")
        const previousImageUrl = result2.user_details.picture?.slice(0, -6)
        if (previousImageUrl) {
            await deleteFile(previousImageUrl)
        }
        res.status(200).send({ message: "Dp Changed successfully" })
    } catch (error) {
        console.log("error occured while saving image url in database")
        console.log(error)
        res.status(400).send({ message: "An error Occured, please try again later" })
    }

}

export const ChangeName = async (req, res) => {
    const { username, newName } = req.body
    try {
        await User.updateOne(
            { username: username },
            { $set: { "user_details.name": newName } }
        )
        res.status(200).send({ message: "Name Changed Successfuly" })
    } catch (error) {
        console.log("error occured while changing name")
        console.log(error)
        res.status(400).send({ message: "Name not saved !" })
    }
}

export const ChangeQuote = async (req, res) => {
    const { username, newQuote } = req.body
    try {
        if (!username || !newQuote) {
            // console.log("both fields required")
            res.status(400).send({ message: "Both username and new Quote required" })
            return
        }
        await User.updateOne(
            { username: username },
            { $set: { "user_details.quote": newQuote } }
        )
        // console.log("quote changed")
        res.status(200).send({ message: "Quote Changed Successfuly" })
    } catch (error) {
        console.log("error occured while changing quote")
        console.log(error)
        res.status(400).send({ message: "Quote not saved !" })
    }
}