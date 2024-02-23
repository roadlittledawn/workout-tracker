/**
 * Generates a random color in the format `rgba(r, g, b)`
 *
 * @returns {string} A random color in the format `rgba(r, g, b)`
 */

const randomColor = () => {
  // Generate random values for red, green, and blue components
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);

  // Return the color in the desired format
  return "rgba(" + r + ", " + g + ", " + b + ")";
};

export default randomColor;
