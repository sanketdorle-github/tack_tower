import express from "express";
import {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard,
  moveTask,
  reorderCards,
} from "../controllers/card.controller.js";

const router = express.Router();

// POST /api/cards/:listId - Create a new card in a list
router.post("/:listId", createCard);

// GET /api/cards/:listId - Get all cards in a list
router.get("/:listId", getCardsByList);

// PUT /api/cards/update/:cardId - Update a card
router.put("/update/:cardId", updateCard);

router.patch("/move/:cardId", moveTask);

// DELETE /api/cards/delete/:cardId - Delete a card
router.delete("/delete/:cardId", deleteCard);
//reorder
router.put("/reorder/:cardId", reorderCards);

export default router;
