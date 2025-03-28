import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
    user_details: {
        name: { type: String, required: true },
        quote: { type: String },
        contacts: [{
            username: { type: String, required: true },
            name: { type: String },
            dp: { type: String },
            quote: { type: String },
            last_message: { type: String },
            last_message_time: { type: String },
            last_message_sender: { type: String },
            last_message_seen: { type: Boolean },
        }],
        blocked_users: [{
            username: { type: String, required: true },
            name: { type: String },
            quote: { type: String },
            dp: { type: String },
        }],
        groups: [{
            group_name: { type: String, required: true },
            group_id: { type: String, required: true },
            last_message: { type: String },
            last_message_time: { type: String },
            last_message_sender: { type: String },
            last_message_seen: { type: Boolean },
        }],
        picture: { type: String },
        phone_number: { type: String },
        created_on: { type: String, required: true },
        uid: { type: String, required: true },
        email_verified: { type: Boolean, required: true },
    },
    device_details: [{
        notification_token: { type: String },
        user_agent: { type: String, required: true },
        device_type: { type: String, required: true },
        device_model: { type: String, required: true },
        os: { type: String, required: true },
        os_version: { type: String, required: true },
        browser_name: { type: String, required: true },
        ip_address: { type: String, required: true },
        last_visit: { type: String, required: true },
        location: { type: String, required: true },
        login_token: { type: String },                 // ALSO KNOWS AS SESSION ID
    }],
});

const User = mongoose.model('User', UserSchema);

export default User
