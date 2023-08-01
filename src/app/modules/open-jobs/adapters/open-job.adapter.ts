import { DateTimeHelper } from '@core/helpers';
import { OpenJob, OpenJobPage } from '../interfaces';
import { OrderJobName } from '../constants';

export class OpenJobsAdapter {
  static adaptOpenJobPage(openJobPage: OpenJobPage): OpenJobPage {
    return {
      ...openJobPage,
      items: openJobPage.items.map((item: OpenJob) => {
        return {
          ...item,
          startDate: DateTimeHelper.setUtcTimeZone(item.startDate),
          endDate: DateTimeHelper.setUtcTimeZone(item.endDate),
          orderTypeName: OrderJobName[item.orderType],
        };
      }),
    };
  }
}
