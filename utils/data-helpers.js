export const getActivityData = async ({
  accessToken,
  start,
  end,
  perPage = 50,
}) => {
  try {
    const activityEndpoint = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&after=${start}&before=${end}`;

    const response = await fetch(activityEndpoint, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    return response.json();
  } catch (error) {
    console.log("Error retrieving data: ", error);
  }
};

export const getAthleteActivities = async ({
  accessToken,
  start,
  end,
  perPage = 50,
}) => {
  try {
    const activityEndpoint = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&after=${start}&before=${end}`;

    const response = await fetch(activityEndpoint, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    return response.json();
  } catch (error) {
    console.log("Error retrieving data: ", error);
  }
};
