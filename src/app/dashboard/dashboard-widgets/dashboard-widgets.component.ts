import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

import type { DashboardLayoutComponent, PanelModel } from '@syncfusion/ej2-angular-layouts';

import { WidgetTypeEnum } from '../enums/widget-type.enum';
import type { WidgetsDataModel } from '../models/widgets-data.model';
import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';
import { TimeSelectionEnum } from '../enums/time-selection.enum';
import { WidgetDescriptionEnum } from '../enums/widget-description.enum';
import { UserState } from 'src/app/store/user.state';
import { Store } from '@ngxs/store';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

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
  @Input() public timeSelection: TimeSelectionEnum;
  @Input() public isDarkTheme: boolean;
  @Input() public description: string;
  @Input() public UserType:number;
  public isAgencyUser:boolean = false;
  
  @Output() public dashboardCreatedEmitter: EventEmitter<void> = new EventEmitter();
  @Output() public dragStopEmitter: EventEmitter<void> = new EventEmitter();

  public readonly cellSpacing = [24, 24];
  public readonly columns = 12;
  public readonly widgetTypeEnum: typeof WidgetTypeEnum = WidgetTypeEnum;
  public readonly widgetDescriptionEnum: typeof WidgetDescriptionEnum = WidgetDescriptionEnum;

  constructor(protected store: Store){
    super();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
      this.isAgencyUser = true;
    }
  }

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
