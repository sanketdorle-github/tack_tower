import mongoose, { Schema } from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    position: { type: Number, default: 0 },
    dueDate: { type: Date },
    labels: [{ type: String }],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
//modified the required true for positon in this
// position:{
// required:true}

export const Card = mongoose.model("Card", CardSchema);
