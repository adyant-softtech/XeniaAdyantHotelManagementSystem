/**Code  Created by Tejasve Gupta on 20-06-2024
Reason -  for date*/

export function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const currentDate = `${day}-${month}-${year}`;
  return currentDate;
}
// Addition by Om Shrivastava on 18-10-2024
// Reason : Create the method fror get the current date 
export function getCurrentDateforArrivalDate() {
  const date = new Date();
  return date.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
};
// End of addition by Om Shrivastava on 18-10-2024
// Reason : Create the method fror get the current date 

/**End of Code  Created by Tejasve Gupta on 20-06-2024
Reason -  for date*/
