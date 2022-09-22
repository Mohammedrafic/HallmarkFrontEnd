import { Component, Input } from '@angular/core';
import { OrderHistoricalEvent } from '@shared/models';

@Component({
  selector: 'app-order-historical-events',
  templateUrl: './order-historical-events.component.html',
  styleUrls: ['./order-historical-events.component.scss'],
})
export class OrderHistoricalEventsComponent {
  @Input() public events: OrderHistoricalEvent[] | null;
}
