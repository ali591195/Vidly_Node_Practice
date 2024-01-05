// Imported Package
const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Schema and Model
const schemaUser = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
    validate: {
      validator: validatePassword,
      message:
        "Password must contain atleast one Upper Case, Lower Case, Number and Symbol",
    },
  },
  isAdmin: Boolean,
});

schemaUser.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, "1234");
  return token;
};

const User = mongoose.model("User", schemaUser);

// Validation Function

async function validation(obj) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .external(validateEmail, "Custom Validation")
      .required()
      .email(),
    password: Joi.string()
      .min(8)
      .max(1024)
      .required()
      .custom(validatePasswordJoi, "Custom Validation"),
  });

  try {
    await schema.validateAsync(obj);
    return null;
  } catch (err) {
    return err;
  }
}
function validatePassword(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+]/.test(password);

  return hasUpper && hasLower && hasNumber && hasSymbol;
}
function validatePasswordJoi(password, helpers) {
  if (!validatePassword(password))
    throw new Error(
      "Password must contain atleast one Upper Case, Lower Case, Number and Symbol"
    );

  return password;
}
async function validateEmail(email, helpers) {
  const user = await User.findOne({ email: email });
  if (user) throw new Error("Email already exists");
  return email;
}

// Exports Object
exports.User = User;
exports.validation = validation;
exports.validatePasswordJoi = validatePasswordJoi;
exports.validateEmail = validateEmail;
