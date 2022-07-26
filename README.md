# workout-tracker

# Authenticating with Strava

1. Go to this page in browser: https://www.strava.com/oauth/authorize?client_id=ID_HERE&client_secret=SECRET_HERE&grant_type=authorization_code&scope=read,read_all,activity%3Aread,activity%3Aread_all&approval_prompt=force&redirect_uri=http%3A%2F%2Flocalhost%2Fexchange_token&response_type=code
2. Approve permissions on oAuth page
3. When redirected get `code` param
4. Using that `code` value, send api call to: https://www.strava.com/oauth/token?client_id=ID_HERE&client_secret=SECRET_HERE&code=3a6b1dbf83fe2e84e8c7e698293599765767b9ac&grant_type=authorization_code
5. Use the new `access_code` returned in JSON in Bearer auth header in subsequent calls

# Example activity data

```json
{
		"resource_state": 2,
		"athlete": {
			"id": 4637956,
			"resource_state": 1
		},
		"name": "Evening Walk",
		"distance": 3055.1,
		"moving_time": 2141,
		"elapsed_time": 5702,
		"total_elevation_gain": 0.0,
		"type": "Walk",
		"sport_type": "Walk",
		"id": 7529252548,
		"start_date": "2022-07-26T02:10:32Z",
		"start_date_local": "2022-07-25T19:10:32Z",
		"timezone": "(GMT-08:00) America/Los_Angeles",
		"utc_offset": -25200.0,
		"location_city": null,
		"location_state": null,
		"location_country": "United States",
		"achievement_count": 0,
		"kudos_count": 0,
		"comment_count": 0,
		"athlete_count": 1,
		"photo_count": 0,
		"map": {
			"id": "a7529252548",
			"summary_polyline": "iwptG|}kkVQa@@_@BW@c@K}CAsBESCCK@gAGc@BSCaBDYBc@Ci@?u@AgABo@Gm@Ds@GMFW?c@Es@@IICGQIc@CGDK@CGQAEMAGAF`@KHg@K[IH?FBBACCDEA?VEDMDBDh@@HIE?CSo@f@NLf@A^KLDDADDxBRTGdAEh@FZAPB`AKd@@HB`@?HCJDZCBBn@?l@CVb@`@Aj@FV?x@f@QXFb@Bz@A^DPErBFtA",
			"resource_state": 2
		},
		"trainer": false,
		"commute": false,
		"manual": false,
		"private": false,
		"visibility": "followers_only",
		"flagged": false,
		"gear_id": null,
		"start_latlng": [
			45.473674,
			-122.619436
		],
		"end_latlng": [
			45.473399,
			-122.620715
		],
		"average_speed": 1.427,
		"max_speed": 2.58,
		"has_heartrate": false,
		"heartrate_opt_out": false,
		"display_hide_heartrate_option": false,
		"elev_high": 78.1,
		"elev_low": 72.8,
		"upload_id": 8028358601,
		"upload_id_str": "8028358601",
		"external_id": "3A463F65-DE32-4D5F-9D68-4A7A5D2BFC97",
		"from_accepted_tag": false,
		"pr_count": 0,
		"total_photo_count": 0,
		"has_kudoed": false
	},
  ]
```
