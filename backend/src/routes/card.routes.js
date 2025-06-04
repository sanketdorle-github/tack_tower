import { Router } from "express";
import {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard,
  moveTask,
  reorderCards,
  assignUsersToCard,
  searchBoardMembers,
  getAssignedMembers,
} from "../controllers/card.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Assign users to a card
router.post("/assign-users", assignUsersToCard);


// POST /api/cards/:listId - Create a new card in a list
router.post("/:listId", createCard);

// GET /api/cards/:listId - Get all cards in a list
router.get("/:listId", getCardsByList);

// PUT /api/cards/update/:cardId - Update a card
router.put("/update/:cardId", updateCard);

router.patch("/move/:cardId", moveTask);

// DELETE /api/cards/delete/:cardId - Delete a card
router.delete("/delete/:cardId", deleteCard);

// Reorder cards
router.put("/reorder/:cardId", reorderCards);

// Search members in a board by name or email
router.get("/:boardId/search-members", searchBoardMembers);

router.get("/:cardId/assigned-members", getAssignedMembers);


export default router;
