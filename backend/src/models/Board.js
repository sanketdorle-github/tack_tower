import mongoose, { Schema } from "mongoose";

const boardSchema = new Schema(
  {
    title: { type: String, required: true },
    color: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model("Board", boardSchema);
