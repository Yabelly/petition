//===================import and setup=======================
const express = require("express");
const { engine } = require("express-handlebars");
const app = express();
const db = require("./database/db.js");

app.use(express.static("./public"));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
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
