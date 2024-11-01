import server from './FrameWork/server/app' 


const PORT = Number(process.env.PORT) || 3000;
const HOST = 'localhost'; 

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});


