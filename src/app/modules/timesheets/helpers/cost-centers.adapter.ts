import { DropdownOption } from '@core/interface';
import { CostCentersDto } from '../interface';

export const CostCenterAdapter = (res: CostCentersDto) => {
  const options: DropdownOption[] = [];

  Object.keys(res).forEach((key) => {
    const data = res[key];

    if (Array.isArray(data)) {
      data.forEach((center) => {
        options.push({
          text: center.formattedName,
          value: center.id,
        });
      });
    } else if (data) {
      options.push({
        text: data.formattedName,
        value: data.id,
      });
    }
  });

  return options;
};
