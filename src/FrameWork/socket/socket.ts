import { Server } from 'socket.io';
import http from 'http';
import { sendMessage, followUserControll,updateMessageCount } from '../../Adapters/userControll';

const onlineUsers: { userId: string; socketId: string }[] = [];
let io: Server;

export const initializeSocket = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
       origin:process.env.FRONTEND_URL ,
     // origin:'https://gsnj8j5b-5173.inc1.devtunnels.ms',
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

    // Handle sending messages
    socket.on('sendMessage', async (messageData: {
      conversationId?: string;
      sendTo: string;
      sendBy: string;
      content?: string; 
      file?: string;   
    }, callback) => {
      try {
        const { conversationId, sendTo, sendBy, content,file,  } = messageData;
        console.log(messageData)
        const newMessage = await sendMessage(conversationId, sendTo, sendBy, content,file );

        const receiver = onlineUsers.find(user => user.userId === sendTo);
        if (receiver) {
          console.log('Receiver is', receiver);
          io.to(receiver.socketId).emit('receiveMessage', {
            conversationId,
            sendBy,
            content,
            file,  
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

    socket.on('getLatestMessageCount', async ({ userId }) => {
      console.log(`Received request for latest message count from user: ${userId}`);
  
      try {
          //update the message count
          const result = await updateMessageCount(userId);
          
          // send the count back to the client
          if (result && result.success) {
              console.log('Updated result count =', result.count);
              const receiver = onlineUsers.find(user => user.userId === userId);
            if (receiver) {
              console.log('User is online', receiver.socketId);
              io.to(receiver.socketId).emit('updateMessageCount', {
            count:result.count
              });
            } else {
    console.log(`User ${userId} is not online; notification not sent.`);
  }
              
          } else {
              console.log('Failed to retrieve the message count.');
          }
      } catch (error) {
          console.error('Error in getLatestMessageCount:', error);
      }
  });
  

    socket.on('userOnline', ({ userId, chatId }) => {
      console.log('Reached checking online');
    
      // Notify the chat partner that the user is online
      const chatPartner = onlineUsers.find(user => user.userId === chatId);
      const user = onlineUsers.find(user => user.userId === userId);
      if (user) {
        if (chatPartner) {
          console.log('User is online', user.socketId);
          io.to(user.socketId).emit('chatPartnerOnline', { success: true });

          console.log('Emitted chatPartnerOnline with success true to:', user.socketId);
        } else {
          console.log('User is offline', user.socketId);
          socket.to(user.socketId).emit('chatPartnerOnline', { success: false });
          console.log('Emitted chatPartnerOnline with success false to:', user.socketId);
        }
      }
    });
    

    // Video call 
    socket.on('outgoing:call', data => {
      const { fromOffer, to } = data;
      console.log('Incoming call has been received in the backend',data.to);


      const recipient = onlineUsers.find(user => user.userId === to);
      if (recipient) {
        console.log('Recipient is online:', recipient); 

      
        io.to(recipient.socketId).emit('incoming:call', { from: socket.id, offer: fromOffer });
      } else {
        console.log(`User ${to} is not online; cannot send the call offer.`);
      }
    });

    socket.on('call:accepted', data => {
      console.log('call has been accpeted to ',data.to)
      const { answer, to } = data;

      socket.to(to).emit('incoming:answer', { offer: answer });
    });


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
  console.log('Reached emitNotification function');

  const receiver = onlineUsers.find(user => user.userId === followId);
  if (receiver) {
    console.log('User is online', receiver.socketId);
    io.to(receiver.socketId).emit('notificationUpdate', {
      message: `${userId} sent you a follow request.`,
      type: 'follow',
    });
  } else {
    console.log(`User ${followId} is not online; notification not sent.`);
  }
};

export const emitMessageNotification = (userId: string) => {
  console.log('Reached emit  message Notification function');

  const receiver = onlineUsers.find(user => user.userId === userId);
  if (receiver) {
    console.log('User is online', receiver.socketId);
    io.to(receiver.socketId).emit('MessageCountUpdate', {
      message: `${userId} sent you a message.`,
      type: 'follow',
    });
  } else {
    console.log(`User ${userId} is not online; notification not sent.`);
  }
};



export const updateMessageNotificationCount = (userId: string,count:number) => {
  console.log('Reached emit  message Notification function');

  const receiver = onlineUsers.find(user => user.userId === userId);
  if (receiver) {
    console.log('User is online', receiver.socketId);
    io.to(receiver.socketId).emit('updateMessageCount', {
   count:count
    });
  } else {
    console.log(`User ${userId} is not online; notification not sent.`);
  }
};
