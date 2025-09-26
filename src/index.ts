import app from './app';
import dotenv from 'dotenv';
import connectDB from './db/mongo';
dotenv.config();

connectDB();

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}!!!!`);
});