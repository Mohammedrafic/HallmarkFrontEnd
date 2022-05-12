export const addLeadingZero = (val: number) => val < 10 ? '0' + val : val;
export const getTime = (val: Date) => addLeadingZero(val.getHours()) + ':' + addLeadingZero(val.getMinutes()) + ':' + addLeadingZero(val.getSeconds());
