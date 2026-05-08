import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  testId: { //user wallet address
    type: String,
    required: true,
  },
  questions: { 
    type: Array,
    default: [],
  },
});

TestSchema.set("timestamps", true);

export default mongoose.models.openMind_test || mongoose.model('openMind_test', TestSchema);