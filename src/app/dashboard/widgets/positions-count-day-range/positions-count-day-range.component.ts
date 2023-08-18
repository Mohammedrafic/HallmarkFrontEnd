import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { activePositionsLegendDisplayText } from '../../constants/active-positions-legend-palette';
import { PositionsCountByDayRangeDataset } from '../../models/active-positions-dto.model';

@Component({
  selector: 'app-positions-count-day-range',
  templateUrl: './positions-count-day-range.component.html',
  styleUrls: ['./positions-count-day-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsCountDayRangeComponent implements OnInit {

  @Input() public chartData: PositionsCountByDayRangeDataset | undefined ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;

  public readonly activePositionsLegend: typeof activePositionsLegendDisplayText = activePositionsLegendDisplayText;

  constructor() { }

  ngOnInit(): void {
  }

}
