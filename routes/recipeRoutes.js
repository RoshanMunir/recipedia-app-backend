const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const Ingredient = require("../models/Ingredient");


router.post("/find-recipes", async (req, res) => {
  try {
    
    const availableIngredients = req.body.ingredients; 
    

    
    const ingredients = await Ingredient.find({ name: { $in: availableIngredients } });
    const ingredientIds = ingredients.map(ing => ing._id);

    
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
