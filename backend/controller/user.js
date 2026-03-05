// <-------------------Importing models---------------------->
const User = require("../models/user")
const { setUser } = require("../services/auth")

async function handleLogin(req, res) {
    // console.log("Login request body:", req.body);
    const { email, password } = req.body;
    
    try {
        // Validate input BEFORE querying database
        if (!email || !password) {
            return res.status(400).send("All fields are required");
        }
        
        const users = await User.findOne({ email, password });
        if (!users) {
            return res.status(401).send("Invalid email or password");
        }
        
        // Store user session and log it back using getUser
        const token = setUser(users); // Store user session
        res.cookie("aiforbharat", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.status(200).json({ "uid": token});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
async function handleSignup(req, res) {
    // console.log("Signup request body:", req.body);
    const users = await User.find() ;
    const body = req.body;
    try {
        if (!body.username || !body.password || !body.email) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // validate email is a valid email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return res.status(422).json({ message: "Enter a valid email address" });
        }
        // Ensure we compare same types (email stored as String in DB)
        if (users.some((user) => user.username === body.username || user.email === body.email)) {
            return res.status(409).send("Username or email already exists");
        }

        await User.create({
            username: body.username,
            password: body.password,
            email: body.email
        });
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error("Signup error:", err);
        // If Mongo/Mongoose throws a duplicate key error, return 409 (conflict)
        if (err && err.code === 11000) {
            return res.status(409).json({ message: "Username or email already exists" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { handleLogin, handleSignup }