// const express = require("express");
// const app = express();
// const cookieParser = require("cookie-parser");
// const messageModel = require("./models/messageModel");
// const usersModel = require("./models/usermodel");
// const cors = require("cors");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const mongooseConnection = require("./config/mongoose-connection");
// const userModel = require("./models/usermodel");

// const http = require("http");
// const usersRouters = require("./routes/userRoute");
// let port = process.env.PORT || 3000;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));
// app.use(cookieParser());
// app.set("view engine", "ejs");
// app.use("/user", usersRouters);

// const { Server } = require("socket.io");

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });

// var usp = io.of("/user-namespace");

// usp.on("connection", async (socket) => {
//   console.log("user connected");
//   var userId = socket.handshake.auth.token;

//   await userModel.findOneAndUpdate(
//     { _id: userId },
//     { $set: { is_online: '1' }},
//     { new: true }
//   );

//   socket.broadcast.emit("getOnlineUser", { user_id: userId });

//   socket.on("disconnect", async () => {
//     console.log("user disconnected");

//     await userModel.findOneAndUpdate(
//       { _id: userId },
//       { $set: { is_online: '0' }},
//       { new: true }
//     );

//     socket.broadcast.emit("getOfflineUser", { user_id: userId });
//   });

//   // New chat
//   socket.on("newChat", (chat) => {
//     socket.broadcast.emit('loadNewChat', chat);
//   });

//   // Existing chats
//   socket.on('existschat', async (data) => {
//     const chats = await messageModel.find({
//       $or: [
//         { sender_id: data.sender_id, receiver_id: data.receiver_id },
//         { sender_id: data.receiver_id, receiver_id: data.sender_id }
//       ]
//     });

//     socket.emit('loadchats', { chats: chats });
//   });

//   //delete message
//   socket.on('messageDeleted', (data) => {
//     socket.broadcast.emit('messageDeleted',data)
//   })
// });

// app.get("/", (req, res) => {
//   res.render("register");
// });



// app.post("/save", async (req, res) => {
//   try {
//     const newChat = await messageModel.create({
//       sender_id: req.body.sender_id,
//       receiver_id: req.body.receiver_id,
//       message: req.body.message
//     });
//     res.status(200).send({ success: true, msg: "Message sent", data: newChat });
//   } catch (err) {
//     res.status(400).send({ success: false, msg: err.message });
//   }
// });

// app.post('/delete-message', async (req, res) => {
//   const { messageId, sender_id } = req.body;
  
//   try {
//     const message = await messageModel.findOne({ _id: messageId, sender_id: sender_id });
    
//     if (!message) {
//       return res.json({ success: false, msg: 'Message not found or you do not have permission to delete it.' });
//     }
    
//     await messageModel.findByIdAndDelete(messageId);
    
//     res.json({ success: true, msg: 'Message deleted successfully.' });
//   } catch (error) {
//     console.error('Error deleting message:', error);
//     res.json({ success: false, msg: 'An error occurred while deleting the message.' });
//   }
// });

// server.listen(port, () => {
//   console.log(`server running on port ${port}`);
// });





//chat

// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Responsive Chat UI</title>
//   <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
//   <script src="https://cdn.tailwindcss.com"></script>
//   <script src="https://cdn.socket.io/4.0.0/socket.io.min.js"></script>
//   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
//   <style>
//     #chatbody {
//       height: calc(100vh - 160px);
//       overflow-y: auto;
//     }
//     .delete-icon {
//       display: none;
//       cursor: pointer;
//     }
//     .current-user-chat:hover .delete-icon {
//       display: inline-block;
//     }
//   </style>
// </head>
// <body class="bg-gray-100">
//   <div class="flex flex-col lg:flex-row h-screen">
    
//     <% if (user) { %>
//     <div class="w-full lg:w-1/4 bg-gray-800 p-4">
//       <div class="flex items-center mb-4">
//         <img src="<%= user.image %>" class="rounded-full mr-3 bg-no-repeat bg-cover h-10" alt="User">
//         <span class="text-white text-lg"><%= user.username %></span>
//       </div>  
//       <% } %>
//       <!-- Contact List -->
//       <% if (alluser.length > 0) { %>
//       <ul>
//         <% alluser.forEach(function(e) { %>
//           <li class="flex items-center p-3 text-white mb-2 bg-gray-700 rounded-lg cursor-pointer contact-item" data-id="<%=e._id%>" data-username="<%= e.username %>">
//             <img src="<%= e.image %>" class="rounded-full mr-3 bg-no-repeat bg-cover h-10" alt="User">
//             <div class="contact-list">
//               <p class="font-mono text-sm"><%= e.username %></p>
//               <!-- Online/Offline Status -->
//               <% if (e.is_online == "0") { %>
//                 <large class="text-gray-400">OFFLINE</large>
//               <% } else { %>
//                 <large class="text-gray-400">ONLINE</large>
//               <% } %>
//             </div>
//           </li>
//         <% }) %>
//       </ul>
//       <% } %>
//     </div>
 
