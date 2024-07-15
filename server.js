const express=require('express');
const app=express();
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const authRoute=require("./router/auth");
const cors=require("cors")
dotenv.config();

app.use(cors());

mongoose.connect(process.env.MONGODB_URL)
.then(()=>{console.log("Db connected Successfully")})
.catch((error)=>console.log("DB unable to connect",error))

app.use(express.json());  // middleware to parse json data
app.get('/',(req,res)=>{
    res.send("Welcome to Express!");
})

app.use('/api/auth',authRoute);  // middleware for routes under /api/user
 
const port=8080;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})