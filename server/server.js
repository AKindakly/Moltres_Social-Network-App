const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
const db = require("./db");
const cookieSession = require("cookie-session");
const cryptoRandomString = import("crypto-random-string").default;

const { uploader, checkId } = require("./middleware.js");

app.use(compression());

const server = require("http").Server(app);

app.use(express.static(path.join(__dirname, "..", "client", "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cookieSessionMiddleware = cookieSession({
    secret: process.env.SESSION_SECRET,
    // Cookie Options
    maxAge: 1000 * 60 * 60 * 24 * 14,
    samesite: true,
});

const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});

app.use(cookieSessionMiddleware);

io.use((socket, next) => {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

io.on("connection", async (socket) => {
    console.log("[social:socket] incoming socket connection", socket.id);

    const { userId } = socket.request.session;
    if (!userId) {
        return socket.disconnect(true);
    }

    // retrieve the latest 10 messages
    const latestMessages = await db.getLastMessages();
    // console.log("data in latest messages: ", latestMessages);

    // and send them to the client who has just connected
    socket.emit("chatMessages", latestMessages.rows);

    // listen for when the connected user sends a message
    socket.on("chatMessage", async (text) => {
        // store the message in the db
        // console.log("server text", text);
        const newMessage = await db.insertMessage(userId, text);
        console.log("messages in server", newMessage);

        // then broadcast the message to all connected users (included the sender!)
        // hint: you need the sender info (name, picture...) as well
        // how can you retrieve it?
        io.emit("chatMessage", newMessage);
        // console.log("server chatmessage", newMessage);
    });
});

///////////////// AWS thing: /////////////////
const aws = require("aws-sdk");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("../secrets.json"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

//////////////////////////////////////////////////////////////////////////
app.get("/user/id", checkId, function (req, res) {
    res.json({
        userId: req.session.userId,
    });
});

app.post("/registration", (req, res) => {
    if (req.body) {
        const { first_name, last_name, email, password } = req.body;

        db.insertUser(first_name, last_name, email, password)
            .then((rows) => {
                req.session.userId = rows[0].id;
                // console.log("register session: ", rows[0].id);
                res.json({
                    success: true,
                });
            })
            .catch((err) => {
                console.log("ERROR in insertUser: ", err);
            });
    } else {
        res.json({
            success: false,
            message: "something went wrong!",
        });
    }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.findUserByEmail(email).then((result) => {
        db.checkEmail(email).then((rows) => {
            if (!rows.length) {
                res.json({ message: "email not found" });
            } else {
                db.authenticate(email, password).then((success) => {
                    console.log({ success });
                    if (success === true) {
                        // console.log("login session: ", result.rows);
                        req.session.userId = result.rows[0].id;
                        res.json({
                            success: true,
                        });
                    } else {
                        res.json({
                            success: false,
                            message: "something went wrong!",
                        });
                    }
                });
            }
        });
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
});

app.post("/forgetPassword", (req, res) => {
    const email = req.body.email;

    db.checkEmail(email).then((result) => {
        // console.log("email log", result[0]);
        if (!result.length) {
            res.json({ message: "email not found" });
        } else {
            const secretCode = cryptoRandomString({
                length: 6,
            });
            // console.log("password code is: ", secretCode);

            db.insertPasswordCode(email, secretCode).then(() => {
                if (req.body) {
                    res.json({
                        success: true,
                        passCode: secretCode,
                    });
                } else {
                    res.json({
                        success: false,
                        message: "something went wrong!",
                    });
                }
            });
        }
    });
});

app.post("/resetPassword", (req, res) => {
    const { email, passwordCode, newPassword } = req.body;
    // console.log("body", req.body);

    db.findPasswordCode(email).then((data) => {
        // console.log("database code: ", data.rows[0].passwordcode);
        // console.log("input code: ", passwordCode);
        if (data.rows[0].passwordcode === passwordCode) {
            db.insertNewPassword(email, newPassword).then(() => {
                res.json({
                    success: true,
                });
            });
        } else {
            res.json({ success: false, message: "wrong code!" });
        }
    });
});

app.get("/user", checkId, (req, res) => {
    if (req.session.userId) {
        const { userId } = req.session;
        // console.log("session id is: ", req.session.userId);
        db.findUserById(userId)
            .then((data) => {
                // console.log("user data :", data.rows[0]);
                res.json(data.rows[0]);
            })
            .catch((err) => {
                console.log("ERROR in finduserbyid: ", err);
            });
    }
});

app.post("/profile_pic", checkId, uploader.single("file"), (req, res) => {
    if (req.file) {
        const { filename, mimetype, size, path } = req.file;
        // console.log("req.file: ", req.file);

        const promise = s3
            .putObject({
                Bucket: "spicedling",
                ACL: "public-read",
                Key: filename,
                Body: fs.createReadStream(path),
                ContentType: mimetype,
                ContentLength: size,
            })
            .promise();

        promise
            .then(() => {
                console.log("success uploading");
                fs.unlinkSync(req.file.path);
                let profilePic = `https://s3.amazonaws.com/spicedling/${filename}`;

                db.insertProfilePic(profilePic, req.session.userId).then(() => {
                    // console.log("profile pic: ", profilePic);
                    res.json({
                        success: true,
                        message: "Thank you upload complete!",
                        profilePic,
                    });
                });
            })
            .catch((err) => {
                console.log("ERROR in insertProfilePic: ", err);
            });
    } else {
        res.json({
            success: false,
            message: "Upload failed!",
        });
    }
});

app.post("/bio", checkId, (req, res) => {
    const { newBio } = req.body;
    // console.log("bio in server ", req.body.newBio);
    // console.log("userid ", req.session.userId);

    db.insertBio(newBio, req.session.userId)
        .then(() => {
            res.json({
                success: true,
                bio: newBio,
            });
        })
        .catch((err) => {
            console.log("ERROR in insertBio: ", err);
        });
});

app.get("/findUsers", checkId, (req, res) => {
    // console.log("req.query ", req.query.q);
    db.findUsersByValue(req.query.q)
        .then((data) => {
            // console.log("findUsers data :", data.rows);
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("ERROR in findUsers: ", err);
        });
});

app.get("/user/:id", checkId, (req, res) => {
    // console.log("req.params in /user/:id ", req.params.id);
    // console.log("req.session.id ", req.session.userId);
    if (req.params.id == req.session.userId) {
        res.json({
            success: false,
        });
    } else {
        db.findUserById(req.params.id)
            .then((data) => {
                // console.log("user/:id data :", data.rows[0]);
                res.json({
                    success: true,
                    data: data.rows[0],
                });
            })
            .catch((err) => {
                console.log("ERROR : ", err);
            });
    }
});

app.get("/friendship/:otherUserId", checkId, (req, res) => {
    // console.log("req.params: ", req.params.otherUserId);
    // console.log("req.session: ", req.session.userId);
    db.findFriendship(req.session.userId, req.params.otherUserId)
        .then((data) => {
            res.json({ data: data.rows, userId: req.session.userId });
            // console.log("friendship GET data :", data.rows);
            // console.log("friendship GET userId :", userId);
        })
        .catch((err) => {
            console.log("ERROR in friendship GET: ", err);
        });
});

app.post("/friendship/:otherUserId", checkId, (req, res) => {
    db.insertFriendship(req.session.userId, req.params.otherUserId)
        .then((data) => {
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("ERROR in friendship POST: ", err);
        });
});

app.post("/friendship/cancel/:otherUserId", checkId, (req, res) => {
    db.deleteFriendship(req.session.userId, req.params.otherUserId)
        .then((data) => {
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("ERROR in friendship cancel POST: ", err);
        });
});

app.post("/friendship/accept/:otherUserId", checkId, (req, res) => {
    db.acceptFriendship(req.session.userId, req.params.otherUserId)
        .then((data) => {
            res.json(data.rows);
        })
        .catch((err) => {
            console.log("ERROR in friendship accept POST: ", err);
        });
});

app.get("/friendships", checkId, (req, res) => {
    // console.log("req.session: ", req.session.userId);
    db.retrievingFriends(req.session.userId).then((data) => {
        db.getHowManyFriends(req.session.userId)
            .then((friendsCount) => {
                // console.log(friendsCount.rows);
                res.json({
                    success: true,
                    friends: data.rows,
                    count: friendsCount.rows[0],
                });
                // console.log("friends GET data :", data.rows);
            })
            .catch((err) => {
                console.log("ERROR in friendship GET: ", err);
            });
    });
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