//     <!-- Chat Section -->
//     <div class="w-full lg:w-3/4 flex-col hidden" id="main-frame">
//       <!-- Chat Header -->
//       <div class="bg-white px-4 py-4 lg:px-6 border-b">
//         <div class="flex items-center">
//           <img src="https://via.placeholder.com/40" class="rounded-full mr-3" alt="User">
//           <h2 class="text-base lg:text-lg" id="hg">User</h2>
//         </div>
//       </div>
//       <!-- Chat Body -->
//       <div class="flex-grow overflow-y-auto p-4 lg:p-6 bg-gray-200" id="chatbody">
//       </div>
//       <div class="bg-white p-4 border-t">
//         <div class="flex items-center">
//           <form id="chat-form">
//             <input class="w-full px-3 py-2 lg:px-4 lg:py-2 bg-gray-200 rounded-md" type="text" placeholder="Write your message..." id="message" name="message">
//             <input type="submit" class="ml-2 px-3 py-2 lg:px-4 lg:py-2 bg-blue-500 text-white rounded-md" value="Send">
//           </form>
//         </div>
//       </div>
//     </div>
//   </div>

//   <script>
//     var sender_id = '<%= user._id %>';
//     var receiver_id;
//     var socket = io("/user-namespace", {
//       auth: {
//         token: '<%= user._id %>'
//       }
//     });

//     $(document).ready(function() {
//       // Use event delegation to attach the click event to dynamically rendered elements
//       $(document).on('click', '.contact-item', function() {
//         receiver_id = $(this).data('id');
//         var username = $(this).data('username');

//         // Update the chat header with the clicked user's username
//         $('#hg').text(username);

//         // Show the chat frame
//         $("#main-frame").removeClass('hidden').addClass('flex');

//         // Load existing chats
//         socket.emit('existschat', { sender_id: sender_id, receiver_id: receiver_id });
//       });

//       $('#chat-form').submit(function(event) {
//         event.preventDefault();
        
//         var message = $('#message').val();
        
//         $.ajax({
//           url: '/save',
//           type: 'POST',
//           contentType: 'application/json',
//           data: JSON.stringify({
//             sender_id: sender_id,
//             receiver_id: receiver_id,
//             message: message
//           }),
//           success: function(response) {
//             if (response.success) {
//               let chat = response.data.message;
//               let html = `
//                 <div id="current-user-chat" class="mb-4 current-user-chat" data-id="${response.data._id}">
//                   <div class="flex items-start justify-end">
//                     <div class="bg-blue-500 text-white p-2 lg:p-3 rounded-lg relative">
//                       <p class="text-sm lg:text-base">${chat}</p>
//                       <i class="fas fa-trash-alt delete-icon text-red-500 ml-2 absolute top-1 right-1"></i>
//                     </div>
//                   </div>
//                 </div>`;
//               $('#chatbody').append(html);
//               socket.emit("newChat", response.data);
//               $('#message').val('');
//               scrollChat();
//             } else {
//               alert(response.msg);
//             }
//           },
//           error: function(xhr, status, error) {
//             console.error("AJAX error:", status, error);
//           }
//         });
//       });

//       socket.on('loadNewChat', (chat) => {
//         if (sender_id === chat.receiver_id && receiver_id === chat.sender_id) {
//           let html = `
//             <div id="distance-user-chat" class="mb-4 text-right">
//               <div class="flex items-start justify-end">
//                 <div class="bg-white p-2 lg:p-3 rounded-lg">
//                   <p class="text-sm lg:text-base">${chat.message}</p>
//                 </div>
//               </div>
//             </div>`;
//           $('#chatbody').append(html);
//           scrollChat();
//         }
//       });

//       socket.on('loadchats', (data) => {
//         $('#chatbody').html('');

//         let html = '';
//         let chats = data.chats;

//         chats.forEach(chat => {
//           let addClass = chat.sender_id == sender_id ? 'current-user-chat' : 'distance-user-chat';
//           let deleteIcon = chat.sender_id == sender_id ? '<i class="fas fa-trash-alt delete-icon text-red-500 ml-2 absolute top-1 right-1"></i>' : '';
//           html += `
//             <div class="${addClass} mb-4" data-id="${chat._id}">
//               <div class="flex items-start ${addClass === 'current-user-chat' ? 'justify-end' : ''}">
//                 <div class="${addClass === 'current-user-chat' ? 'bg-blue-500 text-white' : 'bg-white'} p-2 lg:p-3 rounded-lg relative">
//                   <p class="text-sm lg:text-base">${chat.message}</p>
//                   ${deleteIcon}
//                 </div>
//               </div>
//             </div>`;
//         });

//         $('#chatbody').append(html);
//         scrollChat();
//       });

//       // Delete message functionality
//       $(document).on('click', '.delete-icon', function() {
//         let messageId = $(this).closest('.current-user-chat').data('id');
//         if (confirm('Are you sure you want to delete this message?')) {
//           $.ajax({
//             url: '/delete-message',  // You need to implement this route on your server
//             type: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({
//               messageId: messageId,
//               sender_id: sender_id,
//               receiver_id: receiver_id
//             }),
//             success: function(response) {
//               if (response.success) {
//                 $(`[data-id="${messageId}"]`).remove();
//                 socket.emit('messageDeleted', { messageId, sender_id, receiver_id });
//               } else {
//                 alert('Failed to delete the message.');
//               }
//             },
//             error: function(xhr, status, error) {
//               console.error("AJAX error:", status, error);
//             }
//           });
//         }
//       });

//       socket.on('messageDeleted', (data) => {
//         if (sender_id === data.receiver_id && receiver_id === data.sender_id) {
//           $(`[data-id="${data.messageId}"]`).remove();
//         }
//       });
//     });

//     function scrollChat() {
//       $('#chatbody').animate({
//         scrollTop: $('#chatbody')[0].scrollHeight
//       }, 300);
//     }
//   </script>
// </body>
// </html>