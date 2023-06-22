export const addLeadingZero = (val: number) => (val < 10 ? '0' + val : val);

export const getTime = (val: Date) =>
  addLeadingZero(val.getHours()) + ':' + addLeadingZero(val.getMinutes()) + ':' + addLeadingZero(val.getSeconds());

export const getPreservedTime = (val: any) => (val !== null && val !== "") ? (val.split(":")[0]) + ':' + (val.split(":")[1]) : val;

export const getPreservedfilterTime = (val: any) => (val !== null && val !== "") ? (val + ':00'): val;

export const getHoursMinutesSeconds = (val: string /** HH:mm:ss */) => val.split(':').map((val) => parseInt(val));

export const militaryToStandard = (val: string /** HH:mm:ss */) => {
  let [h, m, s] = getHoursMinutesSeconds(val);
  let suffix = h >= 12 ? 'PM' : 'AM';
  let sH = addLeadingZero(((h + 11) % 12) + 1);
  let sM = m.toString().length === 1 ? '0' + m : m;
  return sH + ':' + sM + ' ' + suffix;
};

/**
 * DO NOT USE THIS FUNCTION. It's not working properly.
 */
export const toCorrectTimezoneFormat = (value: Date | string): any => {
  if (value) {
    const valueDate = new Date(value);
    const differentBetweenTimezone = new Date().getTimezoneOffset() * -1;
    return new Date(valueDate.getTime() + differentBetweenTimezone * 60000);
  }
};

export const getTimeFromDate = (date: Date, isUTC?: boolean): string | null => {
  if (!date) {
    return null;
  }

  const params = isUTC
    ? ({ hour: '2-digit', minute: '2-digit', timeZone: 'UTC' } as const)
    : ({ hour: '2-digit', minute: '2-digit' } as const);

  return new Date(date).toLocaleTimeString('en-US', { ...params });
};

export const setTimeToDate = (time: string | null): Date | null => {
  if (!time) {
    return null;
  }

  const todayDate = new Date().toLocaleDateString('en-US');
  return new Date(`${todayDate} ${time}`);
};

export const addDays = (date: string | Date, days: number): Date | null => {
  if (isNaN(new Date(date).valueOf())) {
    return null;
  }

  const newDate = new Date(date);
  return new Date(newDate.setDate(newDate.getDate() + days));
};

export const convertMsToTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  minutes = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
