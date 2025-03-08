import mongoose from "mongoose";

// Define the schema for a Card
const CardSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  title: { type: String, required: true },
  secondaryTitle: { type: String },
  mainText: { type: String },
  cardColor: { type: String, default: "white" },
  tags: { type: String },
  versionText: { type: String },
  parentContainerId: { type: mongoose.Schema.Types.ObjectId, ref: "Container", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  index: { type: Number, default: 0 },
  createdTimestamp: { type: Date, default: Date.now },
  comments: [
    {
      commentId: { type: String, required: true },
      text: String,
      user: String,
      timestamp: { type: Date, default: Date.now },
      edited: { type: Boolean, default: false }
    }
  ],
  estimatedTime: { type: String }, 
  actualTime: { type: String, default: "insert" } 
});

// Export the Card model
export default mongoose.model("Card", CardSchema);
