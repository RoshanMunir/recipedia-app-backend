const mongoose = require("mongoose");

const cookingHistorySchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // who cooked

    recipe: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Recipe", 
      required: true 
    }, // what recipe

    servings: { 
      type: Number, 
      required: true 
    }, // how many people

    missingIngredients: [
      {
        type: String, // e.g. "Onion (2 pcs)"
      }
    ],

    cookedAt: { 
      type: Date, 
      default: Date.now 
    } // when
  },
  { timestamps: true } // also adds createdAt & updatedAt
);

module.exports = mongoose.model("CookingHistory", cookingHistorySchema);
