import app from './FrameWork/server/app' // Ensure the path is correct

// Get PORT from environment variable and convert to number
const PORT = Number(process.env.PORT) || 5000;
const HOST = 'localhost'; // or use your local machine's IP if needed

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
