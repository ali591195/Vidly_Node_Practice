const jwt = require("jsonwebtoken");

module.exports = function (rq, rs, next) {
  const token = rq.header("x-auth-token");
  if (!token) return rs.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, "1234");
    rq.user = decoded;
    next();
  } catch (e) {
    return rs.status(400).send("Invalid token.");
  }
};
