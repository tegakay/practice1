const express = require('express')
const router = require('express').Router();
const user =require('../controllers/user')


router.post('/', user.login)
router.post('/signup',user.create)
router.post('/signup/username',user.createUsername)
router.post('/signup/password',user.addpassword)
router.post('/profile',user.updateProfile)
router.delete("/:user_id", user.delete);
router.get("/:user_id",  user.findOne);
router.post('/login',user.login)
router.get("/", (req,res)=> res.send({message:'user area'}));






module.exports = router;