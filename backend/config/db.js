const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('');
    console.log('==============================================');
    console.log('  ACTION REQUIRED: MongoDB Atlas IP Whitelist');
    console.log('==============================================');
    console.log('  Your current IP is not whitelisted on');
    console.log('  MongoDB Atlas. To fix this:');
    console.log('');
    console.log('  1. Go to https://cloud.mongodb.com');
    console.log('  2. Login → Network Access');
    console.log('  3. Click "Add IP Address"');
    console.log('  4. Add "0.0.0.0/0" (allow from anywhere)');
    console.log('     or your specific IP address');
    console.log('  5. Click Confirm');
    console.log('');
    console.log('  The server will continue running, but');
    console.log('  database operations will fail until this');
    console.log('  is resolved.');
    console.log('==============================================');
    console.log('');
    return false;
  }
};

const getConnectionStatus = () => isConnected;

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;