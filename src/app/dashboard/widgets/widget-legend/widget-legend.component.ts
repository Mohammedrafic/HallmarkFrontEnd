import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { LegendPositionEnum } from '../../enums/legend-position.enum';
import { WidgetLegengDataModel } from '../../models/widget-legend-data.model';

@Component({
  selector: 'app-widget-legend',
  templateUrl: './widget-legend.component.html',
  styleUrls: ['./widget-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetLegendComponent {
  @Input() public legendData: WidgetLegengDataModel[];
  @Input() public showPercentRatio: boolean = false;
  @Input() public legendPosition: LegendPositionEnum = LegendPositionEnum.Bottom;
  @Input() public isPositionTrend: boolean=false;
  @Input() public description: string;
  @Input() public slideBar: any = false;
  @Input() public averageFlag: boolean =false;

  @Output() onClickLegend: EventEmitter<string> = new EventEmitter();
  @Output() changeCheckbox: EventEmitter<string> = new EventEmitter();

  private mousePosition = {
    x: 0,
    y: 0,
  }

  public trackByHandler(_: number, legendData: WidgetLegengDataModel): string {
    return legendData.label;
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public onClickLegendRow(event: MouseEvent,legend:string): void {
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      this.onClickLegend.emit(legend);
    }
  }

  public onChangeCheckbox(legend: string): void {
    this.changeCheckbox.emit(legend);
  }
}
