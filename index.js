require("dotenv").config();
// or yarn add node-fetch@2
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const {
  ClientCredentials,
  ResourceOwnerPassword,
  AuthorizationCode,
} = require("simple-oauth2");
const express = require("express");

const app = express();
const port = 3000;

app.get("/oauth-callback", (req, res) => {
  const code = req.query.code;
  console.log(`Code from redirected callback params: ${code}`);
  res.send("Callback received");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const config = {
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://www.strava.com/oauth/authorize",
  },
};

async function run() {
  const client = new AuthorizationCode(config);

  const authorizationUri = client.authorizeURL({
    redirect_uri: "http://localhost:3000/oauth-callback",
    scope: "read,read_all,activity:read,activity:read_all",
  });

  console.log({ authorizationUri });

  const res = await fetch(authorizationUri, {
    redirect: "manual",
  });

  console.log(res.status);

  if (res.status === 301 || res.status === 302) {
    const locationURL = new URL(res.headers.get("location"), res.url);
    console.log(res.headers);
    // const response2 = await fetch(locationURL, { redirect: "manual" });
    // console.dir(response2);
  }

  // const body = await res.json();

  // console.log(res);

  // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
  // res.redirect(authorizationUri);

  // const tokenParams = {
  //   code: '<code>',
  //   redirect_uri: 'http://localhost:3000/callback',
  //   scope: '<scope>',
  // };

  // try {
  //   const accessToken = await client.getToken(tokenParams);
  // } catch (error) {
  //   console.log('Access Token Error', error.message);
  // }
}

run();
