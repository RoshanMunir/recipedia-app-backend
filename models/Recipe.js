const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  baseServings: {
    type: Number,
    required: true,
    default: 1 // 👈 Default to 1 serving if not provided
  },
  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true,
      },
      quantity: {
        type: String,
        required: true,
      }
    }
  ],
  instructions: {
    type: String,
    required: true,
  },
  time_required: {
    type: Number, // in minutes
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  }
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);
