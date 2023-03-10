import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Directive, Inject, Injector, NgZone, ViewChild } from '@angular/core';

import { Actions, Store } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { GlobalWindow } from '@core/tokens';
import { CustomFormGroup } from '@core/interface';
import { ConfirmService } from '@shared/services/confirm.service';
import { FieldType } from '@core/enums';
import { AddDialogHelperService } from '@core/services';
import { TimesheetDateHelper } from './date.helper';
import { CommonDialogConformMessages } from './../interface/common.interface';


@Directive()
export class AddDialogHelper<T> extends TimesheetDateHelper {
  @ViewChild('sideAddDialog') protected sideAddDialog: DialogComponent;

  public form: CustomFormGroup<T> | null;

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
    protected injector: Injector,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
    private ngZone: NgZone,
  ) {
    super();
    this.targetElement = this.globalWindow.document.body as HTMLBodyElement;
    this.isAgency = this.route.snapshot.data['isAgencyArea'];
  }

  /**
   * TODO: rework with unique field.
   */
  public trackByIndex(index: number): number {
    return index;
  }

  public updateValidity(): void {
    this.form?.updateValueAndValidity();
  }

  public cancelChanges(): void {
    if (this.form?.touched) {

      /**
       * TODO: move this chain in AddDialogHelperService, leave only subscription.
       */
      this.confirmService.confirm(this.confirmMessages.confirmAddFormCancel, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Leave',
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
    this.form?.reset();
    this.sideAddDialog.hide();
  }
}
