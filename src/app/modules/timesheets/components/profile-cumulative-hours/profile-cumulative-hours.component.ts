import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CheckBoxChangeEventArgs } from '@syncfusion/ej2-angular-grids';

import {
  ChartPointRenderEvent,
  DonutChartData,
  TimesheetStatisticsDetails
} from '../../interface';
import { profileDetailsHoursChartColorsMap, profileDetailsHoursChartSettings } from '../../constants';
import { HourOccupationType } from '../../enums';
import { CandidateBarChartHelper } from '../../helpers';

@Component({
  selector: 'app-profile-cumulative-hours',
  templateUrl: './profile-cumulative-hours.component.html',
  styleUrls: ['./profile-cumulative-hours.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCumulativeHoursComponent {
  private _statisticsData: TimesheetStatisticsDetails[] | null = null;

  public weekHoursChartData: DonutChartData<HourOccupationType>[] = [];
  public cumulativeHoursChartData: DonutChartData<HourOccupationType>[] = [];
  public totalWeekHours: number = 0;
  public totalCumulativeHours: number = 0;
  public legendItems: TimesheetStatisticsDetails[] = [];

  public readonly chartSettings = profileDetailsHoursChartSettings;
  public readonly chartColorsMap: Record<HourOccupationType, string> = profileDetailsHoursChartColorsMap;

  @Input()
  public set statisticsData(statistics: TimesheetStatisticsDetails[] | null) {
    this._statisticsData = statistics;

    // TODO: Remove after backend fixes
    const chartItems: TimesheetStatisticsDetails[] = Object.keys(HourOccupationType).map((occupationTypeName: string) => {
      const existing = (statistics || []).find((item: TimesheetStatisticsDetails) => item.billRateConfigName === occupationTypeName);

      return existing || getEmptyHoursOccupationData(occupationTypeName);
    }) || [];

    this.legendItems = chartItems;
    const reversedItems: TimesheetStatisticsDetails[] = chartItems.slice().reverse();

    this.weekHoursChartData = reversedItems.map(CandidateBarChartHelper.toWeekHoursChartData);
    this.cumulativeHoursChartData = reversedItems.map(CandidateBarChartHelper.toCumulativeHoursChartData);

    this.updateTotalHoursData();
  }

  public get statisticsData() {
    return this._statisticsData;
  }

  public trackByName(_: number, item: TimesheetStatisticsDetails): string {
    return item.billRateConfigName;
  }

  public onPointRender(event: ChartPointRenderEvent<HourOccupationType>): void {
    event.fill = profileDetailsHoursChartColorsMap[event.point.x];
  }

  public toggleChartCategoryVisibility({checked}: CheckBoxChangeEventArgs, legendItem: TimesheetStatisticsDetails): void {
    const index = this.legendItems.findIndex(
      (data: TimesheetStatisticsDetails) => data.billRateConfigName === legendItem.billRateConfigName
    );

    this.weekHoursChartData = this.weekHoursChartData.map(item => {
      item.y = item.x === legendItem.billRateConfigName ? checked ? this.legendItems[index].weekHours : 0 : item.y;
      return item;
    });

    this.cumulativeHoursChartData = this.cumulativeHoursChartData.map(item => {
      item.y = item.x === legendItem.billRateConfigName ? checked ? this.legendItems[index].cumulativeHours : 0 : item.y;
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

function getEmptyHoursOccupationData(name: string): TimesheetStatisticsDetails {
  return {
    billRateConfigName: name as HourOccupationType,
    cumulativeHours: 0,
    weekHours: 0,
    billRateConfigId: Math.random(),
  };
}
