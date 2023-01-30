import { OrderMatch } from '@shared/enums/order-management';

export const orderMatchIcons = {
  [OrderMatch.Unassigned]: 'alert-triangle',
  [OrderMatch.Assigned]: 'check-circle',
  [OrderMatch.NotRequired]: 'x-circle',
}

export const orderMatchColorClasses = {
  [OrderMatch.Unassigned]: 'red',
  [OrderMatch.Assigned]: 'green',
  [OrderMatch.NotRequired]: 'yellow',
};
