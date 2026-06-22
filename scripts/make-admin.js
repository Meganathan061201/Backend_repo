require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const email = process.argv[2];

if (!email) {
  // console.error("Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

(async () => {
  await connectDB();
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });

  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  console.log(`${user.email} is now admin`);
  process.exit(0);
})();


