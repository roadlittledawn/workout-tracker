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
  TimeScale,
} from "chart.js";
import "chartjs-adapter-moment";
import LoginButton from "../components/LoginButton";
import styles from "../styles/Dashboard.module.scss";
import "react-circular-progressbar/dist/styles.css";
import {
  getActivityData,
  getAthleteActivities,
  getThisWeekStartAndEnd,
  getWeekStartAndEndDates,
  convertMetersToMiles,
  convertMetersToYards,
  calcDistanceDifference,
  getStartOfWeekDateStamp,
  getPastWeeksGoal,
} from "../utils";
import goals from "../data/goals.json";

const WEEKLY_GOALS = {
  ["Walk"]: 10,
};

const { startOfWeek, endOfWeek } = getThisWeekStartAndEnd();

const DashboardPage = ({ NODE_ENV, HOSTNAME, CLIENT_ID }) => {
  const envVars = { NODE_ENV, HOSTNAME, CLIENT_ID };
  // TODO: change name to `currentWeekActivityData`
  const [activityData, setActivityData] = useState([]);
  const [previousActivityData, setPreviousActivityData] = useState([]);
  // TODO: change `numberOfSwims` to `numberOfSwimsThisWeek`
  const [numberOfSwims, setNumberOfSwims] = useState(0);
  const [numberOfSwimsGoal, setNumberOfSwimsGoal] = useState(0);
  const [numberOfSwimsGoalPercent, setNumberOfSwimsGoalPercent] = useState(0);
  const [swimTimes, setSwimTimes] = useState([]);
  const [swimTimeDataByDistance, setswimTimeDataByDistance] = useState([]);
  const [milesWalked, setMilesWalked] = useState(0);
  const [milesWalkedGoalPercent, setMilesWalkedGoalPercent] = useState(0);
  const [allGoals, setAllGoals] = useState(goals);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
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

  const labels = getWeekStartAndEndDates(6, "M-D").map(
    ({ start, end }) => `${start} to ${end}`
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Number of swims",
        data: previousActivityData
          .sort((a, b) => a.order < b.order)
          .map(({ numberOfSwims }) => numberOfSwims),
        borderColor: "#c70039",
        backgroundColor: "#c70039",
      },
      {
        label: "Miles Walked",
        data: previousActivityData
          .sort((a, b) => a.order < b.order)
          .map(({ totalMilesWalked }) => totalMilesWalked),
        borderColor: "rgb( 31, 97, 141 )",
        backgroundColor: "rgba( 31, 97, 141 )",
      },
      {
        label: "Swim Goal",
        data: getPastWeeksGoal(
          allGoals.find(({ goalId }) => goalId === "total-swims"),
          getStartOfWeekDateStamp(startOfWeek, "YYYY-M-D"),
          7
        ),
        borderColor: "#c700392e",
        backgroundColor: "#c700392e",
      },
      {
        label: "Walking Goal",
        data: labels.map(() => WEEKLY_GOALS["Walk"]),
        borderColor: "rgba( 31, 97, 141, 0.25 )",
        backgroundColor: "rgba( 31, 97, 141 , 0.25)",
      },
    ],
  };

  const currentWeekSwimTimeLabels = swimTimes.map(
    (_, index) => `Swim ${index + 1}`
  );

  const createSwimChartXAxisLabels = (previousActivityData) => {
    const numberOfSwims = previousActivityData.reduce((accum, curr) => {
      return accum + curr.numberOfSwims;
    }, 0);
    const labels = [];
    for (let i = 1; i <= numberOfSwims; i++) {
      labels.push(`Swim ${i}`);
    }
    return labels;
  };

  const currentSwimTimesDatasets = (swimTimeData) => {
    const swimTimesByDistance = swimTimeData.reduce((accum, curr) => {
      const distance = curr.distance;
      const distanceInYards = Math.floor(convertMetersToYards(distance));
      const pacePer100YardsInSeconds = parseFloat(
        (curr.durationSeconds / (distanceInYards / 100)).toFixed(2)
      );
      const duration = moment.duration(pacePer100YardsInSeconds, "seconds");
      curr.pacePer100Yards = moment
        .utc(duration.asMilliseconds())
        .format("mm:ss");
      const hasProperty = accum.some((obj) => obj.distance === distance);
      if (hasProperty) {
        const index = accum.findIndex((obj) => obj.distance === distance);
        accum[index].distanceInYards = distanceInYards;
        accum[index].times.push(curr);
      } else {
        accum.push({ distance, distanceInYards, times: [curr] });
      }
      return accum;
    }, []);

    const datasets = swimTimesByDistance.map(({ times, distanceInYards }) => ({
      label: `${distanceInYards}yds`,
      data: times.map(({ durationSeconds }) => durationSeconds),
      borderColor: "rgb( 31, 97, 141 )",
      backgroundColor: "rgba( 31, 97, 141 )",
      tension: 0.1,
    }));

    return [
      ...datasets,
      {
        label: "900yds goal",
        data: [1500],
        borderColor: "#c700392e",
        backgroundColor: "#c700392e",
      },
    ];
  };

  const currentWeekSwimTimeChartData = {
    labels: currentWeekSwimTimeLabels,
    datasets: currentSwimTimesDatasets(swimTimes),
  };

  const currentWeekSwimPaceChartData = {
    labels: currentWeekSwimTimeLabels,
    datasets: swimTimeDataByDistance.map(({ times, distanceInYards }) => ({
      label: `${distanceInYards}yds`,
      data: times.map(
        ({ pacePer100YardsInSeconds }) => pacePer100YardsInSeconds
      ),
      borderColor: "rgb( 31, 97, 141 )",
      backgroundColor: "rgba( 31, 97, 141 )",
      tension: 0.1,
    })),
  };

  /**
   *
   * @param {Array.<swimTimeObject>} swimTimeDataByDistance Array of swim time objects. Each object contains data for times for a particular distance.
   * @param {Object} swimTimeObject "Object containing swim data. `distance` is keyed off to organize times"
   * @param {Number} swimTimeObject.distanceInYards "Distance in yards. Calculated in useEffect. Used as label of each dataset"
   * @returns
   */
  const pastWeeksSwimPaceChartDatasets = (previousActivityData) => {
    const swimTimeData = previousActivityData.filter(
      ({ swimTimesByDistance, order }) =>
        swimTimesByDistance.length > 0 ? { swimTimesByDistance, order } : null
    );

    const swimTimeDataSets = swimTimeData.reduce((accum, curr) => {
      curr.swimTimesByDistance.forEach((timeObj) => {
        timeObj.times = timeObj.times.filter((time) => time.distanceMeters > 0);

        if (timeObj.times.length > 0) {
          timeObj.times.forEach((time) => {
            const datasetExists = accum.some(
              (obj) => obj.distance === time.distanceMeters
            );
            if (datasetExists) {
              const index = accum.findIndex(
                (obj) => obj.distance === time.distanceMeters
              );
              time.order = curr.order;
              accum[index].times.push(time);
            } else {
              accum.push({
                order: curr.order,
                distance: time.distanceMeters,
                distanceInYards: time.distanceInYards,
                times: [time],
              });
            }
          });
        }
      });
      return accum;
    }, []);

    swimTimeDataSets.forEach((swimTimeForDistance) => {
      if (swimTimeForDistance.times.length > 0) {
        swimTimeForDistance.times.sort((a, b) => {
          return moment(a.start_date).unix() - moment(b.start_date).unix();
        });
      }
    });

    const datasets = swimTimeDataSets.map(({ distanceInYards, times }) => ({
      label: `${distanceInYards}yds`,
      data: times.map(
        ({ pacePer100YardsInSeconds }) => pacePer100YardsInSeconds
      ),
      borderColor: "rgb( 31, 97, 141 )",
      backgroundColor: "rgba( 31, 97, 141 )",
      tension: 0.1,
    }));

    return [
      ...datasets,
      {
        label: "Pace Goal (900yds)",
        data: [169],
        borderColor: "#c700392e",
        backgroundColor: "#c700392e",
      },
    ];
  };

  // TODO: make labels dynamic
  const pastWeeksSwimPaceChartData = {
    labels: createSwimChartXAxisLabels(previousActivityData),
    datasets: pastWeeksSwimPaceChartDatasets(previousActivityData),
  };

  const pastWeeksSwimTimesChartDatasets = (previousActivityData) => {
    // TODO: filter for only swim activities?
    const swimTimeData = previousActivityData.filter(
      ({ swimTimesByDistance, order }) =>
        swimTimesByDistance.length > 0 ? { swimTimesByDistance, order } : null
    );

    const swimTimeDataSets = swimTimeData.reduce((accum, curr) => {
      curr.swimTimesByDistance.forEach((timeObj) => {
        timeObj.times = timeObj.times.filter((time) => time.distanceMeters > 0);

        if (timeObj.times.length > 0) {
          timeObj.times.forEach((time) => {
            const datasetExists = accum.some(
              (obj) => obj.distance === time.distanceMeters
            );
            if (datasetExists) {
              const index = accum.findIndex(
                (obj) => obj.distance === time.distanceMeters
              );
              time.order = curr.order;
              accum[index].times.push(time);
            } else {
              accum.push({
                order: curr.order,
                distance: time.distanceMeters,
                distanceInYards: time.distanceInYards,
                times: [time],
              });
            }
          });
        }
      });
      return accum;
    }, []);

    swimTimeDataSets.forEach((swimTimeForDistance) => {
      if (swimTimeForDistance.times.length > 0) {
        swimTimeForDistance.times.sort((a, b) => {
          return moment(a.start_date).unix() - moment(b.start_date).unix();
        });
      }
    });

    const datasets = swimTimeDataSets.map(({ distanceInYards, times }) => ({
      label: `${distanceInYards}yds`,
      data: times.map(({ movingTimeSeconds }) => movingTimeSeconds),
      borderColor: "rgb( 31, 97, 141 )",
      backgroundColor: "rgba( 31, 97, 141 )",
      tension: 0.1,
    }));

    return [
      ...datasets,
      {
        label: "Time Goal (900yds)",
        data: [1522],
        borderColor: "#c700392e",
        backgroundColor: "#c700392e",
      },
    ];
  };

  // TODO
  // - make goal dynamic
  // - make dataset colors dynamic
  // - dedupe code with pastWeeksSwimPaceChartDatasets

  const pastWeeksSwimTimeChartData = {
    labels: createSwimChartXAxisLabels(previousActivityData),
    datasets: pastWeeksSwimTimesChartDatasets(previousActivityData),
  };

  useEffect(async () => {
    if (Cookies.get("seshToken")) {
      const accessToken = Cookies.get("seshToken");
      for (let a = 0; a <= 6; a++) {
        const start = moment().subtract(a, "weeks").startOf("isoWeek").unix();
        const end = moment().subtract(a, "weeks").endOf("isoWeek").unix();
        const data = getActivityData({ accessToken, start, end });
        data.then((res) => {
          const numberOfSwims = res.reduce((accum, { sport_type }) => {
            if (sport_type === "Swim") {
              return Number(accum + 1);
            } else {
              return accum;
            }
          }, 0);

          // Change to match shape of swimTimeDataByDistance
          const swimTimesByDistance = res
            .filter(({ sport_type }) => sport_type === "Swim")
            .reduce((accum, curr) => {
              const distance = curr.distance;
              const distanceInYards = Math.floor(
                convertMetersToYards(distance)
              );
              const pacePer100YardsInSeconds = Math.floor(
                parseFloat(
                  (curr.moving_time / (distanceInYards / 100)).toFixed(2)
                )
              );
              const duration = moment.duration(
                pacePer100YardsInSeconds,
                "seconds"
              );
              const pacePer100YardsFormatted = moment
                .utc(duration.asMilliseconds())
                .format("mm:ss");
              const hasProperty = accum.some(
                (obj) => obj.distance === distance
              );
              const swimTimeObject = {
                start_date: curr.start_date,
                distanceMeters: distance,
                distanceInYards,
                movingTimeSeconds: curr.moving_time,
                pacePer100YardsInSeconds,
                pacePer100YardsFormatted,
              };
              if (hasProperty) {
                const index = accum.findIndex(
                  (obj) => obj.distance === distance
                );
                accum[index].distanceInYards = distanceInYards;
                accum[index].times.push(swimTimeObject);
              } else {
                accum.push({
                  distance,
                  distanceInYards,
                  times: [swimTimeObject],
                });
              }
              return accum;
            }, []);

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

          setPreviousActivityData((prevState) => [
            ...prevState,
            {
              order: a,
              numberOfSwims,
              swimTimesByDistance,
              totalMilesWalked,
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
      const numberOfSwims = activityData.filter(
        ({ sport_type }) => sport_type === "Swim"
      ).length;

      setNumberOfSwims(numberOfSwims);

      const swimTimesThisWeek = activityData
        .filter(({ sport_type }) => sport_type === "Swim")
        .map(({ start_date, moving_time, distance }) => {
          const duration = moment.duration(moving_time, "seconds");
          const formattedDuration = moment
            .utc(duration.asMilliseconds())
            .format("HH:mm:ss");
          return {
            start_date,
            durationSeconds: moving_time,
            formattedDuration,
            distance,
          };
        });

      setSwimTimes(swimTimesThisWeek);

      // New swim time data shape

      const swimTimesByDistance = swimTimesThisWeek.reduce((accum, curr) => {
        const distance = curr.distance;
        const distanceInYards = Math.floor(convertMetersToYards(distance));
        const pacePer100YardsInSeconds = parseFloat(
          (curr.durationSeconds / (distanceInYards / 100)).toFixed(2)
        );
        curr.pacePer100YardsInSeconds = Math.floor(pacePer100YardsInSeconds);
        const duration = moment.duration(pacePer100YardsInSeconds, "seconds");
        curr.pacePer100Yards = moment
          .utc(duration.asMilliseconds())
          .format("mm:ss");
        const hasProperty = accum.some((obj) => obj.distance === distance);
        if (hasProperty) {
          const index = accum.findIndex((obj) => obj.distance === distance);
          accum[index].distanceInYards = distanceInYards;
          accum[index].times.push(curr);
        } else {
          accum.push({ distance, distanceInYards, times: [curr] });
        }
        return accum;
      }, []);

      setswimTimeDataByDistance(swimTimesByDistance);

      const totalMetersWalked = activityData
        .filter(({ sport_type }) => sport_type === "Walk")
        .reduce((prev, curr) => prev + curr.distance, 0);

      setMilesWalked(convertMetersToMiles(totalMetersWalked));
    }
  }, [activityData]);

  useEffect(() => {
    const numberOfSwimsGoalObject = allGoals.find(
      (goal) => goal.goalId === "total-swims"
    );
    setNumberOfSwimsGoal(numberOfSwimsGoalObject.targetMetricNumber);
  }, allGoals);

  useEffect(() => {
    if (numberOfSwims) {
      const percentProgress = Math.ceil(
        (numberOfSwims / numberOfSwimsGoal) * 100
      );

      setNumberOfSwimsGoalPercent(percentProgress);
    }
    if (milesWalked) {
      const percentProgress = Math.ceil(
        (milesWalked / WEEKLY_GOALS["Walk"]) * 100
      );
      setMilesWalkedGoalPercent(percentProgress);
    }
  }, [milesWalked, numberOfSwims, allGoals]);

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
              <h3>Swim Times</h3>
              <Line
                datasetIdKey="swimTimeLineChart"
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      title: { text: "seconds", display: true },
                      reverse: true,
                    },
                  },
                }}
                data={currentWeekSwimTimeChartData}
              />
            </div>
            <div>
              <h3>Swim Pace</h3>
              <Line
                datasetIdKey="swimPaceLineChart"
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      title: { text: "seconds", display: true },
                      reverse: true,
                    },
                  },
                }}
                data={currentWeekSwimPaceChartData}
              />
            </div>
            <div>
              <h3>Total Swims</h3>
              <CircularProgressbar
                value={numberOfSwimsGoalPercent}
                text={`${numberOfSwimsGoalPercent}%`}
              />
              <p>
                {numberOfSwims} swims of {numberOfSwimsGoal} swim goal
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
          </div>
          <h2>Weekly log</h2>
          <div className={styles.activityList}>
            <ul>
              {activityData.map((activity) => {
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
              })}
            </ul>
          </div>
        </>
      )}

      <h1>Previous weeks</h1>
      <div className={styles.chartsLineChart}>
        <Line datasetIdKey="previousData" options={options} data={chartData} />
      </div>
      <h2>Swim pace over time</h2>
      <div className={styles.chartsLineChart}>
        <Line
          datasetIdKey="previousDataSwimTimes"
          options={{ responsive: true, scales: { y: { reverse: true } } }}
          data={pastWeeksSwimPaceChartData}
        />
      </div>
      <h2>Swim times over time</h2>
      <div className={styles.chartsLineChart}>
        <Line
          datasetIdKey="previousDataSwimPace"
          options={{ responsive: true, scales: { y: { reverse: true } } }}
          data={pastWeeksSwimTimeChartData}
        />
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
