import mongoose, { Schema } from "mongoose";

const listSchema = new Schema(
  {
    title: { type: String, required: true },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    position: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

//modified the required true for positon in this
// position:{
// required:true}
export const List = mongoose.model("List", listSchema);
