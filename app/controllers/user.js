
let jwt = require("jsonwebtoken");
const User = require("../../models/user");

// Signup...
exports.create = (req, res) => {
    let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    //console.log(req)
    if (!req.body.full_name) {
        return res.status(400).send({
            message: "fullname field can not be empty"
        });
    } else if (!req.body.phone_number || isNaN(req.body.phone_number)) {
        return res.status(400).send({
            message: "Mobile Number field can not be empty and must be a number"
        });
    } else if (!req.body.email || !emailReg.test(req.body.email)) {
        return res.status(400).send({
            message: "Email field can not be empty and must be a valid email address"
        });
    }
    User.find({ email: req.body.email }, function (err, docs) {
        if (docs.length) {
            return res.status(409).send({
                message: "Email exists already"
            });
        } else {
            const user = new User({
                email: req.body.email,
                password: req.body.password,
                full_name: req.body.full_name,
                schoolId_url: req.body.schoolId_url,
                phone_number: req.body.phone_number,
            });
            // Save user in the database
            user
                .save()
                .then(data => {
                    let token = jwt.sign({ email: req.body.email }, 'asdfgdas');
                    res.send({
                        data: data,
                        token: token
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while saving the User."
                    });
                });
        }
    });
};


//create username
exports.createUsername = (req, res) => {
    
    if (!req.body.username) {
        return res.status(400).send({
            message: "Username can not be empty"
        });
    }
    User.findByIdAndUpdate(user_id,{ username: req.body.username })
    .then(user => {
        if (user) {
            return res
                .status(423)
                .send({ status: false, message: "username not available" });
        }
        else { }
    })

}

//add password
exports.addpassword = (req,res) =>{
    let passwordReg = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    );
    if (!req.body.password || req.body.password<8 || !passwordReg.test(req.body.password)) {
        return res.status(400).send({
            message:
                "Password field can not be empty, must be equal to or greater than 8 characters, must contain a lowercase letter at least, must contain an uppercase letter, .mustcontain a number, must contain a special character(@#$%)"
        });
    }

    User.findByIdAndUpdate(user_id,{ password: req.body.password })
    .then(user => {
        return res.status(200).send({
            message:
                "Password added"
        })
    })

}

//upload profile picture

exports.profilepicture = (req,res) =>{}

//update profile
exports.updateProfile = (req, res) => {
    //console.log(req)
    if (
        req.body.email ||
        req.body.password ||
        req.body.username 
    ) {
        return res.status(403).send({
            message: "Unauthorized update"
        });
    } else if (!req.body.user_id) {
        return res.status(400).send({
            message: "User Id field can not be empty"
        });
    } else {
        Object.keys(req.body).forEach(function (key, index) {
            User.findByIdAndUpdate(
                req.body.user_id,
                {
                    [key]: req.body[key]
                },
                { new: true }
            )
                .then(user => {
                    if (!user) {
                        return res.status(404).send({
                            message: "User not found with id " + req.body.user_id
                        });
                    }
                    res.send(user);
                })
                .catch(err => {
                    if (err.kind === "ObjectId") {
                        return res.status(404).send({
                            message: "User not found with id " + req.body.user_id
                        });
                    }
                    return res.status(500).send({
                        message: "Error updating user with id " + req.body.user_id
                    });
                });
        });
    }
};

// Login
exports.login = (req, res) => {
    let regg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (
        !req.body.password ||
        req.body.password < 8 ||
        !req.body.email ||
        regg.test(req.body.email) === false
    ) {
        return res.status(400).send({
            message: "Invalid Credentials"
        });
    }
    console.log(req.body);
    User.findOne({ email: req.body.email }, function (err, docs) {
        //    console.log(docs)
        if (docs) {
            docs.comparePassword(req.body.password, function (err, isMatch) {
                if (err) {
                    return res.status(400).send({
                        message: "Invalid Credentials"
                    });
                }
                if (isMatch) {
                    let token = jwt.sign(
                        {
                            userId: docs._id.toString(),
                            email: req.body.email
                        },
                        config.secret,
                        {
                            expiresIn: "480h" // expires in 480 hours
                        }
                    );
                    // return the JWT token for the future API calls
                    res.json({
                        success: true,
                        message: "Authentication successful!",
                        token: token,
                        data: docs
                    });
                } else {
                    return res.status(400).send({
                        message: "Invalid Credentials"
                    });
                }
            });
        } else {
            return res.status(400).send({
                message: "Invalid Credentials"
            });
        }
    });
};
//
exports.findAllPaginated = async (req, res, next) => {
    const pageNo = req.query.page || 1;
    const perPage = 10;
    if (pageNo < 0 || pageNo === 0) {
        res.status(400).send({
            message: "Invalid Page Number, should start  with 1"
        });
    }
    try {
        const options = {
            page: pageNo,
            limit: perPage,
            sort: { createdAt: -1 },
            collation: {
                locale: "en"
            }
        };

        const users = await User.paginate({}, options);
        if (!users) {
            const error = new Error("Users not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            users
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    User.find()
        .sort("asc")
        .then(users => {
            res.send(users);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving the users."
            });
        });
};



// Find a single user with a userId
exports.findOne = (req, res) => {
    User.findById(req.params.user_id)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.user_id
                });
            }
            res.send(user);
        })
        .catch(err => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "User not found with id " + req.params.user_id
                });
            }
            return res.status(500).send({
                message: "Error retrieving user with id " + req.params.user_id
            });
        });
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.user_id)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.user_id
                });
            }
            res.send({ message: "User deleted successfully!" });
        })
        .catch(err => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    message: "User not found with id " + req.params.user_id
                });
            }
            return res.status(500).send({
                message: "Could not delete User with id " + req.params.user_id
            });
        });
};
