import { Board } from "../models/Board.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Create a new board
const createBoard = async (req, res, next) => {
  const { title, members = [], color } = req.body;

  try {
    // Check if title is provided
    if (!title) {
      return next(new ApiError(400, "Board title is required"));
    }

    // Create a new board
    const newBoard = new Board({
      title,
      createdBy: req.user.userId, // Get the user ID from the authenticated user
      members: [req.user.userId, ...members], // Add the creator as the first member
      color,
    });

    await newBoard.save();

    // Return a response
    res
      .status(201)
      .json(new ApiResponse(201, newBoard, "Board created successfully"));
  } catch (err) {
    return next(
      new ApiError(500, "Server error while creating the board", [], err.stack)
    );
  }
};

// Get all boards for the authenticated user
const getAllBoards = async (req, res, next) => {
  try {
    // Find boards where the user is a member
    const boards = await Board.find({
      members: req.user.userId,
    });

    if (boards.length === 0) {
      return next(new ApiError(404, "No boards found"));
    }

    res.json(new ApiResponse(200, boards, "Boards retrieved successfully"));
  } catch (err) {
    return next(
      new ApiError(500, "Server error while retrieving boards", [], err.stack)
    );
  }
};

// Get a specific board by ID
const getBoardById = async (req, res, next) => {
  const { boardId } = req.params;

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      return next(new ApiError(404, "Board not found"));
    }

    // Ensure that the user is a member of the board
    if (!board.members.includes(req.user.userId)) {
      return next(
        new ApiError(403, "Access denied: You are not a member of this board")
      );
    }

    res.json(new ApiResponse(200, board, "Board retrieved successfully"));
  } catch (err) {
    return next(
      new ApiError(
        500,
        "Server error while retrieving the board",
        [],
        err.stack
      )
    );
  }
};

// Update a board (e.g., update title or members)
const updateBoard = async (req, res, next) => {
  const { boardId } = req.params;
  const { title, members } = req.body;

  try {
    const board = await Board.findById(boardId);

    if (!board) {
      return next(new ApiError(404, "Board not found"));
    }

    // Ensure the user is the creator or a member of the board
    if (board.createdBy.toString() !== req.user.userId) {
      return next(
        new ApiError(403, "You are not authorized to update this board")
      );
    }

    // Update the board fields
    if (title) board.title = title;
    if (members) board.members = members;

    await board.save();

    res.json(new ApiResponse(200, board, "Board updated successfully"));
  } catch (err) {
    return next(
      new ApiError(500, "Server error while updating the board", [], err.stack)
    );
  }
};

// Delete a board
const deleteBoard = async (req, res, next) => {
  const { boardId } = req.params;

  try {
    // Check if boardId is valid
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return next(new ApiError(400, "Invalid board ID"));
    }

    const board = await Board.findById(boardId);

    if (!board) {
      return next(new ApiError(404, "Board not found"));
    }

    // Ensure the user is the creator
    if (board.createdBy.toString() !== req.user.userId) {
      return next(
        new ApiError(403, "You are not authorized to delete this board")
      );
    }

    await board.deleteOne();

    res.json(new ApiResponse(200, null, "Board deleted successfully"));
  } catch (err) {
    console.error("Error deleting board:", err);
    return next(
      new ApiError(500, "Server error while deleting the board", [], err.stack)
    );
  }
};

const updateBoardPositions = asyncHandler(async (req, res, next) => {
  const { boards } = req.body; // Array of { id, position }

  if (!Array.isArray(boards) || boards.length === 0) {
    return next(new ApiError(400, "Boards array is required"));
  }

  // Validate all board IDs and positions
  for (const item of boards) {
    if (
      !item.id ||
      !mongoose.Types.ObjectId.isValid(item.id) ||
      typeof item.position !== "number"
    ) {
      return next(new ApiError(400, "Invalid board ID or position in array"));
    }
  }

  const updatePromises = boards.map(({ id, position }) =>
    Board.findByIdAndUpdate(id, { position }, { new: true })
  );

  const updatedBoards = await Promise.all(updatePromises);

  res.json(
    new ApiResponse(200, updatedBoards, "Board positions updated successfully")
  );
});

const addBoardMember = asyncHandler(async (req, res, next) => {
  const { boardId, userId } = req.body;

  // Validate input
  if (!boardId || !userId) {
    throw new ApiError(400, "Board ID and User ID are required");
  }

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid Board ID or User ID format");
  }

  // Find board and check if it exists
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  // Check if the requesting user has permission (must be board creator or admin)
  if (board.createdBy.toString() !== req.user.userId) {
    throw new ApiError(403, "You don't have permission to add members to this board");
  }

  // Find user and check if they exist
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is already a member using proper MongoDB comparison
  const isMember = board.members.some(memberId => memberId.toString() === userId);
  if (isMember) {
    throw new ApiError(400, "User is already a member of this board");
  }

  try {
    // Add user to board's members
    board.members.push(userId);
    await board.save();

    // Add board to user's boards
    if (!user.boards.includes(boardId)) {
      user.boards.push(boardId);
      await user.save();
    }

    // Return the updated board with populated members
    const updatedBoard = await Board.findById(boardId)
      .populate('members', 'name email avatar')
      .exec();

    const response = new ApiResponse(
      200,
      updatedBoard.members,
      "User added to board successfully"
    );
    res.json(response);
  } catch (error) {
    throw new ApiError(
      500,
      "Error adding member to board",
      [],
      error.stack
    );
  }
});

const getBoardMembers = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  console.log("boardId", boardId);

  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    throw new ApiError(400, "Invalid board ID");
  }

  const board = await Board.findById(boardId)
    .populate('members', 'name email avatar') // Only get necessary fields
    .exec();
  console.log("board controller", board);
  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  // Check if the requesting user is a member of the board
  if (!board.members.some(member => member._id.toString() === req.user.userId)) {
    throw new ApiError(403, "You don't have permission to view this board's members");
  }

  const response = new ApiResponse(
    200, 
    board.members, 
    "Board members retrieved successfully"
  );
  res.json(response);
});

export {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  updateBoardPositions,
  addBoardMember,
  getBoardMembers,
};
