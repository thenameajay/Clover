import mongoose from "mongoose";

const attachment = new mongoose.Schema({
    file_name: { type: String },
    dbx_url: { type: String, required: true },
    file_type: { type: String, required: true },
})

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    reciever: {
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
    seen: {
        type: Boolean,
        required: true,
    },
});

const Message = mongoose.model('Message', MessageSchema);

export default Message