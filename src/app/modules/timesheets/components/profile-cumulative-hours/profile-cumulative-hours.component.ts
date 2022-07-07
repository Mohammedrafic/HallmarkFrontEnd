import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CheckBoxChangeEventArgs } from "@syncfusion/ej2-angular-grids";

import { CandidateHoursData, ChartPointRenderEvent, DonutChartData } from '../../interface';
import { profileDetailsHoursChartColorsMap, profileDetailsHoursChartSettings } from "../../constants";
import { HourOccupationType } from "../../enums";
import { CandidateBarChartHelper } from '../../helpers/candidate-bar-chart.helper';

@Component({
  selector: 'app-profile-cumulative-hours',
  templateUrl: './profile-cumulative-hours.component.html',
  styleUrls: ['./profile-cumulative-hours.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCumulativeHoursComponent {
  private _hoursData: CandidateHoursData[];

  public readonly chartSettings = profileDetailsHoursChartSettings;
  public readonly chartColorsMap: Record<HourOccupationType, string> = profileDetailsHoursChartColorsMap;

  public weekHoursChartData: DonutChartData<HourOccupationType>[] = [];
  public cumulativeHoursChartData: DonutChartData<HourOccupationType>[] = [];
  public totalWeekHours: number = 0;
  public totalCumulativeHours: number = 0;

  @Input()
  public set hoursData(value: CandidateHoursData[]) {
    this._hoursData = value;

    value = value.slice().reverse();
    this.weekHoursChartData = value.map(CandidateBarChartHelper.toWeekHoursChartData);
    this.cumulativeHoursChartData = value.map(CandidateBarChartHelper.toCumulativeHoursChartData);
    this.updateTotalHoursData();
  }

  public get hoursData() {
    return this._hoursData;
  }

  public trackByName(_: number, item: CandidateHoursData): string {
    return item.type;
  }

  public onPointRender(event: ChartPointRenderEvent<HourOccupationType>): void {
    event.fill = profileDetailsHoursChartColorsMap[event.point.x];
  }

  public toggleChartCategoryVisibility({checked}: CheckBoxChangeEventArgs, legendItem: CandidateHoursData): void {
    const index = this.hoursData.findIndex((data: CandidateHoursData) => data.type === legendItem.type);

    this.weekHoursChartData = this.weekHoursChartData.map(item => {
      item.y = item.x === legendItem.type ? checked ? this.hoursData[index].week : 0 : item.y;
      return item;
    });

    this.cumulativeHoursChartData = this.cumulativeHoursChartData.map(item => {
      item.y = item.x === legendItem.type ? checked ? this.hoursData[index].cumulative : 0 : item.y;
      return item;
    });

    this.updateTotalHoursData();
  }

  private updateTotalHoursData(): void {
    this.totalWeekHours = this.getTotalWeekHours();
    this.totalCumulativeHours = this.getTotalCumulativeHours();
  }

  private getTotalWeekHours(): number {
    return this.weekHoursChartData.reduce((acc, value) => acc + value.y, 0);
  }

  private getTotalCumulativeHours(): number {
    return this.cumulativeHoursChartData.reduce((acc, value) => acc + value.y, 0);
  }
}

