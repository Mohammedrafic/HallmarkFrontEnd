import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { filter, Observable, Subject, takeUntil, takeWhile } from "rxjs";
import {
  GetOrderRequisitionByPage,
  RemoveOrderRequisition,
  SaveOrderRequisitionError,
  UpdateOrderRequisitionSuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage, RejectReasonwithSystem } from "@shared/models/reject-reason.model";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-order-requisition',
  templateUrl: './order-requisition.component.html',
  styleUrls: ['./order-requisition.component.scss'],
})
export class OrderRequisitionComponent extends ReasonsComponent implements OnInit, OnDestroy {
  @Select(RejectReasonState.orderRequisition)
  public reasons$: Observable<RejectReasonPage>;
  @Input() showSystem: boolean;
  @Input() system: string;
  public reqReason: RejectReasonwithSystem[] = [];
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private cd: ChangeDetectorRef,
    protected override readonly store: Store,
    protected override readonly actions$: Actions,
    protected override readonly confirmService: ConfirmService

  ) {
    super(store, actions$, confirmService);
  }

  private getReqReason() {
    this.reasons$.pipe(
      filter(x => x !== null && x !== undefined), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (this.system == "VMS")
          this.reqReason = data.items.filter((f) => f.includeInVMS == true)
        if (this.system == "IRP")
          this.reqReason = data.items.filter((f) => f.includeInIRP == true)
        if (this.system == "ALL")
          this.reqReason = data.items
        this.reqReason = [...this.reqReason];
        this.cd.detectChanges();
      });
  }

  ngOnChanges(): void {
    this.getReqReason();
  }


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
