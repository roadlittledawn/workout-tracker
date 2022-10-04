const getActivityData = async ({ accessToken, start, end, perPage = 50 }) => {
  const activityEndpoint = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&after=${start}&before=${end}`;

  try {
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

export default getActivityData;
