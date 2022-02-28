//===================import and setup=======================
const express = require("express");
const { engine } = require("express-handlebars");
const req = require("express/lib/request");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");
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
    console.log("GET request /login route, req.session: ", req.session);

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
                        console.log("wrong password");
                        res.redirect("/login");
                    }
                })
                .catch((err) => {
                    console.log(
                        "error in comparing, redirect to login page again",
                        err
                    );
                    res.render("login", {
                        wrongLogin: "Wrong login detail, try again",
                    });
                });
        })
        .catch((err) => {
            res.render("login", {
                notExisting:
                    "user does not exist yet or you typed something wrong, try again",
            });
        })

        .catch((err) => {
            "error in retrieving password", err;
            res.render("login");
        });
});

//------------------login /------------------------------
//------------------register /------------------------------
app.get("/register", (req, res) => {
    console.log("GET request /register route");
    res.render("register");
});
app.post("/register", (req, res) => {
    console.log("POST request /register route,  ", req.session);

    const { first, last, email, password } = req.body;
    console.log(req.body);
    hash(password)
        .then((hashedPassword) => {
            console.log("hashedpassword", hashedPassword);
            db.registration(first, last, email, hashedPassword)
                .then(({ rows }) => {
                    // console.log("rows in db.registration", rows);
                    req.session.userId = rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("user already exists error", err);
                    res.render("register", {
                        existingUser:
                            "this user already exists try something else",
                    });
                });
        })
        .catch((err) => {
            console.log("error hashing password or POST registration: ", err);
            res.render("register", {
                mistake: "something went wrong, try again!",
            });
        });
});
//------------------register /------------------------------
//------------------profile /------------------------------
app.get("/profile", (req, res) => {
    console.log("GET request /profile", req.session);

    res.render("profile");
});
app.post("/profile", (req, res) => {
    console.log("GET request /profile route");
    let { age, city, url } = req.body;
    let inputUrl = req.body.url;

    if (
        inputUrl.startsWith("http://") ||
        inputUrl.startsWith("https://") ||
        inputUrl == ""
    ) {
        if (inputUrl == "") {
            inputUrl = null;
        }
        if (age == "") {
            age = null;
        }
        db.addProfile(age, city, url, req.session.userId).then(
            res.redirect("petition")
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
    console.log(
        "a GET request was made to the /petition route, req.session: ",
        req.session
    );
    res.render("petition");
});
app.post("/petition", (req, res) => {
    console.log("POST request /petition route");
    if (req.body.signature == "") {
        res.render("petition", {
            noinput: "you need to draw signature to continue",
        });
    }
    console.log("req.body: ", req.body, "cookies: ", req.session);
    db.addSignatures(req.session.userId, req.body.signature)
        .then(({ rows }) => {
            //console.log("signature: ", rows[0].signature);
            req.session.sigId = rows[0].id;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in POST /petition: ", err);
            res.render("petition", {
                errorHappening: "something went wrong try again!",
            });
        });
});
//------------------petition /------------------------------
//------------------thanks /------------------------------
app.get("/thanks", (req, res) => {
    console.log("GET request /thanks route, req.session: ", req.session);
    Promise.all([db.retrieveSignature(req.session.userId), db.countSigners()])
        .then((obj) => {
            // console.log("obj: ", obj[1].rows);
            res.render("thanks", {
                message: obj[0].rows[0].signature,
                count: obj[1].rows[0].count,
            });
        })
        .catch((err) => {
            console.log("error returning returnedSignature(): ", err);
            res.render("thanks");
        });
});

app.post("/thanks", (req, res) => {
    db.removeSig(req.session.userId);
    req.session.sigId = null;
    res.redirect("/petition");
});
//------------------thanks /------------------------------
//------------------signers /------------------------------
app.get("/signers", (req, res) => {
    console.log("GET request /signers route, req.session: ", req.session);
    db.retrieveNameAgeCity().then(({ rows }) => {
        console.log("this is rows: ", rows);
        res.render("signers", {
            signers: rows,
        });
    });

    res.status(200);
});

app.get("/signers/:city", (req, res) => {
    console.log("GET request /signers/:city route");

    db.retrieveCity(req.params.city).then(({ rows }) => {
        console.log("this is rows: ", rows);
        res.render("signers", {
            signers: rows,
            //     returnButton:
        });
    });
});
//------------------signers /------------------------------
//------------------edit /------------------------------
app.get("/edit", (req, res) => {
    console.log("GET request /edit, req.session: ", req.session);

    db.retrieveForEdit(req.session.userId)
        .then(({ rows }) => {
            // console.log("this is rows", rows);
            res.render("edit", {
                userinfo: rows,
            });
        })
        .catch((err) => {
            console.log("error in retrieveForEdit: ", err);
        });
});

app.post("/edit", (req, res) => {
    let { first, last, email, password, age, city, url } = req.body;

    if (url.startsWith("http://") || url.startsWith("https://") || url == "") {
        if (url == "") {
            url = null;
        }
        if (age == "") {
            age = null;
        }

        if (password == "") {
            //if no new password
            db.updateFirstLastEmail(first, last, email, req.session.userId);
            db.upsertUserProfiles(age, city, url, req.session.userId);
            res.redirect("/thanks");
        } else {
            //if new password
            hash(password).then((hashedPassword) => {
                db.updateFirstLastEmailPassword(
                    first,
                    last,
                    email,
                    hashedPassword,
                    req.session.userId
                )
                    .then(() => {
                        db.upsertUserProfiles(
                            age,
                            city,
                            url,
                            req.session.userId
                        );
                    })
                    .catch((err) => {
                        console.log("error in editing userfile: ", err);
                    });
            });
        }
    } else {
        res.render("profile", {
            notvalid:
                "Not a safe url: please add http:// or https:// to start of url",
        });
    }
    res.redirect("/thanks");
});
//------------------edit /------------------------------
//------------------logout /------------------------------
app.get("/logout", (req, res) => {
    req.session = null;
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
