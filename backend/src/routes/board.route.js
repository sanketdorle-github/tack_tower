import { Router } from "express";
import {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  updateBoardPositions,
  addBoardMember,
  getBoardMembers,
} from "../controllers/board.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Protect all board routes with authentication middleware
router.use(authMiddleware);

// Route to create a new board
router.route("/create").post(createBoard);

// Route to get all boards for the authenticated user
router.route("/").get(getAllBoards);


 // Changed to be under the board ID

// Route to update a specific board (e.g., title or members)
router.route("/:boardId").put(updateBoard);

// Route to delete a specific board
router.route("/:boardId").delete(deleteBoard);
router.route("/position").put(updateBoardPositions);
router.route("/add-members").post(addBoardMember);
router.route("/:boardId/members").get(getBoardMembers);
export default router;
