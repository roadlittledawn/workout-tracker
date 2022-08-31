# workout-tracker

# Authenticating with Strava

## Authorization callback domain

Ensure the authorization callback domain used in `redirect_uri` is registered in the [Strava API app settings](https://www.strava.com/settings/api) in `Authorization Callback Domain` field. Note that `localhost` and `127.0.0.1` are [whitelisted by default](https://developers.strava.com/docs/authentication/#details-about-requesting-access).

## oAuth workflow

1. Go to this page in browser: https://www.strava.com/oauth/authorize?client_id=CLIENT_ID_HERE&&grant_type=authorization_code&scope=read,read_all,activity%3Aread,activity%3Aread_all&approval_prompt=force&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-callback&response_type=code

2. Approve permissions on oAuth page
3. When redirected get `code` param
4. Using that `code` value, send api call to: https://www.strava.com/oauth/token?client_id=ID_HERE&client_secret=SECRET_HERE&code=3a6b1dbf83fe2e84e8c7e698293599765767b9ac&grant_type=authorization_code
5. Use the new `access_code` returned in JSON in Bearer auth header in subsequent resource calls (for example, `/api/v3/athlete/activities`)

# Get athlete activities

Get all activity data for syncing to DB. Can use until refresh token required.

https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities


# Resources

Using [this repo](https://github.com/alexey-dc/nextjs_express_template) as template.

May use [this one](https://github.com/whoisryosuke/nextjs-oauth2-cookie-auth/tree/master/pages) too for oAuth / next.js / express

[Boilerplace custom server express](https://github.com/vercel/next.js/tree/canary/examples/custom-server-express) from Vercel
