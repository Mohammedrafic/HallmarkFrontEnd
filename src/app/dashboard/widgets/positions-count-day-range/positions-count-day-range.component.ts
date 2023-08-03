import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-positions-count-day-range',
  templateUrl: './positions-count-day-range.component.html',
  styleUrls: ['./positions-count-day-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PositionsCountDayRangeComponent implements OnInit {

  @Input() public chartData:any[] | undefined ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
