//===================import and setup=======================
const express = require("express");
const { engine } = require("express-handlebars");
const req = require("express/lib/request");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");

//=======hashing lesson=========
const { compare, hash } = require("./bc");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));
app.use(
    cookieSession({
        secret: `super secret thing to make second cookie`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

//===================import and setup=======================
//
//===================requests===========================
//
//------------------main /------------------------------
app.get("/", (req, res) => {
    console.log("GET request  / route ");
    res.redirect("/register");
});
//------------------main /------------------------------
//------------------login /------------------------------
app.get("/login", (req, res) => {
    console.log(
        "GET request /login route, this should be emty cookie: ",
        req.session
    );
    res.render("login");
});

app.post("/login", (req, res) => {
    console.log("POST request /login route");
    db.retrieveEmailPassword(req.body.email)
        .then((val) => {
            compare(req.body.password, val.rows[0].password)
                .then((match) => {
                    // console.log("there is a match", match);
                    if (match) {
                        req.session.userId = val.rows[0].id;
                        const retrieval = db
                            .retrieveSignature(req.session.userId)
                            .then(({ rows }) => {
                                // console.log("val: ", rows.length);
                                if (rows.length == 1) {
                                    req.session.cookieTwo = true;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    "error in retrieving signature",
                                    err
                                );
                            });
                    } else {
                        // console.log("wrong password");
                        res.redirect("/login");
                    }
                })
                .catch((err) => {
                    console.log(
                        "error in comparing, redirect to login page again",
                        err
                    );
                    res.render("/login");
                });
        })

        .catch((err) => {
            "error in retrieving password";
        });
});

//------------------login /------------------------------
//------------------register /------------------------------
app.get("/register", (req, res) => {
    console.log("GET request /register route");
    res.render("register");
});
app.post("/register", (req, res) => {
    // console.log("POST request /register route", req.body);
    const { first, last, email, password } = req.body;
    hash(password)
        .then((hashedPassword) => {
            req.body.password = hashedPassword;
            db.registration(
                req.body.first,
                req.body.last,
                req.body.email,
                req.body.password
            ).then(({ rows }) => {
                // console.log("rows in db.registration", rows);
                req.session.userId = rows[0].id;
                res.redirect("/profile");
            });
        })
        .catch((err) => {
            res.redirect("/");
            console.log("error hashing password or POST registration: ", err);
        });
});
//------------------register /------------------------------
//------------------profile /------------------------------
app.get("/profile", (req, res) => {
    console.log("GET request /profile route");
    res.render("profile");
});
app.post("/profile", (req, res) => {
    console.log("GET request /profile route");
    const { age, city, url } = req.body;
    const inputUrl = req.body.url;
    if (inputUrl.startsWith("http://") || inputUrl.startsWith("https://")) {
        db.addProfile(
            req.body.age,
            req.body.city,
            req.body.url,
            req.session.userId
        );
    } else {
        res.render("profile", {
            notvalid:
                "Not a safe url: please add http:// or https:// to start of url",
        });
    }
});

//------------------profile /------------------------------
//------------------petition /------------------------------
app.get("/petition", (req, res) => {
    console.log("a GET request was made to the /petition route", req.session);
    res.render("petition");
});
app.post("/petition", (req, res) => {
    console.log("POST request /petition route");
    db.addSignatures(req.session.userId, req.body.signature)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in POST /petition: ", err);
        });
});
//------------------petition /------------------------------
//------------------thanks /------------------------------
app.get("/thanks", (req, res) => {
    console.log("GET request /thanks route");
    const returnedSignature = db
        .retrieveSignature(req.session.userId)
        .then(({ rows }) => {
            res.render("thanks", {
                message: rows[0].signature,
            });
        })
        .catch((err) => {
            console.log("error returning returnedSignature(): ", err);
        });
});
//------------------thanks /------------------------------
//------------------signers /------------------------------
app.get("/signers", (req, res) => {
    console.log("GET request /signers route");
    res.render("signers");
    res.status(200);
});
//------------------signers /------------------------------
//------------------logout /------------------------------
app.get("/logout", (req, res) => {
    res.redirect("/login");
});
//------------------logout /------------------------------
//===================requests===========================
//
//===================server================================
app.listen(process.env.PORT || 8080, () =>
    console.log("server listening at 8080...")
);
//===================server================================
//
//
