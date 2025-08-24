
/**
 * Debug utility for logging objects to the console
 * @param label Label for the log
 * @param obj Object to log
 */
export const debugLog = (label: string, obj: any): void => {
  console.log(`------ DEBUG ${label} ------`);
  console.log(obj);
  console.log(`------ END ${label} ------`);
};

/**
 * Stringify an object with proper formatting
 * @param obj Object to stringify
 * @returns Formatted string
 */
export const prettyStringify = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

/**
 * Log SQL error details
 * @param error Error object
 * @param context Context information
 */
export const logSQLError = (error: any, context: string): void => {
  console.error(`SQL Error in ${context}:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
};
