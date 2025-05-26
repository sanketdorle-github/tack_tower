import { List } from "../models/List.js";
import { Board } from "../models/Board.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Card } from "../models/Card.js";

// Create a new list in a board
const createList = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const { boardId } = req.params;

  if (!title || !boardId) {
    return next(new ApiError(400, "Title, boardId,  are required"));
  }

  // const { title, position } = req.body;
  // const { boardId } = req.params;

  // if (!title || !boardId || position === undefined) {
  //   return next(new ApiError(400, "Title, boardId, and position are required"));
  // }
  console.log("board id ", boardId);

  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    return next(new ApiError(400, "Invalid board ID"));
  }

  const board = await Board.findById(boardId);
  if (!board) {
    return next(new ApiError(404, "Board not found"));
  }

  const list = await List.create({ title, boardId });
  // const list = await List.create({ title, boardId, position });

  res.status(201).json(new ApiResponse(201, list, "List created successfully"));
});
// Get all lists in a board with properly organized cards
const getListsByBoard = asyncHandler(async (req, res, next) => {
  const { boardId } = req.params;

  // Validate board ID
  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    return next(new ApiError(400, "Invalid board ID"));
  }

  try {
    // First get all lists for the board
    const lists = await List.find({ boardId }).sort({ position: 1 }).lean();

    if (!lists || lists.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No lists found for this board"));
    }

    // Get all cards for this board, sorted by position
    const cards = await Card.find({
      listId: { $in: lists.map((list) => list._id) },
    })
      .sort({ position: 1 })
      .lean();

    // Organize cards into their respective lists
    const listsWithCards = lists.map((list) => ({
      ...list,
      cards: cards.filter(
        (card) => card.listId.toString() === list._id.toString()
      ),
    }));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          listsWithCards,
          "Lists with cards fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching board lists:", error);
    return next(new ApiError(500, "Failed to fetch board lists"));
  }
});
// Update a list
const updateList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { title, position } = req.body;

  if (!mongoose.Types.ObjectId.isValid(listId)) {
    return next(new ApiError(400, "Invalid list ID"));
  }

  const list = await List.findById(listId);
  if (!list) {
    return next(new ApiError(404, "List not found"));
  }

  if (title !== undefined) list.title = title;
  if (position !== undefined) list.position = position;

  await list.save();

  res.json(new ApiResponse(200, list, "List updated successfully"));
});

// Delete a list
const deleteList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(listId)) {
    return next(new ApiError(400, "Invalid list ID"));
  }

  const list = await List.findById(listId);
  if (!list) {
    return next(new ApiError(404, "List not found"));
  }

  await list.deleteOne();

  res.json(new ApiResponse(200, null, "List deleted successfully"));
});

// move list positoion
const moveColumn = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { sourcePosition, targetPosition } = req.body;

  if (!mongoose.Types.ObjectId.isValid(listId)) {
    return next(new ApiError(400, "Invalid column ID"));
  }

  const movingColumn = await List.findById(listId);
  if (!movingColumn) {
    return next(new ApiError(404, "Column not found"));
  }

  const allLists = await List.find({ boardId: movingColumn.boardId }).sort(
    "position"
  );

  // Remove the column from the list
  const updatedLists = allLists.filter(
    (list) => list._id.toString() !== listId
  );

  // Re-insert at new position
  updatedLists.splice(targetPosition, 0, movingColumn);

  // Reassign positions
  for (let i = 0; i < updatedLists.length; i++) {
    await List.findByIdAndUpdate(updatedLists[i]._id, { position: i });
  }

  res.status(200).json(new ApiResponse(200, null, "Column moved successfully"));
});

export { createList, getListsByBoard, updateList, deleteList, moveColumn };
