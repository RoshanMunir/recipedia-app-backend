const mongoose = require("mongoose");
const dotenv = require("dotenv");
const readline = require("readline");
const Recipe = require("./models/Recipe");
const Ingredient = require("./models/Ingredient");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// CLI input setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ✅ Improved scaling helper: supports ranges & multiple numbers
function scaleQuantity(quantity, factor) {
  return quantity.replace(/(\d+(\.\d+)?)/g, (match) => {
    const num = parseFloat(match);
    const scaled = (num * factor).toFixed(1);
    return scaled.endsWith(".0") ? scaled.slice(0, -2) : scaled;
  });
}

async function run() {
  const availableIngredients = ["Tomato"]; // 👈 Change this list to simulate what the user has

  // Find available ingredients in DB
  const ingredients = await Ingredient.find({ name: { $in: availableIngredients } });
  const ingredientIds = ingredients.map(ing => ing._id);

  // Find recipes that use at least 1 available ingredient
  const recipes = await Recipe.find({
    "ingredients.ingredient": { $in: ingredientIds }
  }).populate("ingredients.ingredient");

  if (recipes.length === 0) {
    console.log("❌ No recipes found with your ingredients.");
    mongoose.connection.close();
    return;
  }

  console.log("\n🍽️ Possible Recipes:\n");

  // Build recipes with missing/available info
  const results = recipes.map(recipe => {
    let haveCount = 0;
    let missing = [];

    recipe.ingredients.forEach(ing => {
      const hasIt = availableIngredients.includes(ing.ingredient.name);
      if (hasIt) haveCount++;
      else missing.push(ing);
    });

    return {
      recipe,
      missing,
      haveCount,
      canCookNow: missing.length === 0
    };
  });

  // Sort so cookable recipes come first
  results.sort((a, b) => {
    if (a.canCookNow && !b.canCookNow) return -1;
    if (!a.canCookNow && b.canCookNow) return 1;
    return a.missing.length - b.missing.length;
  });

  // Show summary
  const cookNowCount = results.filter(r => r.canCookNow).length;
  console.log(`✅ ${cookNowCount} recipe(s) you can cook right now`);
  console.log(`⚠️ ${results.length - cookNowCount} recipe(s) you’re close to cooking\n`);

  results.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.recipe.name}`);
    console.log(`   ⏱️ Time Required: ${r.recipe.time_required} mins`);
    console.log(`   🔥 Difficulty: ${r.recipe.difficulty}`);
    console.log("   🥕 Ingredients:");

    r.recipe.ingredients.forEach((ing, i) => {
      const hasIt = availableIngredients.includes(ing.ingredient.name);
      console.log(`      ${i + 1}. ${ing.ingredient.name} (${ing.quantity}) ${hasIt ? "✅" : "❌"}`);
    });

    if (r.canCookNow) {
      console.log("   ✅ You can cook this now!");
    } else {
      console.log(`   ⚠️ Missing ${r.missing.length} ingredient(s): ${r.missing.map(m => m.ingredient.name).join(", ")}`);
    }

    console.log();
  });

  // Step 2: Ask user which recipe
  rl.question("👉 Enter recipe number to cook: ", (num) => {
    const choice = parseInt(num) - 1;
    if (choice < 0 || choice >= results.length) {
      console.log("❌ Invalid choice.");
      rl.close();
      mongoose.connection.close();
      return;
    }

    const selected = results[choice].recipe;

    // Step 3: Ask servings
    rl.question("👥 How many people are you cooking for? ", (people) => {
      const persons = parseInt(people);
      if (isNaN(persons) || persons <= 0) {
        console.log("❌ Invalid number of people.");
        rl.close();
        mongoose.connection.close();
        return;
      }

      console.log(`\n🍛 Selected Recipe: ${selected.name} (for ${persons} people)`);

      const factor = persons / (selected.baseServings || 1);
      let missingList = [];

      console.log("\n🥕 Ingredients (scaled):");
      selected.ingredients.forEach((ing, i) => {
        const hasIt = availableIngredients.includes(ing.ingredient.name);
        let scaledQuantity = scaleQuantity(ing.quantity, factor);

        console.log(
          `   ${i + 1}. ${ing.ingredient.name} (${scaledQuantity}) ${hasIt ? "✅" : "❌"}`
        );

        if (!hasIt) missingList.push(`${ing.ingredient.name} (${scaledQuantity})`);
      });

      if (missingList.length === 0) {
        console.log("\n✅ You have everything! Start cooking 🚀");
      } else {
        console.log("\n⚠️ Missing ingredients (Shopping List):");
        missingList.forEach(item => console.log("   🛒 " + item));
      }

      rl.close();
      mongoose.connection.close();
    });
  });
}

run();
