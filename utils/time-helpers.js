import moment from "moment";

export const getWeekStartAndEnd = () => {
  const mondayDate = new Date(moment().startOf("isoWeek"));
  const sundayDate = new Date(moment().endOf("isoWeek"));

  const startOfWeek = Math.floor(mondayDate / 1000);
  const endOfWeek = Math.floor(sundayDate / 1000);
  return { startOfWeek, endOfWeek };
};
