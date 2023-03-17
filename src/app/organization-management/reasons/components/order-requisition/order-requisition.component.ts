import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetOrderRequisitionByPage,
  RemoveOrderRequisition,
  SaveOrderRequisitionError,
  UpdateOrderRequisitionSuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Organization } from '@shared/models/organization.model';
import { SelectedSystems } from '@shared/components/credentials-list/constants';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';

@Component({
  selector: 'app-order-requisition',
  templateUrl: './order-requisition.component.html',
  styleUrls: ['./order-requisition.component.scss'],
})
export class OrderRequisitionComponent extends ReasonsComponent implements OnInit,OnDestroy {
  @Select(RejectReasonState.orderRequisition)
  public reasons$: Observable<RejectReasonPage>;
  
  @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;
  @Input() showSystem: boolean;

  protected componentDestroy: () => Observable<unknown>;
  public selectedSystem: SelectedSystemsFlag = SelectedSystems;

  protected getData(): void {
    this.store.dispatch(new GetOrderRequisitionByPage(this.currentPage, this.pageSize, this.orderBy, undefined, true));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveOrderRequisition(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveOrderRequisitionError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateOrderRequisitionSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.getData());
  }

}
