import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  campaignName: { type: String, required: true },
  voteDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['completed', 'verified'], 
    required: true 
  },
  verificationHash: String,
  candidateVotedFor: { type: String, required: true },
  totalVotes: Number,
  verifiedAt: Date,
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign',
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);