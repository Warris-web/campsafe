require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");
const User = require("../src/models/User");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  await mongoose.connect(process.env.MONGO_LOCAL_URI);

  const username = (await ask("Admin username: ")).trim().toLowerCase();
  const password = await ask("Admin password: ");
  const full_name = await ask("Full name (optional): ");

  const existing = await User.findOne({ username });
  if (existing) {
    console.log("❌ That username already exists.");
    process.exit(1);
  }

  const password_hash = await User.hashPassword(password);
  await User.create({ username, password_hash, role: "admin", full_name });

  console.log(`✅ Admin account "${username}" created.`);
  rl.close();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });