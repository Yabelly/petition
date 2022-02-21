//===================import and setup=======================
const express = require("express");
const { engine } = require("express-handlebars");
const req = require("express/lib/request");
const app = express();
const db = require("./database/db");
const cookieSession = require("cookie-session");

//=======hashing lesson=========
const { compare, hash } = require("./bc");
//EXAMPLE FOR HASING A PASSWORD
// hash("someword").then((hashedPassword) => {
//     console.log("hasshedpassword: ", hashedPassword);
// });
//=========hashing lesson=========

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
//===================GET requests===========================
app.get("/", (req, res) => {
    console.log("GET request to / ,  redirecting to /petition");
    res.redirect(302, "/petition");
});

app.get("/petition", (req, res) => {
    console.log("a GET request was made to the /petition route");
    res.render("petition");
    res.status(200);
});
//============monday work to be done=============
app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/login", (req, res) => {
    //example below
    const fakehash = "odsjbjbvbnm"; //is a fake hash
    compare("mypasswordinpout", fakehash)
        .then((isMatch) => {
            console.log("does the password match the one stored: ", isMatch);
            //if this value is false then  re-render the page
            // if this reurns true then set a cookie with the user's ID
            //something like req.session.userId
        })
        .catch((err) => {
            console.log("error comparing password with stored hash: ", err);
            //re-render the page with error message
        });
});
//=======register has to be made=====
app.get("/register", (req, res) => {
    res.render("register");
});
app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    hash(password)
        .then(() => {
            console.log("hashedpassword", hashedPassword);
            //to do: store the users values in the databse
            // if everything is alright then redirect to /petition page
            //re-render the password with an error message. be vague in error to not give away information
        })
        .catch(
            //error gets here for failed hashing or something like that
            //also respond to the client about error
            (err) => {
                console.log(
                    "error hashing password, or something else went wrong: ",
                    err
                );
            }
        );
});
//=-======register has to be made=====
app.post("/petition", (req, res) => {
    db.addSignatures(req.body.first, req.body.last, req.body.signature)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err: ", err);
        });
});

app.get("/signers", (req, res) => {
    console.log("a GET request was made to the /signers route");
    res.render("signers");
    res.status(200);
});

app.get("/thanks", (req, res) => {
    console.log("a GET request was made to the /thanks route");

    const returnedSignature = db.retrieveSignature(req.session.sigId);

    returnedSignature
        .then((val) => {
            res.render("thanks", {
                message: val.rows[0].signature,
            });
        })
        .catch((err) => {
            console.log("error returning returnedSignature(): ", err);
        });

    res.status(200);
});
//===================GET requests==========================

//===================server================================
app.listen(8080, () => console.log("server listening..."));
//===================server================================
//
//
