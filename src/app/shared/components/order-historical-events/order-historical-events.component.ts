import { Component, Input } from '@angular/core';
import { OrderHistoricalEvent } from '@shared/models';
import { BusinessUnitModel, businessUnitValues } from '@shared/enums/business-unit-type';

@Component({
  selector: 'app-order-historical-events',
  templateUrl: './order-historical-events.component.html',
  styleUrls: ['./order-historical-events.component.scss'],
})
export class OrderHistoricalEventsComponent {
  @Input() public events: OrderHistoricalEvent[] | null;

  public readonly businessUnitValues: BusinessUnitModel = businessUnitValues;
}
