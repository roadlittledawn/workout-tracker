import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
// import withAuth from  '../utils/withAuth'

const getWeekStartAndEnd = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  const monday = today.getDate() - today.getDay() + 1;
  const sunday = today.getDate() - today.getDay() + 7;
  const mondayDate = new Date(year, month, monday);
  const sundayDate = new Date(year, month, sunday);
  const startOfWeek = Math.floor(mondayDate / 1000);
  const endOfWeek = Math.floor(sundayDate / 1000);
  return { startOfWeek, endOfWeek };
};

const { startOfWeek, endOfWeek } = getWeekStartAndEnd();

const activityEndpoint = `https://www.strava.com/api/v3/athlete/activities?per_page=100&before=${endOfWeek}&after=${startOfWeek}`;

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
          <div style={{ display: "flex" }}>
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
            <ul>
              {activityData.map((activity) => {
                if (activity.sport_type === "Walk") {
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
