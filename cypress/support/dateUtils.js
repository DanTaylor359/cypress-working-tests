// function to add 3 years to current date and return in YYYY/MM format
export function addThreeYearsToYearMonth(isoString) { 
  const date = new Date(isoString); 
  const year = date.getUTCFullYear() + 3; 
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // 2 chars long, if month is single digit, add leading zero
  
  return `${year}/${month}`; 
} 

// function to get current date and time in ISO format YYYY-MM-DDTHH:mm:ss.sssZ
export function getNowISO() {
  return new Date().toISOString();
}