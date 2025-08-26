const mongoose = require("mongoose");
const dotenv = require("dotenv");
const readline = require("readline");
const bcrypt = require("bcrypt");

// Models
const User = require("./models/User");
const Recipe = require("./models/Recipe");
const CookingHistory = require("./models/CookingHistory");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper: ask question
const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

// ========== LOGIN / SIGNUP FLOW ==========
async function signup() {
  const username = await ask("👤 Enter username: ");
  const email = await ask("📧 Enter email: ");
  const password = await ask("🔑 Enter password: ");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, email, password: hashedPassword });
  await user.save();

  console.log("✅ Signup successful!");
  return user;
}

async function login() {
  const email = await ask("📧 Enter email: ");
  const password = await ask("🔑 Enter password: ");

  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ No user found with this email.");
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ Wrong password.");
    return null;
  }

  console.log(`✅ Welcome back, ${user.username}!`);
  return user;
}

// ========== APP MAIN FLOW ==========
async function main() {
  let userChoice = await ask("👉 Do you have an account? (yes/no): ");

  let currentUser;
  if (userChoice.toLowerCase() === "no") {
    currentUser = await signup();
  } else {
    currentUser = await login();
    if (!currentUser) {
      console.log("⚠️ Login failed, exiting...");
      process.exit();
    }
  }

  // After login/signup → continue app
  console.log(`👋 Hello ${currentUser.username}, let's cook!`);

  const availableIngredientsInput = await ask(
    "🥕 Enter available ingredients (comma separated): "
  );
  const availableIngredients = availableIngredientsInput
    .split(",")
    .map((i) => i.trim().toLowerCase());

  const recipes = await Recipe.find().populate("ingredients.ingredient");
  const possibleRecipes = recipes.filter((recipe) =>
    recipe.ingredients.every((ing) =>
      availableIngredients.includes(ing.ingredient.name.toLowerCase())
    )
  );

  if (possibleRecipes.length === 0) {
    console.log("❌ No recipes found with your ingredients.");
    rl.close();
    mongoose.disconnect();
    return;
  }

  console.log("\n🍲 Recipes you can cook:");
  possibleRecipes.forEach((r, i) => console.log(`${i + 1}. ${r.name}`));

  const choice = await ask("👉 Pick a recipe number to cook: ");
  const recipe = possibleRecipes[parseInt(choice) - 1];

  if (!recipe) {
    console.log("❌ Invalid choice.");
    rl.close();
    mongoose.disconnect();
    return;
  }

  const servings = await ask("👨‍👩‍👧‍👦 How many servings? ");
  console.log(`\n✅ Cooking ${recipe.name} for ${servings} servings...`);

  // Save to cooking history
  const history = new CookingHistory({
    user: currentUser._id,
    recipe: recipe._id,
    servings,
  });
  await history.save();

  console.log("📝 Cooking history saved!");

  rl.close();
  mongoose.disconnect();
}

main();
