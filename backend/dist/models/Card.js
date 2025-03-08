"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema for a Card
const CardSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    secondaryTitle: { type: String },
    mainText: { type: String },
    cardColor: { type: String, default: "white" },
    tags: { type: String },
    versionText: { type: String },
    parentContainerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Container", required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
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
exports.default = mongoose_1.default.model("Card", CardSchema);
