// <--------------------General imports-------------------->
require("dotenv").config()
const { connectiondb } = require("./connection")
const http = require("http");
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const server = http.createServer(app);
const cors = require("cors")
//Importing routers
const userRouter = require("./routes/user")

// <--------------------Middlewares -------------------->
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // allow only this origin to access the server
    credentials: true,               // allow Access-Control-Allow-Credentials
  })
);
app.use("/user", userRouter);

// <--------------------Connection to DB -------------------->
connectiondb(process.env.MONGODB_URI).then(() => console.log(`MONGODB CONENCTED`))


// <--------------------------Listening at a port---------------------------->
server.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
