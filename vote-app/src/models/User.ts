import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['voter', 'campaign'], required: true },
  // Add other fields as needed
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
