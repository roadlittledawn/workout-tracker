import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import moment from "moment";
import { CircularProgressbar } from "react-circular-progressbar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import LoginButton from "../components/LoginButton";
import styles from "../styles/Dashboard.module.scss";
import "react-circular-progressbar/dist/styles.css";
import {
  getActivityData,
  getAthleteActivities,
  getWeekStartAndEnd,
  convertMetersToMiles,
  calcDistanceDifference,
} from "../utils";

const WEEKLY_GOALS = {
  ["Run"]: 10,
  ["Walk"]: 10,
  ["Workout"]: 1,
};

const { startOfWeek, endOfWeek } = getWeekStartAndEnd();

const DashboardPage = ({ NODE_ENV, HOSTNAME, CLIENT_ID }) => {
  const envVars = { NODE_ENV, HOSTNAME, CLIENT_ID };
  const [activityData, setActivityData] = useState([]);
  const [previousActivityData, setPreviousActivityData] = useState([]);
  const [milesRan, setMilesRan] = useState(0);
  const [milesRanGoalPercent, setMilesRanGoalPercent] = useState(0);
  const [milesWalked, setMilesWalked] = useState(0);
  const [milesWalkedGoalPercent, setMilesWalkedGoalPercent] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalWorkoutsPercent, setTotalWorkoutsPercent] = useState(0);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Goal progress per week per activity",
      },
    },
  };

  const labels = [
    "6 weeks ago",
    "5 weeks ago",
    "4 weeks ago",
    "3 weeks ago",
    "2 weeks ago",
    "Last week",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Miles Ran",
        data: previousActivityData
          .sort((a, b) => a.order < b.order)
          .map(({ totalMilesRan }) => totalMilesRan),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Miles Walked",
        data: previousActivityData
          .sort((a, b) => a.order < b.order)
          .map(({ totalMilesWalked }) => totalMilesWalked),
        borderColor: "rgb(24, 113, 69)",
        backgroundColor: "rgba(24, 158, 69, 0.5)",
      },
      {
        label: "Total Workouts",
        data: previousActivityData
          .sort((a, b) => a.order < b.order)
          .map(({ totalWorkouts }) => totalWorkouts),
        borderColor: "rgb(24, 113, 69)",
        backgroundColor: "rgba(24, 158, 69, 0.5)",
      },
      {
        label: "Running Goal",
        data: labels.map(() => WEEKLY_GOALS["Run"]),
        borderColor: "rgba(0, 0, 0, 0.25)",
        backgroundColor: "rgba(0, 6, 12, 0.25)",
      },
      {
        label: "Walking Goal",
        data: labels.map(() => WEEKLY_GOALS["Walk"]),
        borderColor: "rgba(0, 0, 0, 0.25)",
        backgroundColor: "rgba(0, 6, 12, 0.25)",
      },
      {
        label: "Workout Goal",
        data: labels.map(() => WEEKLY_GOALS["Workout"]),
        borderColor: "rgba(0, 0, 0, 0.25)",
        backgroundColor: "rgba(0, 6, 12, 0.25)",
      },
    ],
  };

  useEffect(async () => {
    if (Cookies.get("seshToken")) {
      const accessToken = Cookies.get("seshToken");
      for (let a = 1; a <= 6; a++) {
        const start = moment().subtract(a, "weeks").startOf("isoWeek").unix();
        const end = moment().subtract(a, "weeks").endOf("isoWeek").unix();
        const data = getActivityData({ accessToken, start, end });
        data.then((res) => {
          const totalMilesRan = res.reduce(
            (accum, { sport_type, distance }) => {
              if (sport_type === "Run") {
                return Number(
                  (accum + convertMetersToMiles(distance)).toFixed(2)
                );
              } else {
                return accum;
              }
            },
            0
          );
          const totalMilesWalked = res.reduce(
            (accum, { sport_type, distance }) => {
              if (sport_type === "Walk") {
                return Number(
                  (accum + convertMetersToMiles(distance)).toFixed(2)
                );
              } else {
                return accum;
              }
            },
            0
          );
          const totalWorkouts = res.reduce((accum, { sport_type }) => {
            if (sport_type === "Workout") {
              return accum + 1;
            } else {
              return accum;
            }
          }, 0);

          setPreviousActivityData((prevState) => [
            ...prevState,
            {
              order: a,
              totalMilesRan,
              totalMilesWalked,
              totalWorkouts,
              activities: res,
            },
          ]);
        });
      }

      getAthleteActivities({
        accessToken,
        start: startOfWeek,
        end: endOfWeek,
      }).then((data) => {
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

      const totalWorkouts = activityData.filter(
        ({ sport_type }) => sport_type === "Workout"
      ).length;

      setTotalWorkouts(totalWorkouts);
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
    const totalWorkoutsPercent = Math.ceil(
      (totalWorkouts / WEEKLY_GOALS["Workout"]) * 100
    );
    setTotalWorkoutsPercent(totalWorkoutsPercent);
  }, [milesRan, milesWalked, totalWorkouts]);

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
              <p>
                {calcDistanceDifference(WEEKLY_GOALS["Run"], milesRan)} miles
                left!
              </p>
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
              <p>
                {calcDistanceDifference(WEEKLY_GOALS["Walk"], milesWalked)}{" "}
                miles left!
              </p>
            </div>
            <div>
              <h3>Workouts</h3>
              <CircularProgressbar
                value={totalWorkoutsPercent}
                text={`${totalWorkoutsPercent}%`}
              />
              <p>
                {totalWorkouts} workouts of your {WEEKLY_GOALS["Workout"]}{" "}
                workout goal
              </p>
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
            <ul>
              {activityData.map((activity) => {
                if (activity.sport_type === "Workout") {
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
                      </ul>
                    </>
                  );
                }
              })}
            </ul>
          </div>
        </>
      )}

      <h1>Previous week chart</h1>
      <div className={styles.chartsLineChart}>
        <Line options={options} data={chartData} />
      </div>
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
