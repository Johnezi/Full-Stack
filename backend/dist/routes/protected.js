"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const User_1 = __importDefault(require("../models/User"));
const Container_1 = __importDefault(require("../models/Container"));
const Card_1 = __importDefault(require("../models/Card"));
const router = express_1.default.Router();
// Checks if user has logged in
router.get("/user", authMiddleware_1.verifyToken, (req, res) => {
    res.json({ message: "Welcome to the user area" });
});
// Get user profile
router.get("/profile", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Ensures that password is not sent in the response
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select("-password");
        if (!user) {
            res.status(404).json({ error: "User not found in the database" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching profile" });
    }
}));
// Get all containers for the logged-in user
router.get("/containers", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const containers = yield Container_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }).sort({ index: 1 });
        res.json(containers);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching containers" });
    }
}));
// Get a specific container by ID
router.get("/containers/:id", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const container = yield Container_1.default.findById(req.params.id);
        if (!container) {
            res.status(404).json({ error: "Container not found" });
            return;
        }
        res.json(container);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching container" });
    }
}));
// Create a new container
router.post("/containers", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { header, headerColor = "white" } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const containerCount = yield Container_1.default.countDocuments({ userId });
        const newContainer = new Container_1.default({ header, headerColor, userId, index: containerCount });
        yield newContainer.save();
        res.json(newContainer);
    }
    catch (error) {
        console.error("Error creating container:", error);
        res.status(500).json({ error: "Error creating container" });
    }
}));
// Update a container
router.put("/containers/:id", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Received request to update container ${req.params.id} with data:`, req.body);
    try {
        const updatedContainer = yield Container_1.default.findOneAndUpdate({ _id: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, req.body, { new: true });
        if (!updatedContainer) {
            console.log(`Container ${req.params.id} not found`);
            res.status(404).json({ error: "Container not found" });
            return;
        }
        console.log(`Successfully updated container ${req.params.id}`);
        res.json(updatedContainer);
    }
    catch (error) {
        console.error(`Error updating container ${req.params.id}`, error);
        res.status(500).json({ error: "Error updating container" });
    }
}));
// Delete a container and its associated cards
router.delete("/containers/:id", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const container = yield Container_1.default.findById(req.params.id);
        if (!container) {
            res.status(404).json({ error: "Container not found" });
            return;
        }
        // Delete all cards associated with the container
        yield Card_1.default.deleteMany({ parentContainerId: container._id });
        // Delete the container
        yield container.deleteOne();
        res.json({ message: "Container and its cards deleted" });
    }
    catch (error) {
        console.error("Error deleting container and its cards:", error);
        res.status(500).json({ error: "Error deleting container and its cards" });
    }
}));
// Get all cards for the logged-in user
router.get("/cards", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const cards = yield Card_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }).sort({ index: 1 });
        res.json(cards);
    }
    catch (error) {
        res.status(500).json({ error: "Error fetching cards" });
    }
}));
// Create a new card
router.post("/cards", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const newCard = new Card_1.default(Object.assign(Object.assign({}, req.body), { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
        yield newCard.save();
        res.json(newCard);
    }
    catch (error) {
        res.status(500).json({ error: "Error creating card" });
    }
}));
// Update a card
router.put("/cards/:id", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(`Received request to update card ${req.params.id} with data:`, req.body);
    try {
        const updatedCard = yield Card_1.default.findOneAndUpdate({ id: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, req.body, { new: true });
        if (!updatedCard) {
            console.log(`Card ${req.params.id} not found`);
            res.status(404).json({ error: "Card not found" });
            return;
        }
        console.log(`Successfully updated card ${req.params.id}`);
        res.json(updatedCard);
    }
    catch (error) {
        console.error(`Error updating card ${req.params.id}`, error);
        res.status(500).json({ error: "Error updating card" });
    }
}));
// Delete a card by uuid
router.delete("/cards/:uuid", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const card = yield Card_1.default.findOneAndDelete({ id: req.params.uuid });
        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }
        res.json({ message: "Card deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Error deleting card" });
    }
}));
// Add a comment to a card
router.post("/cards/:uuid/comments", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const card = yield Card_1.default.findOne({ id: req.params.uuid, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }
        const newComment = {
            commentId: req.body.commentId,
            text: req.body.text,
            timestamp: new Date(),
            edited: false
        };
        card.comments.push(newComment);
        yield card.save();
        res.json(newComment);
    }
    catch (error) {
        res.status(500).json({ error: "Error adding comment" });
    }
}));
// Update a comment on a card
router.put("/cards/:uuid/comments/:commentId", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const card = yield Card_1.default.findOne({ id: req.params.uuid, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }
        const commentIndex = card.comments.findIndex(comment => comment.commentId === req.params.commentId);
        if (commentIndex === -1) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }
        card.comments[commentIndex] = Object.assign(Object.assign({}, card.comments[commentIndex]), req.body);
        yield card.save();
        res.json(card.comments[commentIndex]);
    }
    catch (error) {
        res.status(500).json({ error: "Error updating comment" });
    }
}));
// Remove a comment from a card
router.delete("/cards/:uuid/comments/:commentId", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const card = yield Card_1.default.findOne({ id: req.params.uuid, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (!card) {
            res.status(404).json({ error: "Card not found" });
            return;
        }
        card.comments.pull({ commentId: req.params.commentId });
        yield card.save();
        res.json({ message: "Comment removed" });
    }
    catch (error) {
        res.status(500).json({ error: "Error removing comment" });
    }
}));
exports.default = router;
