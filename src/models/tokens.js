import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number, // schema would treat as Double(float64)
  },
  total_supply: {
    type: Number, // schema would treat as Int64
  },
  one_hr: {
    type: Object,
  },
  one_day: {
    type: Object,
  },
  thirty_days: {
    type: Object,
  },
  volume_cnt: {
    type: Number, 
  },
  one_day_volume: {
    type: Number, 
  },
  img: {
    type: String,
  },
  public_id: {
    type: String,
  },
  creator_account_id: {
    type: String,
  },
  meta_data: {
    type: Object,
  },
});

export default mongoose.models.tokens || mongoose.model('tokens', TokenSchema);