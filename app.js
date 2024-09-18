const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const messageModel = require("./models/messageModel");
const usersModel = require("./models/usermodel");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const mongooseConnection = require("./config/mongoose-connection");
const userModel = require("./models/usermodel");

const http = require("http");
const usersRouters = require("./routes/userRoute");
let port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use("/user", usersRouters);

const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

var usp = io.of("/user-namespace");

usp.on("connection", async (socket) => {
  console.log("user connected");
  var userId = socket.handshake.auth.token;

  await userModel.findOneAndUpdate(
    { _id: userId },
    { $set: { is_online: '1' }},
    { new: true }
  );

  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async () => {
    console.log("user disconnected");

    await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { is_online: '0' }},
      { new: true }
    );

    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  // New chat
  socket.on("newChat", (chat) => {
    socket.broadcast.emit('loadNewChat', chat);
  });

  // Existing chats
  socket.on('existschat', async (data) => {
    const chats = await messageModel.find({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id }
      ]
    });

    socket.emit('loadchats', { chats: chats });
  });

  //delete message
  socket.on('messageDeleted', (data) => {
    socket.broadcast.emit('messageDeleted',data)
  })
});

app.get("/", (req, res) => {
  res.render("login");
});



app.post("/save", async (req, res) => {
  try {
    const newChat = await messageModel.create({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: req.body.message
    });
    res.status(200).send({ success: true, msg: "Message sent", data: newChat });
  } catch (err) {
    res.status(400).send({ success: false, msg: err.message });
  }
});

app.post('/delete-message', async (req, res) => {
  const { messageId, sender_id } = req.body;
  console.log(`message id = ${messageId} and sender id = ${sender_id}`)
  try {
    const message = await messageModel.findOne({ _id: messageId, sender_id: sender_id });
    
    
    if (!message) {
      return res.json({ success: false, msg: 'Message not found or you do not have permission to delete it.' });
    }
    
    await messageModel.findByIdAndDelete(messageId);
    
    res.json({ success: true, msg: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.json({ success: false, msg: 'An error occurred while deleting the message.' });
  }
});

server.listen(port, () => {
  console.log(`server running on port ${port}`);
});