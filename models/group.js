const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  groupDescription: { type: String, required: true },
  noOfMembers: { type: Number, default: 0 } // Example field
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
