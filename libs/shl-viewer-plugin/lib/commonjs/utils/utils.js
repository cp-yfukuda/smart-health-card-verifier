"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchWithTimeout = fetchWithTimeout;
exports.sortRecordByDateField = exports.formatDateOfBirth = void 0;
// NOTE: Timezone affects date presentation, so in US it will be 1 day behind,
//       that is why `new Date()` is not needed.
//       Birthday date in FHIR => "birthDate": "1960-01-20"
const formatDateOfBirth = birthDate => {
  const [year, month, day] = birthDate.split('-');
  const dateOfBirth = `${month}/${day}/${year}`;
  return dateOfBirth;
};
exports.formatDateOfBirth = formatDateOfBirth;
const sortRecordByDateField = (dateFieldName, records) => {
  records.sort((a, b) => Date.parse(a[dateFieldName]) - Date.parse(b[dateFieldName]));
  // set correct dose number if dose objects are swapped
  for (const [index, rec] of records.entries()) {
    rec.index = index + 1;
  }
};
exports.sortRecordByDateField = sortRecordByDateField;
async function fetchWithTimeout(url) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let timeout = arguments.length > 2 ? arguments[2] : undefined;
  let timeoutError = arguments.length > 3 ? arguments[3] : undefined;
  const controller = new AbortController();
  const timerPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(timeoutError);
    }, timeout);
  });
  return await Promise.race([fetch(url, {
    ...options,
    signal: controller.signal
  }), timerPromise]);
}
//# sourceMappingURL=utils.js.map