import { Server } from 'socket.io';
import http from 'http';
import { sendMessage,followUserControll } from '../../Adapters/userControll'; 

const onlineUsers: { userId: string; socketId: string }[] = [];
let io: Server;

export const initializeSocket = (httpServer: http.Server) => {
   io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173', 
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('addUser', (userId: string) => {
      const userExists = onlineUsers.find(user => user.userId === userId);
      if (!userExists) {
        onlineUsers.push({ userId, socketId: socket.id });
        console.log('User added to online list:', onlineUsers);
      } else {
        userExists.socketId = socket.id; 
      }
    });
    
    const sendTime = new Date();

    socket.on('sendMessage', async (messageData: {
      conversationId?: string;
      sendTo: string; 
      sendBy: string;
      content: string;
      
    }, callback) => { 
      try {
        const { conversationId, sendTo, sendBy, content } = messageData;
        const newMessage = await sendMessage(conversationId, sendTo, sendBy, content);
 
        const receiver = onlineUsers.find(user => user.userId === sendTo);
        if (receiver) {
          console.log('Receiver is', receiver);
 
          io.to(receiver.socketId).emit('receiveMessage', {
            conversationId,
            sendBy,
            content,
            sendTime
          });

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
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      const index = onlineUsers.findIndex(user => user.socketId === socket.id);
      if (index !== -1) {
        onlineUsers.splice(index, 1);
        console.log('User removed from online list:', socket.id);
      }
    });
  });

  return io;
};

export const emitNotification = (followId: string, userId: string) => {
  console.log('raeched mit nodfuction count')

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
