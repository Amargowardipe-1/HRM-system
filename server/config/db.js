const mongoose = require("mongoose");
const dns = require("dns");

// Use Google Public DNS to avoid querySrv ECONNREFUSED from local ISP/Wi-Fi DNS
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
    // ignore if restricted
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
