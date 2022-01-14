const jwt = require("jsonwebtoken");
const { ADMIN, CLIENT } = require("../utils/user-roles");

const authorizedAdmin = function (req, res, next) {
  try {
    const token = req.header("Authorization");

    if (!token) {
      console.log("Token is not provided");
      return res.status(401).json({
        msg: "Token is not provided",
      });
    }
    const payload = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.SECRET_KEY
    );

    if (!verifyRole(payload.role, ADMIN)) {
      console.log("Unauthorized role");
      return res.status(403).json({
        msg: "Unauthorized role",
      });
    }

    req.id = payload.id;

    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      e
    });
  }
};

const authorizedClient = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      console.log("Token is not provided");
      return res.status(401).json({
        msg: "Token is not provided",
      });
    }
    const payload = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.SECRET_KEY
    );

    if (!verifyRole(payload.role, CLIENT)) {
      console.log("Unauthorized role");
      return res.status(403).json({
        msg: "Unauthorized role",
      });
    }

    req.id = payload.id;

    next();
  } catch (e) {
      console.log(e);
    return res.status(401).json({
      msg: "The provided JWT is malformed",
    });
  }
};

verifyRole = (userRole, authorizedRoles) => {
  return authorizedRoles.includes(userRole);
};

module.exports = {
  authorizedAdmin,
  authorizedClient,
};