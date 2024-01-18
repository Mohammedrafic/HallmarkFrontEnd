import { faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractPermission } from '@shared/helpers/permissions';
import { Store } from '@ngxs/store';
import { ButtonRenderedEvent } from '../../../models/button.model';
import { AlertChannel, AlertIdEnum } from '@admin/alerts/alerts.enum';

@Component({
  selector: 'app-button-renderer',
  templateUrl: './button-renderer.component.html',
  styleUrls: ['./button-renderer.component.scss'],
})
export class ButtonRendererComponent extends AbstractPermission implements ICellRendererAngularComp {
  public readonly agencyStatus = AgencyStatus;

  constructor(protected override store: Store) {
    super(store);
  }
  faEdit = faEdit as IconProp;
  faTrash = faTrash as IconProp;
  faView = faEye as IconProp;
  params: any;
  label: string;
  selectedType:number=0;
  alertEditDisable:boolean =false;

  agInit(params: any): void {
    this.params = params;
    this.label = this.params.label || null;
    this.selectedType = this.params.selectedType

    this.alertEditDisable = (this.params.alertChannel== AlertChannel.OnScreen || this.params.alertChannel==AlertChannel.SMS) && this.params.data.alertId == AlertIdEnum['Missing TimeSheets: Reorder Missing TimeSheets'];
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event: Event, btnName?: string): void {
    if (this.params.onClick instanceof Function) {
      const eventParams: ButtonRenderedEvent = {
        event: $event,
        rowData: this.params.node.data,
        btnName: btnName || null,
      };
      this.params.onClick(eventParams);
    }
  }
}
