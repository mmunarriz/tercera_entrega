import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user: String,
    message: String,
});

const Message = mongoose.model('Message', messageSchema);

export default Message;