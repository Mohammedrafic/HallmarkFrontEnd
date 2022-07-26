export const addLeadingZero = (val: number) => (val < 10 ? '0' + val : val);
export const getTime = (val: Date) =>
  addLeadingZero(val.getHours()) + ':' + addLeadingZero(val.getMinutes()) + ':' + addLeadingZero(val.getSeconds());
export const getHoursMinutesSeconds = (val: string /** HH:mm:ss */) => val.split(':').map((val) => parseInt(val));
export const militaryToStandard = (val: string /** HH:mm:ss */) => {
  let [h, m, s] = getHoursMinutesSeconds(val);
  let suffix = h >= 12 ? 'PM' : 'AM';
  let sH = addLeadingZero(((h + 11) % 12) + 1);
  let sM = m.toString().length === 1 ? '0' + m : m;
  return sH + ':' + sM + ' ' + suffix;
};
export const toCorrectTimezoneFormat = (value: Date | string): any => {
  const valueDate = new Date(value);
  const differentBetweenTimezone = new Date().getTimezoneOffset() * -1;
  return new Date(valueDate.getTime() + differentBetweenTimezone * 60000);
};
