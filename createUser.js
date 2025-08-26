const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    const user = await User.create({
      username: "roshan",
      email: "roshan@example.com",
      password: "123456", // not hashed here, just demo
    });

    console.log("🎉 User created:", user);
    mongoose.connection.close();
  })
  .catch((err) => console.error(err));
