import mongoose from 'mongoose';

// First, clear any existing models to prevent OverwriteModelError
mongoose.models = {};

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  imageUrl: String,
});

const CampaignSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
  },
  description: String,
  isPublic: {
    type: Boolean,
    required: true,
    default: true,
  },
  publicKey: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  privateKey: {
    type: String,
    required: function(this: { isPublic: boolean }) {
      return !this.isPublic;
    },
  },
  startDate: {
    type: Date,
    required: true,
    set: (date: string | Date) => new Date(date)
  },
  endDate: {
    type: Date,
    required: true,
    set: (date: string | Date) => new Date(date)
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'ended'],
    default: 'draft',
  },
  createdBy: {
    type: String,
    required: true,
  },
  candidates: [CandidateSchema],
  announcements: [{
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalVotes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  collection: 'campaigns'
});

// Create a compound index for efficient querying
CampaignSchema.index({ createdBy: 1, status: 1, startDate: -1 });

// Drop the problematic index if it exists
const Campaign = mongoose.model('Campaign', CampaignSchema);

// This is an async operation, but we can't use async/await at the top level
// So we handle it in a try/catch block
try {
  Campaign.collection.dropIndex('id_1')
    .catch(err => {
      // Ignore error if index doesn't exist
      if (err.code !== 27) {
        console.error('Error dropping index:', err);
      }
    });
} catch (error) {
  // Ignore error if collection doesn't exist yet
  console.error('Error accessing collection:', error);
}

export default Campaign;
