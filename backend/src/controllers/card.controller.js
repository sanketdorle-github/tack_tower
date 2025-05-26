import { Card } from "../models/Card.js";
import { List } from "../models/List.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Board } from "../models/Board.js";

// Create a new card in a list
const createCard = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;
  const { title, description, dueDate, labels, assignedTo } = req.body;

  if (!title) {
    return next(new ApiError(400, "Title and position are required"));
  }
  // if (!title || position === undefined) {
  //   return next(new ApiError(400, "Title and position are required"));
  // }

  if (!mongoose.Types.ObjectId.isValid(listId)) {
    return next(new ApiError(400, "Invalid list ID"));
  }

  const list = await List.findById(listId);
  if (!list) {
    return next(new ApiError(404, "List not found"));
  }

  // Dynamically calculate the position based on the number of existing cards
  const position = list.cards.length;
  const card = await Card.create({
    title,
    description,
    listId,
    dueDate,
    labels,
    assignedTo,
    position,
  });
  // const card = await Card.create({
  //   title,
  //   description,
  //   listId,
  //   dueDate,
  //   labels,
  //   assignedTo,
  //   position,
  // });

  list.cards.push(card._id);
  await list.save();

  res.status(201).json(new ApiResponse(201, card, "Card created successfully"));
});

// Get all cards in a list
const getCardsByList = asyncHandler(async (req, res, next) => {
  const { listId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(listId)) {
    return next(new ApiError(400, "Invalid list ID"));
  }

  const cards = await Card.find({ listId }).sort({ position: 1 });

  res.json(new ApiResponse(200, cards, "Cards fetched successfully"));
});

// Update a card
const updateCard = asyncHandler(async (req, res, next) => {
  const { cardId } = req.params;
  const { title, description, dueDate, labels, assignedTo, position, listId } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return next(new ApiError(400, "Invalid card ID"));
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return next(new ApiError(404, "Card not found"));
  }

  if (title !== undefined) card.title = title;
  if (description !== undefined) card.description = description;
  if (dueDate !== undefined) card.dueDate = dueDate;
  if (labels !== undefined) card.labels = labels;
  if (assignedTo !== undefined) card.assignedTo = assignedTo;
  if (position !== undefined) card.position = position;

  // Move to a different list (optional)
  if (listId && listId !== card.listId.toString()) {
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      return next(new ApiError(400, "Invalid new list ID"));
    }

    const newList = await List.findById(listId);
    if (!newList) {
      return next(new ApiError(404, "Target list not found"));
    }

    // Remove card from old list
    await List.findByIdAndUpdate(card.listId, {
      $pull: { cards: card._id },
    });

    // Add to new list
    newList.cards.push(card._id);
    await newList.save();

    card.listId = listId;
  }

  await card.save();

  res.json(new ApiResponse(200, card, "Card updated successfully"));
});

// Delete a card
const deleteCard = asyncHandler(async (req, res, next) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return next(new ApiError(400, "Invalid card ID"));
  }

  const card = await Card.findById(cardId);
  if (!card) {
    return next(new ApiError(404, "Card not found"));
  }

  // Remove card reference from list
  await List.findByIdAndUpdate(card.listId, {
    $pull: { cards: card._id },
  });

  await card.deleteOne();

  res.json(new ApiResponse(200, null, "Card deleted successfully"));
});

// const moveTask = asyncHandler(async (req, res, next) => {
//   const { cardId } = req.params;
//   const {
//     sourceListId,
//     targetListId,
//     sourcePosition,
//     targetPosition,
//   } = req.body;

//   // Validate card ID
//   if (!mongoose.Types.ObjectId.isValid(cardId)) {
//     return next(new ApiError(400, "Invalid card ID"));
//   }

//   // Check if the card exists
//   const task = await Card.findById(cardId);
//   if (!task) {
//     return next(new ApiError(404, "Card not found"));
//   }

