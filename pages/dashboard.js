import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import moment from "moment";
import { CircularProgressbar } from "react-circular-progressbar";
import LoginButton from "../components/LoginButton";
import styles from "../styles/Dashboard.module.scss";
import "react-circular-progressbar/dist/styles.css";

const getWeekStartAndEnd = () => {
  const mondayDate = new Date(moment().startOf("isoWeek"));
  const sundayDate = new Date(moment().endOf("isoWeek"));

  const startOfWeek = Math.floor(mondayDate / 1000);
  const endOfWeek = Math.floor(sundayDate / 1000);
  return { startOfWeek, endOfWeek };
};

const WEEKLY_GOALS = {
  ["Run"]: 10,
  ["Walk"]: 10,
};

const { startOfWeek, endOfWeek } = getWeekStartAndEnd();

const activityEndpoint = `https://www.strava.com/api/v3/athlete/activities?per_page=100&after=${startOfWeek}&before=${endOfWeek}`;

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

const DashboardPage = ({ NODE_ENV, HOSTNAME, CLIENT_ID }) => {
  const envVars = { NODE_ENV, HOSTNAME, CLIENT_ID };
  const [activityData, setActivityData] = useState([]);
  const [milesRan, setMilesRan] = useState(0);
  const [milesRanGoalPercent, setMilesRanGoalPercent] = useState(0);
  const [milesWalked, setMilesWalked] = useState(0);
  const [milesWalkedGoalPercent, setMilesWalkedGoalPercent] = useState(0);

  useEffect(async () => {
    if (Cookies.get("seshToken")) {
      getAthleteActivities(Cookies.get("seshToken")).then((data) => {
        setActivityData(data);
      });
    }
  }, []);

  useEffect(() => {
    if (activityData.length > 0) {
      const totalMetersRan = activityData
        .filter(({ sport_type }) => sport_type === "Run")
        .reduce((prev, curr) => prev + curr.distance, 0);

      setMilesRan(convertMetersToMiles(totalMetersRan));

      const totalMetersWalked = activityData
        .filter(({ sport_type }) => sport_type === "Walk")
        .reduce((prev, curr) => prev + curr.distance, 0);

      setMilesWalked(convertMetersToMiles(totalMetersWalked));
    }
  }, [activityData]);

  useEffect(() => {
    if (milesRan) {
      const percentProgress = Math.ceil((milesRan / WEEKLY_GOALS["Run"]) * 100);
      setMilesRanGoalPercent(percentProgress);
    }
    if (milesWalked) {
      const percentProgress = Math.ceil(
        (milesWalked / WEEKLY_GOALS["Walk"]) * 100
      );
      setMilesWalkedGoalPercent(percentProgress);
    }
  }, [milesRan]);

  return (
    <>
      <header className={styles.header}>
        <div>
          <LoginButton envVars={envVars} size="default">
            Login via Strava
          </LoginButton>
        </div>
      </header>
      <h1>Dashboard</h1>
      {activityData && (
        <>
          <h2>Weekly goal progress</h2>
          <div className={styles.charts}>
            <div>
              <h3>Run</h3>
              <CircularProgressbar
                value={milesRanGoalPercent}
                text={`${milesRanGoalPercent}%`}
              />
              <p>
                {milesRan} miles of {WEEKLY_GOALS["Run"]} mile goal
              </p>
              <p>{WEEKLY_GOALS["Run"] - milesRan} miles left!</p>
            </div>
            <div>
              <h3>Walk</h3>
              <CircularProgressbar
                value={milesWalkedGoalPercent}
                text={`${milesWalkedGoalPercent}%`}
              />
              <p>
                {milesWalked} miles of {WEEKLY_GOALS["Walk"]} mile goal
              </p>
              <p>{WEEKLY_GOALS["Walk"] - milesWalked} miles left!</p>
            </div>
          </div>
          <h2>Weekly log</h2>
          <div className={styles.activityList}>
            <ul>
              {activityData.map((activity) => {
                if (activity.sport_type === "Run") {
                  return (
                    <>
                      <li>
                        <a
                          href={`https://www.strava.com/activities/${activity.id}`}
                          target="_blank"
                        >
                          {activity.name}
                        </a>
                      </li>
                      <ul>
                        <li>
                          {moment(activity.start_date).format(
                            "ddd, MMM D [@] HH:mm zz"
                          )}
                        </li>
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
                      <li>
                        {" "}
                        <a
                          href={`https://www.strava.com/activities/${activity.id}`}
                          target="_blank"
                        >
                          {activity.name}
                        </a>
                      </li>
                      <ul>
                        <li>
                          {moment(activity.start_date).format(
                            "ddd, MMM D [@] HH:mm zz"
                          )}
                        </li>
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

export const getServerSideProps = () => {
  const NODE_ENV = process.env.NODE_ENV;
  const HOSTNAME = process.env.HOSTNAME;
  const CLIENT_ID = process.env.CLIENT_ID;

  return { props: { NODE_ENV, HOSTNAME, CLIENT_ID } };
};

export default DashboardPage;
