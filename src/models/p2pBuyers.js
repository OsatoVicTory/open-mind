import mongoose from 'mongoose';

const P2PBuyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lowerCaseName: {
    type: String,
    required: true,
  },
  amt: {
    type: Number,
  },
  completed_orders: {
    type: Number,
    default: 0,
  },
  orders: {
    type: Number,
    default: 0,
  },
  lowerLimits: {
    type: Number,
    default: 0,
  },
  upperLimits: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  payments: {
    type: Array,
    default: [],
  },
  meta_data: {
    type: String,
    default: "",
  },
});

P2PBuyerSchema.set("timestamps", true);

export default mongoose.models.p2p_buyer || mongoose.model('p2p_buyer', P2PBuyerSchema);