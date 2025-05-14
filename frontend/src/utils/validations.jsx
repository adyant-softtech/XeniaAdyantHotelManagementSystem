/**
 * Created by - Ashish Dewangan on 22-05-2024
 * Reason - To have different validation methods
 */

export const checkIsEmailInvalid = (value) => {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]/;
  if (pattern.test(value)) return false;

  return true;
};

export const checkIsNotADigit = (value) => {
  if (isNaN(value)) return true;
  return false;
};

export const checkIsEmpty = (value) => {
  if (value && value.toString().trim().length > 0) return false;
  return true;
};

export const checkIfGreaterThanMaxLength = (value, length) => {
  if (value && value.toString().trim().length > length) return true;
  return false;
};

export const checkIfSmallerThanMinLength = (value, length) => {
  if (value && value.toString().trim().length < length) return true;
  return false;
};

export const checkIfGreaterThanMaxValue = (value, maximum) => {
  if (value && maximum && value >= maximum) return true;
  return false;
};
export const checkIfMinimumThanMinValue = (value, minimum) => {
  if (value && minimum && value.length < minimum) return true; // Corrected to check for length
  return false;
};

/**Code added By Tejasve GUpta on 24-05-2024
  Reason - Confirm Password Matching
*/
export const checkPasswordDontmatch = (valueOne, valueTwo) => {
  return valueOne !== valueTwo;
};
/**End of Code added By Tejasve GUpta on 24-05-2024
  Reason - Confirm Password Matching
*/
