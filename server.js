const express = require("express");
const next = require("next");
require("dotenv").config();
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

// Setup CSRF Middleware
var csrfProtection = csrf({ cookie: true });

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  const middlewares = [
    bodyParser.urlencoded(),
    cookieParser("sesh-dash"),
    csrfProtection,
  ];
  server.use(middlewares);

  server.get("/oauth-callback", (req, res) => {
    const code = req.query.code;
    console.log(`Code from redirected callback params: ${code}`);
    res.send("Callback received");
  });

  server.get("/token", (req, res) => {
    const callback = {
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.query.code,
    };

    // Query API for token
    fetch("https://www.strava.com/oauth/token", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callback),
    })
      .then((r) => r.json())
      .then((data) => {
        // Store JWT from response in cookies
        if (req.cookies["seshToken"]) {
          res.clearCookie("seshToken");
        }
        res.cookie("seshToken", data.access_token, {
          maxAge: 900000,
          httpOnly: false,
        });
        return res.redirect("/dashboard");
      });

    //Redirect to dashboard after login
    // return app.render(req, res, '/dashboard')
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
