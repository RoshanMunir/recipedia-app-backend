const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Recipe = require("./models/Recipe");
const Ingredient = require("./models/Ingredient");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for Seeding..."))
  .catch(err => console.log(err));

async function seed() {
  try {
    // Clear old data
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});

    // Ingredients
    const chicken = new Ingredient({ name: "Chicken", type: "Meat" });
    const tomato = new Ingredient({ name: "Tomato", type: "Vegetable" });
    const onion = new Ingredient({ name: "Onion", type: "Vegetable" });
    const egg = new Ingredient({ name: "Egg", type: "Protein" });
    const bread = new Ingredient({ name: "Bread", type: "Grain" });

    await chicken.save();
    await tomato.save();
    await onion.save();
    await egg.save();
    await bread.save();

    // Recipes with baseServings
    const chickenCurry = new Recipe({
      name: "Chicken Curry",
      baseServings: 2, // 👈 default servings
      ingredients: [
        { ingredient: chicken._id, quantity: "500g" },
        { ingredient: tomato._id, quantity: "2 pcs" },
        { ingredient: onion._id, quantity: "1 large" }
      ],
      instructions: "Cook chicken with onion and tomato, add spices and simmer.",
      time_required: 30,
      difficulty: "Easy"
    });

    const tomatoSoup = new Recipe({
      name: "Tomato Soup",
      baseServings: 2,
      ingredients: [
        { ingredient: tomato._id, quantity: "4 pcs" },
        { ingredient: onion._id, quantity: "1 medium" }
      ],
      instructions: "Boil tomatoes and onion, blend them, and season with salt and pepper.",
      time_required: 20,
      difficulty: "Easy"
    });

    const omelette = new Recipe({
      name: "Onion Omelette",
      baseServings: 1,
      ingredients: [
        { ingredient: egg._id, quantity: "2 pcs" },
        { ingredient: onion._id, quantity: "1 small" },
        { ingredient: tomato._id, quantity: "1 small" }
      ],
      instructions: "Beat eggs, add chopped onion and tomato, then fry until golden.",
      time_required: 10,
      difficulty: "Easy"
    });

    const sandwich = new Recipe({
      name: "Egg Sandwich",
      baseServings: 1,
      ingredients: [
        { ingredient: egg._id, quantity: "2 pcs" },
        { ingredient: bread._id, quantity: "2 slices" },
        { ingredient: onion._id, quantity: "1 small" }
      ],
      instructions: "Boil eggs, slice them, add onion, and place in bread slices.",
      time_required: 15,
      difficulty: "Easy"
    });

    await chickenCurry.save();
    await tomatoSoup.save();
    await omelette.save();
    await sandwich.save();

    console.log("✅ Database Seeded with Recipes (with baseServings)!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding Error:", error);
    mongoose.connection.close();
  }
}

seed();
