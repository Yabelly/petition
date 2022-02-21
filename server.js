//===================import and setup=======================
const express = require("express");
const { engine } = require("express-handlebars");
const app = express();
const db = require("./database/db");

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));
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
// ///what??
// app.post("/petition", (req, res) => {
//     const { first, last, signature } = req.body;
//     console.log("a POST requist was made at /petition");
//     db.addsignatures(req.body.first, req.body.last, req.body.signature)
//         .then(console.log(req.body.first))
//         .catch(err());
// });
app.post("/petition", (req, res) => {
    console.log("THIS IS POSTING", req.body);
    db.addsignatures(req.body.first, req.body.last, req.body.signature)
        .then(({ rows }) => {
            console.log("rows: ", rows);
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
    res.render("thanks");
    res.status(200);
});
//===================GET requests==========================

//===================server================================
app.listen(8080, () => console.log("server listening..."));
//===================server================================
