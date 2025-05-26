import { Router } from "express";
import {
  createList,
  getListsByBoard,
  updateList,
  deleteList,
  moveColumn,
} from "../controllers/list.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
const router = Router();

// All routes are protected
router.use(authMiddleware);

// Create a new list in a board
router.post("/:boardId", createList);

// Get all lists by boardId
router.get("/:boardId", getListsByBoard);

// Update a list
router.put("/:listId", updateList);

// Delete a list
router.delete("/:listId", deleteList);


router.patch("/move/:listId", moveColumn);

export default router;
