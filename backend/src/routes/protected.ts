import express from "express"
import { verifyToken } from "../middleware/authMiddleware"
import User from "../models/User"
import Container from "../models/Container"
import Card from "../models/Card"

const router = express.Router()

interface AuthRequest extends express.Request {
  user?: { id: string; role: string }
}

// Checks if user has logged in
router.get("/user", verifyToken, (req: AuthRequest, res) => {
    res.json({ message: "Welcome to the user area" })
})

// Get user profile
router.get("/profile", verifyToken, async (req: AuthRequest, res) => {
    try {
      // Ensures that password is not sent in the response
        const user = await User.findById(req.user?.id).select("-password")  
        if (!user) {
            res.status(404).json({ error: "User not found in the database" })
            return
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: "Error fetching profile" })
    }
})

// Get all containers for the logged-in user
router.get("/containers", verifyToken, async (req: AuthRequest, res) => {
  try {
    const containers = await Container.find({ userId: req.user?.id }).sort({ index: 1 });
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching containers" });
  }
});

// Get a specific container by ID
router.get("/containers/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const container = await Container.findById(req.params.id)
    if (!container) {
      res.status(404).json({ error: "Container not found" })
      return;
    }
    res.json(container)
  } catch (error) {
    res.status(500).json({ error: "Error fetching container" })
  }
});

// Create a new container
router.post("/containers", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { header, headerColor = "white" } = req.body;
    const userId = req.user?.id;
    const containerCount = await Container.countDocuments({ userId });
    const newContainer = new Container({ header, headerColor, userId, index: containerCount });
    await newContainer.save();
    res.json(newContainer);
  } catch (error) {
    console.error("Error creating container:", error);
    res.status(500).json({ error: "Error creating container" });
  }
});

// Update a container
router.put("/containers/:id", verifyToken, async (req: AuthRequest, res) => {

  try {
    const updatedContainer = await Container.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      req.body,
      { new: true }
    );

    if (!updatedContainer) {
      res.status(404).json({ error: "Container not found" })
      return
    }

    res.json(updatedContainer);
  } catch (error) {
    console.error(`Error updating container ${req.params.id}`, error)
    res.status(500).json({ error: "Error updating container" })
  }
});

// Delete a container and its associated cards
router.delete("/containers/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    const container = await Container.findById(req.params.id)
    if (!container) {
      res.status(404).json({ error: "Container not found" })
      return 
    }

    // Delete all cards associated with the container
    await Card.deleteMany({ parentContainerId: container._id })

    // Delete the container
    await container.deleteOne()

    res.json({ message: "Container and its cards deleted" })
  } catch (error) {
    console.error("Error deleting container and its cards:", error)
    res.status(500).json({ error: "Error deleting container and its cards" })
  }
})

// Get all cards for the logged-in user
router.get("/cards", verifyToken, async (req: AuthRequest, res) => {
  try {
    const cards = await Card.find({ userId: req.user?.id }).sort({ index: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cards" });
  }
});

// Create a new card
router.post("/cards", verifyToken, async (req: AuthRequest, res) => {
  try {
    const newCard = new Card({ ...req.body, userId: req.user?.id })
    await newCard.save()
    res.json(newCard)
  } catch (error) {
    res.status(500).json({ error: "Error creating card" })
  }
})

// Update a card
router.put("/cards/:id", verifyToken, async (req: AuthRequest, res) => {

  try {
    const updatedCard = await Card.findOneAndUpdate(
      { id: req.params.id, userId: req.user?.id },
      req.body,
      { new: true }
    );

    if (!updatedCard) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    res.json(updatedCard);
  } catch (error) {
    console.error(`Error updating card ${req.params.id}`, error);
    res.status(500).json({ error: "Error updating card" });
  }
});

// Delete a card by uuid
router.delete("/cards/:uuid", verifyToken, async (req: AuthRequest, res) => {
  try {
    const card = await Card.findOneAndDelete({ id: req.params.uuid })
    if (!card) {
      res.status(404).json({ error: "Card not found" })
      return
    }
    res.json({ message: "Card deleted" })
  } catch (error) {
    res.status(500).json({ error: "Error deleting card" })
  }
})

// Add a comment to a card
router.post("/cards/:uuid/comments", verifyToken, async (req: AuthRequest, res) => {
  try {
    const card = await Card.findOne({ id: req.params.uuid, userId: req.user?.id })
    if (!card) {
        res.status(404).json({ error: "Card not found" })
        return 
    } 

    const newComment = {
      commentId: req.body.commentId,
      text: req.body.text,
      timestamp: new Date(),
      edited: false
    }
    card.comments.push(newComment)
    await card.save()
    res.json(newComment)
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" })
  }
})

// Update a comment on a card
router.put("/cards/:uuid/comments/:commentId", verifyToken, async (req: AuthRequest, res) => {
  try {
    const card = await Card.findOne({ id: req.params.uuid, userId: req.user?.id })
    if (!card) {
        res.status(404).json({ error: "Card not found" })
        return 
    } 
    const commentIndex = card.comments.findIndex(comment => comment.commentId === req.params.commentId)
    if (commentIndex === -1) {
        res.status(404).json({ error: "Comment not found" })
        return 
    }
    card.comments[commentIndex] = { ...card.comments[commentIndex], ...req.body }
    await card.save()
    res.json(card.comments[commentIndex])
  } catch (error) {
    res.status(500).json({ error: "Error updating comment" })
  }
})

// Remove a comment from a card
router.delete("/cards/:uuid/comments/:commentId", verifyToken, async (req: AuthRequest, res) => {
  try {
    const card = await Card.findOne({ id: req.params.uuid, userId: req.user?.id })
    if (!card) {
        res.status(404).json({ error: "Card not found" })
        return 
    } 
    card.comments.pull({ commentId: req.params.commentId })
    await card.save()
    res.json({ message: "Comment removed" })
  } catch (error) {
    res.status(500).json({ error: "Error removing comment" })
  }
})

export default router