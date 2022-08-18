import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
// import withAuth from  '../utils/withAuth'

const activityEndpoint = "https://www.strava.com/api/v3/athlete/activities";

const getAthleteActivities = async (accesToken) => {
  try {
    const response = await fetch(activityEndpoint, {
      headers: {
        Authorization: "Bearer " + accesToken,
      },
    });

    return response.json();
  } catch (error) {
    console.log("Error retrieving data: ", error);
  }
};

const convertMetersToMiles = (meters) => {
  return (meters / 1609).toFixed(2);
};

const DashboardPage = () => {
  const [activityData, setActivityData] = useState([]);

  useEffect(async () => {
    console.log({ cookie: Cookies.get("seshToken") });
    if (Cookies.get("seshToken")) {
      // TODO: figure out why i can't read cookie
      getAthleteActivities(Cookies.get("seshToken")).then((data) => {
        setActivityData(data);
      });
    }
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      {activityData && (
        <>
          <h2>Activities</h2>
          <div>
            <ul>
              {activityData.map((activity) => {
                if (activity.sport_type === "Run") {
                  return (
                    <>
                      <li>{activity.name}</li>
                      <ul>
                        <li>{activity.start_date}</li>
                        <li>{convertMetersToMiles(activity.distance)} miles</li>
                      </ul>
                    </>
                  );
                }
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
// export default withAuth((Dashboard));
