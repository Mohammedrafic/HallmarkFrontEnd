import type { PanelModel } from '@syncfusion/ej2-angular-layouts';
import type { DashboardLayoutComponent } from '@syncfusion/ej2-angular-layouts';

import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

import { WidgetTypeEnum } from '../enums/widget-type.enum';
import type { WidgetsDataModel } from '../models/widgets-data.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';

@Component({
  selector: 'app-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardWidgetsComponent extends AbstractSFComponentDirective<DashboardLayoutComponent> {
  @Input() public isLoading: boolean;
  @Input() public panels: PanelModel[];
  @Input() public widgetsData: WidgetsDataModel | null;

  @Output() public dashboardCreatedEmitter: EventEmitter<void> = new EventEmitter();
  @Output() public dragStopEmitter: EventEmitter<void> = new EventEmitter();

  public readonly cellSpacing = [24, 24];
  public readonly columns = 12;
  public readonly widgetTypeEnum: typeof WidgetTypeEnum = WidgetTypeEnum;

  public trackByHandler(_: number, panel: PanelModel): string {
    return panel.id ?? '';
  }

  public dragStartHandler(): void {
    this.skipResizeObserverHandlerPredicate = true;
  }

  public dragStopHandler(): void {
    this.skipResizeObserverHandlerPredicate = false;
    this.dragStopEmitter.emit();
  }
}
