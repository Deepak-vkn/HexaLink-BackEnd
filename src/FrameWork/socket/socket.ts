import { Server } from 'socket.io';
import http from 'http';
import { sendMessage,followUserControll } from '../../Adapters/userControll'; // Import your conversation service

// Array to keep track of online users and their socket IDs
const onlineUsers: { userId: string; socketId: string }[] = [];
let io: Server;

export const initializeSocket = (httpServer: http.Server) => {
   io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173', // Adjust as needed
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for an event to add a user (you might send user ID after connection)
    socket.on('addUser', (userId: string) => {
      // Store the user's ID and socket ID
      onlineUsers.push({ userId, socketId: socket.id });
      console.log('User added to online list:', onlineUsers);
    });
    // Handle the 'sendMessage' event
    socket.on('sendMessage', async (messageData: {
      conversationId?: string;
      sendTo: string; // Receiver's user ID
      sendBy: string;
      content: string;
    }, callback) => { // Add a callback parameter
      try {
        const { conversationId, sendTo, sendBy, content } = messageData;
        const newMessage = await sendMessage(conversationId, sendTo, sendBy, content);
        // Find the socket ID of the receiver
        const receiver = onlineUsers.find(user => user.userId === sendTo);
        if (receiver) {
          console.log('Receiver is', receiver);
          // Emit the message to the specific user's socket ID
          io.to(receiver.socketId).emit('receiveMessage', {
            conversationId,
            sendBy,
            content
          });
    
          // Send acknowledgment back to the sender
          callback({ success: true, message: 'Message sent successfully!' });
        } else {
          console.log('Receiver is not online');
          callback({ success: false, error: 'Receiver is not online' });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ success: false, error: 'Error sending message' });
      }
    });
    

    // Handle disconnection
    // socket.on('disconnect', () => {
    //   console.log('User disconnected:', socket.id);
    //   // Remove the user from the online users list
    //   const index = onlineUsers.findIndex(user => user.socketId === socket.id);
    //   if (index !== -1) {
    //     onlineUsers.splice(index, 1);
    //     console.log('User removed from online list:', socket.id);
    //   }
    // });
  });

  return io;
};

export const emitNotification = (followId: string, userId: string) => {
  console.log('raeched mit nodfuction count')
  // Check if the user is online
  const receiver = onlineUsers.find(user => user.userId === followId);
  if (receiver) {
    console.log('user is in online',receiver.socketId)
    io.to(receiver.socketId).emit('notificationUpdate', {
      message: `${userId} sent you a follow request.`,
      type: 'follow',
    });
  } else {
    console.log(`User ${followId} is not online; notification not sent.`);
  }
};
