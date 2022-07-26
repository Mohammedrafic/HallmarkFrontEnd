import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WidgetLegengDataModel } from '../../models/widget-legend-data.model';

@Component({
  selector: 'app-widget-legend',
  templateUrl: './widget-legend.component.html',
  styleUrls: ['./widget-legend.component.scss']
})
export class WidgetLegendComponent {
  @Input() legendData: WidgetLegengDataModel[];
  @Input() showPercentRatio: boolean = true;

  @Output() onClickLegend: EventEmitter<boolean> = new EventEmitter();
  @Output() changeCheckbox: EventEmitter<string> = new EventEmitter();

  private mousePosition = {
    x: 0,
    y: 0,
  };

  public trackByHandler(_: number, legendData: WidgetLegengDataModel): string {
    return legendData.label;
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public onClickLegendRow(event: MouseEvent): void {
    if (this.mousePosition.x === event.screenX && this.mousePosition.y === event.screenY) {
      this.onClickLegend.emit(true);
    }
  }

  public onChangeCheckbox(legend: string): void {
    this.changeCheckbox.emit(legend);
  }
}
