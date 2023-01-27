import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { OrderMatch } from '@shared/enums/order-management';
import { orderMatchColorClasses, orderMatchIcons } from './order-match-column.constants';


@Component({
  selector: 'app-order-match-column',
  templateUrl: './order-match-column.component.html',
  styleUrls: ['./order-match-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderMatchColumnComponent {
  @Input() public orderMatch: OrderMatch;

  public readonly iconNames = orderMatchIcons;
  public readonly colorClasses = orderMatchColorClasses;
}
