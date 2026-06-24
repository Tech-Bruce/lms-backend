const Slot = require("../models/Slot");
const { sendEmail } = require("../service/EmailHandler");

// ✅ Create Slot
exports.createSlot = async (req, res) => {
  try {
    const { mentorId, start, end } = req.body;
    if (!mentorId || !start || !end) {
      return res.status(400).json({ error: "All fields required" });
    }

    const slot = await Slot.create({
      mentor: mentorId,
      start,
      end,
      booked: false,
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get All Mentors & Slots
exports.getMentorsWithSlots = async (req, res) => {
  try {
    const slots = await Slot.find().populate("mentor", "name email role");
    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: "Error fetching slots", error });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slotId, student } = req.body;

    if (!slotId || !student) {
      return res.status(400).json({ error: "Slot ID and student required" });
    }

    // ✅ Fetch slot with mentor details
    const slot = await Slot.findById(slotId).populate("mentor", "name email");
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    if (slot.booked) {
      return res.status(400).json({ error: "Slot already booked" });
    }
    const {start,end}=slot;
    const { name: mentorName, email: mentorEmail } = slot.mentor;
    const { name: stuName, email: stuEmail, goals } = student;


    // ✅ Mark slot as booked
    slot.booked = true;
    slot.student = student; // works if schema allows object or ObjectId
    await slot.save();

    // ✅ Email payload for mentor
    const payload = {
      to: mentorEmail,
      subject: `Your slot has been booked by ${stuName}`,
      text: `
  Hi ${mentorName},

  Good news! Your mentorship slot has just been booked.

  📅 Slot ID: ${slot._id}
  🕒 Timing: ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}
  👨‍🎓 Student: ${stuName} (${stuEmail})
  🎯 Student Goals: ${goals || "Not provided"}

  Please connect with the student as scheduled.

  Best regards,  
  Mentorship Team
      `,
      html: `
      <p>Hi <strong>${mentorName}</strong>,</p>
      <p>Good news! Your mentorship slot has just been booked.</p>
      <ul>
        <li><b>📅 Slot ID:</b> ${slot._id}</li>
        <li><b>🕒 Timing:</b> ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}</li>
        <li><b>👨‍🎓 Student:</b> ${stuName}</li>
        <li><b>👨‍🎓 Email:</b> ${stuEmail}</li>
        <li><b>🎯 Student Goal:</b> ${goals || "Not provided"}</li>
      </ul>
      <p>Please connect with the student as scheduled.</p>
      <p>Best regards,<br/>Mentorship Team</p>
      `,
    };

    await sendEmail(payload);

    res.json({ message: "Slot booked successfully & mentor notified", slot });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ✅ Mentor Notifications
exports.getMentorSlots = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const slots = await Slot.find({ mentor: mentorId }).populate(
      "mentor",
      "name email"
    );
    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentor slots", error });
  }
};
