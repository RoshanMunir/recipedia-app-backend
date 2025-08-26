const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String }, 
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Ingredient", ingredientSchema);
