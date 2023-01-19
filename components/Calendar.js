//TODO: Either write my own based on https://programmingwithmosh.com/react/build-a-react-calendar-component-from-scratch/

// OR

// use react-calendar https://github.com/wojtekmaj/react-calendar
import moment from "moment";

const Calendar = ({ startDate, endDate }) => {
  console.log({ month: moment().month(startDate).format("M") });

  const numberOfMonths = null;

  const months = [
    {
      monthNumber: moment().month(startDate).format("M"),
      nameOfMonth: moment().month(startDate).format("MMMM"),
      firstOfMonthDateStamp: null,
      daysInMonth: moment().month(startDate).daysInMonth(),
      maxRows: Math.ceil(moment().month(startDate).daysInMonth() / 7),
    },
  ];

  console.log({ months });

  return <>Calender here</>;
};

export default Calendar;
