import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: { //user wallet address
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  public_id: {
    type: String,
  },
  // array of Course{ 
      // coveredLessons: array of materials_index covered in the course,
      // claimed: boolean if certificate is claimed
      //instructor: instructorAddy, instructorCourseIndex
  // }
  courses: { 
    type: Array,
    default: [],
  },
});

UserSchema.set("timestamps", true);

export default mongoose.models.openMind_users || mongoose.model('openMind_users', UserSchema);