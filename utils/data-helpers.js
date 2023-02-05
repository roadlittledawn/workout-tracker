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

export const getThisWeeksGoal = (goalsByWeek, dateKey) => {
  return goalsByWeek.find((item) => Object.keys(item)[0] === dateKey)[dateKey];
};

/**
 * Get goal targets from this and past X amount of weeks.
 * @param {Array} goalsByWeek - Array of goal objects where each key is start of week's date stamp YYYY-M-D.
 * @param {String} dateKey - String of start of week's date stamp used as goal object's key.
 * @param {*} weeksAgo - How many weeks of data to retrieve including this week's.
 * @returns {Array} - Goal metric numbers. Oldest is first in array.
 */
export const getPastWeeksGoal = (goalData, dateKey, numberOfWeeks) => {
  const weeksGoals = [];
  if (goalData.goalVariesByWeek === true) {
    const { goalsByWeek } = goalData;
    const indexOfCurrentWeek = goalsByWeek.findIndex(
      (item) => Object.keys(item)[0] === dateKey
    );
    for (var i = 0; i < numberOfWeeks; i++) {
      let currentItemIndex = indexOfCurrentWeek - i;
      if (goalsByWeek[currentItemIndex]) {
        weeksGoals.push(Object.values(goalsByWeek[currentItemIndex])[0]);
      } else {
        weeksGoals.push(0);
      }
    }
  } else {
    for (var i = 0; i < numberOfWeeks; i++)
      weeksGoals.push(goalData.targetMetricNumber);
  }
  return weeksGoals.reverse();
};
