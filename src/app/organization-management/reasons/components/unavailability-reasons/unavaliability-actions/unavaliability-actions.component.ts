import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { UserPermissions } from '@core/enums';
import { UnavailabilityValue } from '@organization-management/reasons/interfaces';
import { UnavailabilityReasonsComponent } from '../unavailability-reasons.component';

@Component({
  selector: 'app-unavaliability-actions',
  templateUrl: './unavaliability-actions.component.html',
  styleUrls: ['./unavaliability-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavaliabilityActionsComponent implements ICellRendererAngularComp {
  canEdit = true;

  private componentParent: UnavailabilityReasonsComponent;

  private reasonData: UnavailabilityValue;

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  agInit(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.setData(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  editRecord(): void {
    this.componentParent.editReasonRecord(this.reasonData);
  }

  deleteRecord(): void {
    this.componentParent.onRemove(this.reasonData.id as number);
  }

  private setData(params: ICellRendererParams): void {
    this.reasonData = params.data;

    if (this.componentParent) {
      this.canEdit = this.componentParent.userPermission[UserPermissions.CanEditUnavailabilityReasons];
    }
    this.cd.markForCheck();
  }
}
