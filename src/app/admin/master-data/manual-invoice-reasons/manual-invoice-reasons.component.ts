import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { delay, filter, Observable, takeWhile } from 'rxjs';

import { ManualInvoiceReasons } from '@admin/store/manual-invoice-reasons.actions';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_REJECTION_REASON, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, ONLY_LETTERS } from '@shared/constants';
import { ManualInvoiceReasonsState } from '@admin/store/manual-invoice-reasons.state';
import { ManualInvoiceReasonPage } from '@shared/models/manual-invoice-reasons.model';

import { ShowSideDialog } from '../../../store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { DoNotReturn } from '@admin/store/donotreturn.actions';
import { DonotReturnState } from '@admin/store/donotreturn.state';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { AbstractPermissionGrid } from '../../../shared/helpers/permissions';

@Component({
  selector: 'app-manual-invoice-reasons',
  templateUrl: './manual-invoice-reasons.component.html',
  styleUrls: ['./manual-invoice-reasons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualInvoiceReasonsComponent extends AbstractPermissionGrid implements OnInit {
  @Select(ManualInvoiceReasonsState.manualInvoiceReasons)
  public manualInvoiceReasons$: Observable<ManualInvoiceReasonPage>;

  @Select(UserState.lastSelectedOrganizationId)
  private lastSelectedOrganizationId$: Observable<number>;

  @Select(DonotReturnState.allOrganizations)
  allOrganizations$: Observable<UserAgencyOrganization>;

  public form: FormGroup;
  public title = '';

  private isEdit = false;
  private isAlive = true;
  businessUnitId:number=0;
  public canUpdateAgencyFeeApplicable: boolean = false;
  public agencyFeeApplicableSwitch?: boolean = true;

  constructor(
    private confirmService: ConfirmService,
    protected override store: Store,
    private actions$: Actions
  ) {
    super(store);
  }

  get reasonControl(): AbstractControl | null {
    return this.form.get('reason');
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.createForm();
    this.initGrid();
    this.subscribeOnSaveReasonError();
    this.subscribeOnUpdateReasonSuccess();
    this.subscribeOnSaveReasonSuccess();
    this.subscribeOnBusinessUnitChange();
  }

  private getOrganizationList(): void {
    this.store.dispatch(new DoNotReturn.GetAllOrganization());
  }

  private subscribeOnBusinessUnitChange(): void {
    this.lastSelectedOrganizationId$
    .pipe(takeWhile(() => this.isAlive))
    .subscribe((data) => {
      if(data != null && data != undefined){
        this.businessUnitId=data;
      }else{
        this.getOrganizationList();
        this.allOrganizations$.pipe(takeWhile(() => this.isAlive)).subscribe((data: any) => {
          if(data != null && data.length > 0){
            this.businessUnitId=data[0].id;
          }
         });
      }
    });
  }

  public addReason(): void {
    this.title = DialogMode.Add;
    this.isEdit = false;
    this.canUpdateAgencyFeeApplicable = !this.userPermission[this.userPermissions.CanUpdateAgencyFeeApplicable] ? true : false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEdit(data: { reason: string, id: number, agencyFeeApplicable: boolean }): void {
    this.isEdit = true;
    this.title = DialogMode.Edit;
    this.canUpdateAgencyFeeApplicable = !this.userPermission[this.userPermissions.CanUpdateAgencyFeeApplicable] ? true : false;
    this.form.patchValue({
      id: data.id,
      reason: data.reason,
      agencyFeeApplicable: !!data.agencyFeeApplicable,
      agencyFeeApplicableSwitch: data.agencyFeeApplicable === false ? false : true,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.store.dispatch(new ManualInvoiceReasons.Remove(id,this.businessUnitId));
        }
      });
  }

  public onRowsDropDownChanged(size: number): void {
    this.pageSize = size;
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.currentPage = 1;
    this.initGrid();
  }

  public onGoToClick(page: number): void {
    if (this.currentPage !== page) {
      this.currentPage = page;
      this.initGrid();
    }
  }

  public saveReason(): void {
    this.form.markAllAsTouched();
    if(this.form.invalid) {
      return;
    }

    if (!this.isEdit) {
      this.store.dispatch(new ManualInvoiceReasons.Save(
        { reason: this.form.value.reason, agencyFeeApplicable: this.form.value.agencyFeeApplicable }
      ));
    } else if(this.isEdit) {
      const payload = {
        id: this.form.value.id,
        reason: this.form.value.reason,
        agencyFeeApplicable: this.form.value.agencyFeeApplicable,
      };

      this.store.dispatch( new ManualInvoiceReasons.Update(payload));
    }
  }

  public closeDialog(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(CANCEL_REJECTION_REASON, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm: boolean) => !!confirm))
        .subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  private createForm(): void {
    this.form = new FormGroup({
      id: new FormControl(null),
      reason: new FormControl(
        '', [Validators.required, Validators.maxLength(100), Validators.minLength(3), Validators.pattern(ONLY_LETTERS)]
      ),
      agencyFeeApplicable: new FormControl(true),
    });
  }

  private subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(ManualInvoiceReasons.SaveError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.form.controls['reason'].setErrors({'incorrect': true}));
  }

  private subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(ManualInvoiceReasons.UpdateSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.initGrid());
  }

  private subscribeOnSaveReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(ManualInvoiceReasons.SaveSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.closeSideDialog());
  }

  private initGrid(): void {
    this.store.dispatch(new ManualInvoiceReasons.GetAll(this.currentPage, this.pageSize));
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(
      delay(500),
      takeWhile(() => this.isAlive)
    ).subscribe(() => {
      this.form.reset();
      this.form.controls['agencyFeeApplicable'].patchValue(true);
    });
  }
}
