import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractPermission } from '@shared/helpers/permissions';
import { Store } from '@ngxs/store';

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
  params: any;
  label: string;

  agInit(params: any): void {
    this.params = params;
    this.label = this.params.label || null;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event: any, btnName?: string) {
    if (this.params.onClick instanceof Function) {
      const eventParams = {
        event: $event,
        rowData: this.params.node.data,
        btnName: btnName || null,
      };
      this.params.onClick(eventParams);
    }
  }
}
