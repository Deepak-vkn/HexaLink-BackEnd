import app from './FrameWork/server/app' 


const PORT = Number(process.env.PORT) || 5000;
const HOST = 'localhost'; 

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
