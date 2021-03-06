const expressJwt = require("express-jwt");

function authJwt() {
  return expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      "/api/users/login",
      "/api/users/register",
      { url: /\/api\/orders(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      { url: /\/api\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/public\/upload(.*)/, methods: ["GET", "OPTIONS"] },
    ],
  });
}

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }

  done();
}

module.exports = authJwt;
