const express = require('express');
const userRoute = require('./app/routes/user')

const mongoose = require("mongoose")


var app = express();

mongoose
  .connect('mongodb://127.0.0.1:27017'
    ,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    console.log("Database connected");
    app.listen(3000);
  })
  .catch(err => console.log(err));





app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.json({ message: "--- Connection Successful! ---" })});
app.use('/user',userRoute);




 

