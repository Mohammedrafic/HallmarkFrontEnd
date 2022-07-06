import { ChartPointRenderEvent } from './../../interface/candidate-chart.interface';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { profileDetailsHoursChartColorsMap } from "../../constants/timesheets.constant";
import { HourOccupationType } from "../../enums/hour-occupation-type.enum";
import { profileDetailsHoursChartSettings } from "../../constants/profile-details-hours-chart-settings.constant";
import { CheckBoxChangeEventArgs } from "@syncfusion/ej2-angular-grids";
import { mockedHoursChartData, ProfileHoursChartData } from "../../constants/mocked-hours-charts-data.constant";
import { DonutChartData } from '../../interface/candidate-chart.interface';

@Component({
  selector: 'app-profile-cumulative-hours',
  templateUrl: './profile-cumulative-hours.component.html',
  styleUrls: ['./profile-cumulative-hours.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCumulativeHoursComponent {
  private _hoursData: ProfileHoursChartData[];

  public readonly chartSettings = profileDetailsHoursChartSettings;
  public readonly chartColorsMap: Record<HourOccupationType, string> = profileDetailsHoursChartColorsMap;

  public weekHoursChartData: DonutChartData<HourOccupationType>[] = [];
  public cumulativeHoursChartData: DonutChartData<HourOccupationType>[] = [];
  public totalWeekHours: number = 0;
  public totalCumulativeHours: number = 0;

  @Input()
  public set hoursData(value: ProfileHoursChartData[]) {
    this._hoursData = value;

    value = value.slice().reverse();
    this.weekHoursChartData = value.map(toWeekHoursChartData);
    this.cumulativeHoursChartData = value.map(toCumulativeHoursChartData);
    this.updateTotalHoursData();
  }

  public get hoursData() {
    return this._hoursData;
  }

  constructor() {
    this.hoursData = mockedHoursChartData;
  }

  public trackByName(_: number, item: ProfileHoursChartData): string {
    return item.type;
  }

  public onPointRender(event: ChartPointRenderEvent<HourOccupationType>): void {
    event.fill = profileDetailsHoursChartColorsMap[event.point.x];
  }

  public toggleChartCategoryVisibility({checked}: CheckBoxChangeEventArgs, legendItem: ProfileHoursChartData): void {
    const index = this.hoursData.findIndex((data: ProfileHoursChartData) => data.type === legendItem.type);

    this.weekHoursChartData = this.weekHoursChartData.map(item => {
      item.y = item.x === legendItem.type ? checked ? this.hoursData[index].weekly : 0 : item.y;
      return item;
    });

    this.cumulativeHoursChartData = this.cumulativeHoursChartData.map(item => {
      item.y = item.x === legendItem.type ? checked ? this.hoursData[index].total : 0 : item.y;
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

function toWeekHoursChartData({type, weekly}: ProfileHoursChartData): DonutChartData<HourOccupationType> {
  return {
    x: type,
    y: weekly,
  };
}

function toCumulativeHoursChartData({type, total}: ProfileHoursChartData): DonutChartData<HourOccupationType> {
  return {
    x: type,
    y: total,
  };
}
