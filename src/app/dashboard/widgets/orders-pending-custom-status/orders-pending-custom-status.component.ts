import { Component, OnInit, OnChanges, ChangeDetectionStrategy,Input, SimpleChanges } from '@angular/core';
import { activePositionsLegendDisplayText } from '../../constants/active-positions-legend-palette';
import { OrdersPendingInCustomDataset } from '../../models/active-positions-dto.model';


@Component({
  selector: 'app-orders-pending-custom-status',
  templateUrl: './orders-pending-custom-status.component.html',
  styleUrls: ['./orders-pending-custom-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersPendingCustomStatusComponent implements OnInit, OnChanges {

  @Input() public chartData: any ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;
  @Input() widgetData: any; 

  public readonly activePositionsLegend: typeof activePositionsLegendDisplayText = activePositionsLegendDisplayText;

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

}
