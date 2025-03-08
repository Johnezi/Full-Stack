"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema for a Container
const ContainerSchema = new mongoose_1.default.Schema({
    header: { type: String, required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    headerColor: { type: String, default: "white" },
    index: { type: Number, required: true }
});
// Export the Container model
exports.default = mongoose_1.default.model("Container", ContainerSchema);
