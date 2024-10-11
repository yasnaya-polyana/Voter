import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  campaignName: String,
  description: String,
  isPublic: Boolean,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  privateKey: String,
});

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
