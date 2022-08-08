import { DropdownOption } from '@core/interface';
import { CostCenter, CostCentersDto } from './../interface/common.interface';

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
    } else {
      const item = res[key] as CostCenter;

      options.push({
        text: item.formattedName,
        value: item.id,
      });
    }
  });
  return options;
}
