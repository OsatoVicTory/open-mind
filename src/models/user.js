import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  public_id: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  id_verified: {
    type: Boolean,
    default: false,
  },
  meta_data: {
    type: String,
    default: "",
  },
  tokens: {
    type: Array,
    default: [],
  },
  banks: {
    type: Array, // arr of objects 
    default: [],
  },
});

UserSchema.set("timestamps", true);

export default mongoose.models.users || mongoose.model('users', UserSchema);