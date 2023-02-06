import moment from "moment";

export const getThisWeekStartAndEnd = () => {
  const mondayDate = new Date(moment().startOf("isoWeek"));
  const sundayDate = new Date(moment().endOf("isoWeek"));

  const startOfWeek = Math.floor(mondayDate / 1000);
  const endOfWeek = Math.floor(sundayDate / 1000);
  return { startOfWeek, endOfWeek };
};

export const getStartOfWeekDateStamp = (startOfWeekUnix, formatString) => {
  return moment(startOfWeekUnix * 1000).format(formatString);
};

/**
 * Gets the start and end date stamp of a given number of weeks ago from current one.
 * @param {Number} numberOfWeeks Number of past weeks to return including current one.
 * @param {string} dateFormatString Date format to return via moment.js. E.g., 'YYYY-M-D'
 * @param {string} order Sort order returned in array. `asc` = earliest to latest. `desc` = latest to earliest.
 * @returns {Array} Array of objects containing `start` and `end` formatted time.
 */

export const getWeekStartAndEndDates = (
  numberOfWeeks,
  dateFormatString,
  order = "asc"
) => {
  const weekDateRanges = [];

  for (let a = 0; a <= numberOfWeeks; a++) {
    const start = moment()
      .subtract(a, "weeks")
      .startOf("isoWeek")
      .format(dateFormatString);
    const end = moment()
      .subtract(a, "weeks")
      .endOf("isoWeek")
      .format(dateFormatString);
    weekDateRanges.push({ start: start, end: end });
  }
  return order === "asc" ? weekDateRanges.reverse() : weekDateRanges;
};
