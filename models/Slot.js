const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  booked: { type: Boolean, default: false },
  student: { 
    type: mongoose.Schema.Types.Mixed, // ✅ allow storing student object (name, email, goals)
    default: null 
  },
});

module.exports = mongoose.model("Slot", slotSchema);
