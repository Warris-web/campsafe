require("dotenv").config();
const mongoose = require("mongoose");
const Family   = require("../src/models/Family");
const Camper   = require("../src/models/Camper");

const FAMILIES = [
  {
    family: {
      family_name: "Adeyemi Family",
      emergency_contact_name: "Mr. Adeyemi",
      emergency_contact_phone: "+234 801 234 5678",
      cabin: "Cabin 1",
    },
    members: [
      { first_name: "Chioma",  last_name: "Adeyemi", age: 8,  role: "child", device_id: "CHILD_07", in_camp: true },
      { first_name: "Emeka",   last_name: "Adeyemi", age: 11, role: "child", device_id: null,       in_camp: true },
      { first_name: "Ngozi",   last_name: "Adeyemi", age: 38, role: "adult", device_id: "TAG_01",   in_camp: true },
    ],
  },
  {
    family: {
      family_name: "Okafor Family",
      emergency_contact_name: "Mrs. Okafor",
      emergency_contact_phone: "+234 802 345 6789",
      cabin: "Cabin 2",
    },
    members: [
      { first_name: "Tunde",  last_name: "Okafor", age: 9,  role: "child", device_id: "TAG_02", in_camp: true  },
      { first_name: "Amaka",  last_name: "Okafor", age: 7,  role: "child", device_id: null,     in_camp: true  },
      { first_name: "Biodun", last_name: "Okafor", age: 41, role: "adult", device_id: null,     in_camp: false },
    ],
  },
  {
    family: {
      family_name: "Ibrahim Family",
      emergency_contact_name: "Alhaji Ibrahim",
      emergency_contact_phone: "+234 803 456 7890",
      cabin: "Cabin 3",
    },
    members: [
      { first_name: "Fatima", last_name: "Ibrahim", age: 10, role: "child", device_id: null, in_camp: true },
      { first_name: "Yusuf",  last_name: "Ibrahim", age: 13, role: "child", device_id: null, in_camp: true },
    ],
  },
];

// Singles — no family
const SINGLES = [
  { first_name: "Pastor",  last_name: "Emeka",  age: 45, role: "staff",   device_id: null, in_camp: true  },
  { first_name: "Nurse",   last_name: "Bola",   age: 32, role: "medical", device_id: null, in_camp: true  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_LOCAL_URI || "mongodb://127.0.0.1:27017/campsafe");
  await Family.deleteMany({});
  await Camper.deleteMany({});

  for (const { family, members } of FAMILIES) {
    const f = await Family.create(family);
    for (const m of members) {
      await Camper.create({ ...m, family_id: f._id, checked_in: true, checked_in_at: new Date() });
    }
    console.log(`✅ Seeded: ${family.family_name} (${members.length} members)`);
  }

  for (const s of SINGLES) {
    await Camper.create({ ...s, family_id: null, checked_in: true, checked_in_at: new Date() });
    console.log(`✅ Seeded single: ${s.first_name} ${s.last_name}`);
  }

  console.log("🌱 Seed complete");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
