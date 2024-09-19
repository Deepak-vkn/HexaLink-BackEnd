import server from './FrameWork/server/app' 


const PORT = Number(process.env.PORT) || 5001;
const HOST = 'localhost'; 

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});


