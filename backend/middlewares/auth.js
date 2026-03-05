const {getUser} = require("../services/auth")

async function authMiddleware(req, res, next) {
    const sessionId = req.cookies?.aiforbharat;
    // console.log("Auth Middleware - sessionId:", sessionId);
    if (!sessionId) {
        return res.status(404).send( "Not found: No session ID" );
    }
    const user = await getUser(sessionId);
    if (!user) {
        return res.status(404).send("Not found: No user");
    }
    req.user = user;  // Attach login-user to request object for downstream handlers ,having user's username and _id
    // console.log("data in auth middleware:", req.user.name);
    // console.log("Added user to req", req.user);
    next();
}

module.exports = {authMiddleware}