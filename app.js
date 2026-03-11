const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const JWT = require('jsonwebtoken');

const cookieParser = require("cookie-parser");
const userModel = require("./modals/user");
const postModel = require("./modals/posts");


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("signup")
});

app.get('/profile', isLoggedIn, async(req, res) => {
    let user = await userModel.findOne({email : req.user.email}).populate("content");
    console.log(user.content.map(p=> p.content));
    console.log(req.user);
    res.render("profile", { user })
});

app.post('/posts', isLoggedIn, async(req, res) => {

    let user = await userModel.findOne({email : req.user.email});

    
    let post = await postModel.create({
        user: user._id,
        content : req.body.content 
    })

    console.log(post);
    
    user.content.push(post._id);
    await user.save();
    res.redirect("/profile");
})


app.post('/create', async(req, res) => {


    const { username, email, password, age } = req.body ;

    
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

app.get('/edit/:id', isLoggedIn, async(req, res) => {
    const post = await postModel.findOne({_id : req.params.id}).populate("user");
    res.render("edit", {post});
});

app.post('/update/:id', isLoggedIn,  async(req, res) => {
    const post = await postModel.findOneAndUpdate({_id : req.params.id}, {content: req.body.content});
    res.redirect("/profile");
});

app.post('/delete/:id', isLoggedIn,  async(req, res) => {
    console.log(req.params.id);
    const post = await postModel.findOneAndDelete({_id : req.params.id});
    res.redirect("/profile");
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
            res.render("profile", {user})
        } else {
            res.send("bhak bsdk!")
        }
    })

});

app.get('/logout', isLoggedIn, (req, res) => {
    res.cookie("token", "")
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (!req.cookies.token) {
        return res.send("You must be logged in");
    }

    try {
        let data = JWT.verify(req.cookies.token, "shhhh");
        req.user = data;
    } catch (err) {
        return res.send("Invalid token");
    }

    next();
}


app.listen(3000);


