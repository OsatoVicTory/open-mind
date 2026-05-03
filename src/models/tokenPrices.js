import mongoose from 'mongoose';

const TokenPriceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  prices_data: {
    type: Array,
    default: [],
  },
});

TokenPriceSchema.set("timestamps", true);

export default mongoose.models['token-prices'] || mongoose.model('token-prices', TokenPriceSchema);