const express = require("express");
const app = express();

app.get('/', (req, res) => {
    res.send("Oh hi world!")
})

app.listen(3000);