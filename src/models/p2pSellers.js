import mongoose from 'mongoose';

const P2PSellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lowerCaseName: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  amt: {
    type: Number,
  },
  payment_duration: {
    type: Number,
    default: 0,
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

P2PSellerSchema.set("timestamps", true);

export default mongoose.models.p2p_seller || mongoose.model('p2p_seller', P2PSellerSchema);