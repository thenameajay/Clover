import mongoose from "mongoose";

// import Message from "./Messages.js";
const attachment = new mongoose.Schema({
    file_name: { type: String },
    dbx_url: { type: String, required: true },
    file_type: { type: String, required: true },
})


const GroupSchema = new mongoose.Schema({
    admin: {
        username: { type: String, required: true },
        name: { type: String },
    },
    name: {
        type: String,
        required: true,
    },
    members: [{
        username: { type: String, required: true },
        name: { type: String },
        dp: { type: String },
        quote: { type: String },
    }],
    messages: [{
        sender: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        attachment: {
            type: attachment,
        },
    }],
});

const Group = mongoose.model('Group', GroupSchema);

export default Group