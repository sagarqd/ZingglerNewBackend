const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Import routes
const authRoute = require("./router/auth");
const profileRoute = require("./router/profile");
const groupRoute = require("./router/group");
const courseRoute = require("./router/course");
const resetPassword = require("./router/passwordRoutes");
const videoRoute = require("./router/videoRoutes");
const studentRoute = require("./router/studentRoutes");
const teacherRoute = require("./router/teacherRoutes");
const staffRoute = require("./router/staffRoutes")
// Import Course model
const Course = require("./models/course");
const s3 = new AWS.S3();

// Load environment variables
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1', // change according to your bucket
});

// Signed URL to generate root
app.get('/generate-upload-url', (req, res) => {
  const fileName = `${uuidv4()}.mp4`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    ContentType: 'video/mp4',
    Expires: 60 * 5,
  };

  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Signed URL ');
    }
    res.json({ url, fileName });
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("DB connected Successfully"))
  .catch((error) => console.log("DB unable to connect", error));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Express!");
});

// Course route
// app.get("/api/courses/:slug", async (req, res) => {
//   const { slug } = req.params;
//   try {
//     const course = await Course.findOne({ slug }).exec();
//     if (course) {
//       res.json({
//         courseFullName:
//           course.general?.courseInformation?.courseFullName || "Not available",
//         courseVideo:
//           course.description?.thumbnail?.courseVideo || "Not available",
//       });
//     } else {
//       res.status(404).json({ message: "Course not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

//
//////////
// Use route files
app.use("/api/auth", authRoute);
app.use("/api", profileRoute);
app.use("/api", groupRoute);
app.use("/api", courseRoute);
app.use("/api", resetPassword);
app.use("/api/video", videoRoute);
app.use("/api/student", studentRoute);
app.use("/api/teacher", teacherRoute)
app.use("/api/staff",staffRoute )



// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001","http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Socket.IO setup
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomToParticipantsMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", (data) => {
    const { email, roomID } = data;

    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    if (!roomToParticipantsMap.has(roomID)) {
      roomToParticipantsMap.set(roomID, new Set());
    }

    roomToParticipantsMap.get(roomID).add(email);
    socket.join(roomID);

    io.to(roomID).emit("user:joined", { email, id: socket.id });
    io.to(roomID).emit(
      "update:participants",
      Array.from(roomToParticipantsMap.get(roomID))
    );
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("disconnect", () => {
    const email = socketidToEmailMap.get(socket.id);
    socketidToEmailMap.delete(socket.id);

    for (const [roroomIDom, participants] of roomToParticipantsMap.entries()) {
      if (participants.has(email)) {
        participants.delete(email);
        io.to(roomID).emit("update:participants", Array.from(participants));
        if (participants.size === 0) {
          roomToParticipantsMap.delete(roomID);
        }
        break;
      }
    }

    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

// Start server on the specified port
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