//   // Fetch lists without Mongoose doc overhead
//   const sourceList = await List.findById(sourceListId).lean();
//   const targetList = await List.findById(targetListId).lean();

//   if (!sourceList || !targetList) {
//     return next(new ApiError(404, "Source or target list not found"));
//   }

//   // Remove card from source list
//   const updatedSourceCards = sourceList.cards
//     .map((id) => id.toString())
//     .filter((id) => id !== cardId);

//   // Add card to target list at correct position
//   const updatedTargetCards = targetList.cards.map((id) => id.toString());
//   updatedTargetCards.splice(targetPosition, 0, cardId);

//   // Update lists (bypasses versioning errors)
//   await List.updateOne(
//     { _id: sourceListId },
//     { $set: { cards: updatedSourceCards } }
//   );

//   await List.updateOne(
//     { _id: targetListId },
//     { $set: { cards: updatedTargetCards } }
//   );

//   // Update card positions in target list
//   await Promise.all(
//     updatedTargetCards.map((id, index) =>
//       Card.findByIdAndUpdate(id, {
//         position: index,
//         listId: targetListId,
//       })
//     )
//   );

//   // Update card positions in source list (if different)
//   if (sourceListId !== targetListId) {
//     await Promise.all(
//       updatedSourceCards.map((id, index) =>
//         Card.findByIdAndUpdate(id, {
//           position: index,
//         })
//       )
//     );
//   }

//   res.status(200).json(
//     new ApiResponse(200, null, "Card moved successfully")
//   );
// });
const moveTask = async (req, res) => {
  const { sourceListId, targetListId, sourceCardOrder, targetCardOrder } =
    req.body;
  const { cardId } = req.params;

  if (!sourceListId || !targetListId) {
    return res.status(400).json({ message: "Missing list IDs" });
  }

  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // If list changed, update the card’s listId
    if (card.listId.toString() !== targetListId) {
      card.listId = targetListId;
      await card.save();
    }

    // Update both lists’ card order
    await List.findByIdAndUpdate(sourceListId, {
      cards: sourceCardOrder,
    });

    await List.findByIdAndUpdate(targetListId, {
      cards: targetCardOrder,
    });

    res.status(200).json({ message: "Card moved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
//Reorder cards (within list or across lists)
const reorderCards = async (req, res) => {
  try {
    const { cardId } = req.params;
    const {
      sourceListId,
      destinationListId,
      sourceCardOrder,
      destinationCardOrder,
    } = req.body;

    if (
      !sourceListId ||
      !destinationListId ||
      !sourceCardOrder ||
      !destinationCardOrder
    ) {
      return res.status(400).json({ message: "Missing required data." });
    }

    const sourceList = await List.findById(sourceListId);
    const destList = await List.findById(destinationListId);

    if (!sourceList || !destList) {
      return res.status(404).json({ message: "List not found." });
    }

    const board = await Board.findById(destList.boardId);
    if (board.owner !== req.userId && !board.members.includes(req.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // If card moved to a different list, update its list field
    if (sourceListId !== destinationListId) {
      await Card.findByIdAndUpdate(cardId, {
        listId: destinationListId,
      });
    }

    // Update positions in source list
    const sourceUpdates = sourceCardOrder.map((id, index) =>
      Card.findByIdAndUpdate(id, {
        position: index,
        list: sourceListId,
      })
    );

    // Update positions in destination list
    const destUpdates = destinationCardOrder.map((id, index) =>
      Card.findByIdAndUpdate(id, {
        position: index,
        list: destinationListId,
      })
    );

    await Promise.all([...sourceUpdates, ...destUpdates]);

    res.status(200).json({ message: "Task moved and reordered successfully" });
  } catch (err) {
    console.error("Reorder Cards Error:", err);
    res.status(500).json({ message: "Failed to reorder tasks" });
  }
};

export {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard,
  moveTask,
  reorderCards,
};
