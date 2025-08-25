const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const Ingredient = require("../models/Ingredient");

// POST /find-recipes
router.post("/find-recipes", async (req, res) => {
  try {
    // Here we take ingredients from frontend (React, mobile app etc.)
    const availableIngredients = req.body.ingredients; 
    // e.g. ["Chicken", "Tomato", "Onion"]

    // 1. Find matching ingredient IDs
    const ingredients = await Ingredient.find({ name: { $in: availableIngredients } });
    const ingredientIds = ingredients.map(ing => ing._id);

    // 2. Find recipes that use all these ingredients
    const recipes = await Recipe.find({
      "ingredients.ingredient": { $all: ingredientIds }
    }).populate("ingredients.ingredient");

    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
