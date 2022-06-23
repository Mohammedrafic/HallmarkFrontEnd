import { ChangeDetectionStrategy, Component } from '@angular/core';
import { profileDetailsHoursChartColors, profileDetailsHoursChartColorsMap } from "../../constants/timesheets.constant";
import { HourOccupationType } from "../../enums/hour-occupation-type.enum";
import { profileDetailsHoursChartSettings } from "../../constants/profile-details-hours-chart-settings.constant";

interface ChartLegendData {
  name: HourOccupationType,
  value: number;
  value2: number;
  color: string;
}

interface DonutChartData {
  x: string;
  y: number;
}

type BarChartData = {[key: string]: number | string};

@Component({
  selector: 'app-profile-cumulative-hours',
  templateUrl: './profile-cumulative-hours.component.html',
  styleUrls: ['./profile-cumulative-hours.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCumulativeHoursComponent {
  public readonly chartSettings = profileDetailsHoursChartSettings;

  public readonly chartsLegendData: ChartLegendData[] = [
    {
      name: HourOccupationType.OnCall,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.OnCall],
      value: 32.47,
      value2: 32.47,
    },
    {
      name: HourOccupationType.Callback,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.Callback],
      value: 2.5,
      value2: 2.5,
    },
    {
      name: HourOccupationType.Regular,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.Regular],
      value: 36,
      value2: 36,
    },
    {
      name: HourOccupationType.Holiday,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.Holiday],
      value: 36,
      value2: 36,
    },
    {
      name: HourOccupationType.Charge,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.Charge],
      value: 0,
      value2: 0,
    },
    {
      name: HourOccupationType.Preceptor,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.Preceptor],
      value: 36,
      value2: 36,
    },
    {
      name: HourOccupationType.Orientation,
      color: profileDetailsHoursChartColorsMap[HourOccupationType.Orientation],
      value: 36,
      value2: 36,
    }
  ];

  public donutChartData: DonutChartData[] = [
    {x: 'OnCall', y: 32.47},
    {x: 'Callback', y: 2.5},
    {x: 'Regular', y: 36},
    {x: 'Holiday', y: 36},
    {x: 'Charge', y: 0},
    {x: 'Preceptor', y: 36},
    {x: 'Orientation', y: 36},
  ];

  public barChartData: BarChartData[] = [
    {
      x: '-',
      y0: 32.47,
      y1: 2.50,
      y2: 36,
      y3: 36,
      y4: 0,
      y5: 36,
      y6: 36,
    },
  ];

  public trackByName(_: number, item: ChartLegendData): string {
    return item.name;
  }

  public onPointRender(event: { point: { index: number }; fill: string; }): void {
    event.fill = profileDetailsHoursChartColors[event.point.index];
  }
}
