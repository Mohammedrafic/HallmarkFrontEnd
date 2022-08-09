import { ActivatedRoute } from '@angular/router';

import { CommonDialogConformMessages } from './../interface/common.interface';
import { CustomFormGroup } from '@core/interface';
import { ChangeDetectorRef, Directive, Inject, ViewChild } from '@angular/core';
import { ConfirmService } from '@shared/services/confirm.service';
import { Actions, Store } from '@ngxs/store';

import { GlobalWindow } from '@core/tokens';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { filter, takeUntil } from 'rxjs';
import { FieldType } from '@core/enums';
import { AddDialogHelperService } from '@core/services';
import { TimesheetDateHelper } from './date.helper';

@Directive()
export class AddDialogHelper<T> extends TimesheetDateHelper {
  @ViewChild('sideAddDialog') protected sideAddDialog: DialogComponent;

  public form: CustomFormGroup<T>;

  public targetElement: HTMLBodyElement;

  public readonly dropDownFieldsConfig = {
    text: 'text',
    value: 'value',
  };

  protected isAgency: boolean;

  protected confirmMessages: CommonDialogConformMessages;

  public readonly FieldTypes = FieldType;

  constructor(
    protected confirmService: ConfirmService,
    protected store: Store,
    protected addService: AddDialogHelperService,
    protected actions$: Actions,
    protected cd: ChangeDetectorRef,
    protected route: ActivatedRoute,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public updateValidity(): void {
    this.form.updateValueAndValidity();
  }

  public cancelChanges(): void {
    if (this.form.touched) {
      this.confirmService.confirm(this.confirmMessages.confirmAddFormCancel, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((value) => value),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.closeDialog();
      });
    } else {
      this.closeDialog();
    }
  }

  protected closeDialog(): void {
    this.form.reset();
    this.sideAddDialog.hide();
  }
}
