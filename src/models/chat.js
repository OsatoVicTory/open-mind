import mongoose from 'mongoose';

const P2PChatSchema = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
  },
  chats: {
    type: Array,
    default: [],
  },
});

export default mongoose.models['p2p-chats'] || mongoose.model('p2p-chats', P2PChatSchema);