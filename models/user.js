const mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  SALT_WORK_FACTOR = 10;
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = mongoose.Schema(
  {
    full_name: { type: String, required: true },
    phone_number: { type: Number, required: true },
    email: {
      type: String,
      required: true,
      index: { unique: true },
      lowercase: true
    },
    institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "institution",
      
      },
    schoolId_url: { type: String },
    username: { type: String },
    password: { type: String, default:'1111' },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faculty",
       
      },
    profile_url: { type: String },
    device_token: { type: String },
    device_type: { type: String },
    device_language: { type: String },
    
    verified: { type: Boolean, default: false },
    verification_code: { type: String },
    company_name: { type: String },
    
    
  },
  {
    timestamps: true
    //  strict: false
  }
);

UserSchema.pre("save", function(next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", UserSchema);
