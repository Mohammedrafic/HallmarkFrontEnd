import { Holiday, HolidaysPage } from "@shared/models/holiday.model";

export const adaptToNameEntity = (arr: string[]): { name: string }[] => {
  return arr.map((item: string) => ({ name: item }));
};

export const convertHolidaysToDataSource = (holidays: HolidaysPage) => {
  let holidayCounter = 0;
  holidays.items.forEach((item: Holiday) => {
    holidayCounter += calculateDateDifferent(item.startDateTime, item.endDateTime);
  });

  const dataSource = [];

  for (let i = 0; i <= holidayCounter; i++) {
    dataSource.push({ name: i, id: i });
  }

  return dataSource;
}

export const calculateDateDifferent = (firstDate: Date | string, secondDate: Date | string) => {
  firstDate = new Date(firstDate);
  secondDate = new Date(secondDate);

  const differentInTime = secondDate.getTime() - firstDate.getTime();
  return Math.ceil(differentInTime / (1000 * 3600 * 24));
}
