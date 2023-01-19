export const convertMetersToMiles = (meters) => {
  return Number((meters / 1609).toFixed(2));
};

export const calcDistanceDifference = (
  number1,
  number2,
  digitsAfterDecimal = 2
) => (number1 - number2).toFixed(digitsAfterDecimal);
