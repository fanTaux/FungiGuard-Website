const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, default: 'SleepWell Hub' },
  icon: { type: String, default: 'router' },
  color: { type: String, default: 'bg-[#e6ceb3]/30 text-[#8c7462]' },
  lastStatus: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
