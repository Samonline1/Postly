const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const JWT = require('jsonwebtoken');

const cookieParser = require("cookie-parser");
const userModel = require("./modals/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("signup")
});


app.post('/create', async(req, res) => {


    const { username, email, password, age } = req.body ;

    console.log(req.body);
    
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            console.log(hash);
            
            let user = await userModel.create({
                username,
                email,
                password: hash,
                age,
            });

            let token = JWT.sign({ email }, "shhhh");
            res.cookie("token", token);
            console.log(user);
            res.redirect('/')
        });
    });
    
});

app.get('/login', (req, res) => {
    res.render("login")
});

app.post('/login', async(req, res) => {

    const email = req.body.email ;

    const user = await userModel.findOne({email: email});
    if (!user) return res.send("something went wrong!");

        bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result) {
            let token = JWT.sign({ email : user.email }, "shhhh");
            res.cookie("token", token)
            res.send("yes you can login!")
        } else {
            res.send("bhak bsdk!")
        }
    })

});

app.get('/logout', (req, res) => {
    res.cookie("token", "")
    res.redirect("/");
});

app.listen(3000);


