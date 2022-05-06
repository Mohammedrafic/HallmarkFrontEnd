import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeWhile } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AssociateOrganizations, FeeSettings } from 'src/app/shared/models/associate-organizations.model';
import { FeeSettingsComponent } from './fee-settings/fee-settings.component';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { GetFeeSettingByOrganizationId, GetFeeSettingByOrganizationIdSucceeded } from 'src/app/agency/store/agency.actions';

@Component({
  selector: 'app-edit-associated-dialog',
  templateUrl: './edit-associated-dialog.component.html',
  styleUrls: ['./edit-associated-dialog.component.scss'],
})
export class EditAssociatedDialogComponent implements OnInit, OnDestroy {
  @Input() openEvent: Subject<AssociateOrganizations>;
  @Output() editEndEvent = new EventEmitter<never>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;

  public targetElement: HTMLElement = document.body;
  public editOrg: AssociateOrganizations;
  public width: string;
  public feeSettingsForm: FormGroup;
  public jobDistributionForm: FormGroup;

  private isAlive = true;

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.width = `${window.innerWidth / 2}px`;
    this.feeSettingsForm = FeeSettingsComponent.createFormGroup();
    this.onGetFeeSettingByOrganizationIdSucceeded();

    this.jobDistributionForm = new FormGroup({
      region: new FormControl(),
      orderType: new FormControl(),
      classification: new FormControl(),
      skillCategory: new FormControl(),
    })
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.sideDialog.hide();
  }

  public onCancel(): void {
    this.sideDialog.hide();
    this.editEndEvent.emit();
  }

  public onSave(): void {}

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((org) => {
      if (org) {
        this.editOrg = org;
        this.sideDialog.show();

        if (org.organizationId) {
          this.store.dispatch(new GetFeeSettingByOrganizationId(org.organizationId));
        }
      }
    });
  }

  private onGetFeeSettingByOrganizationIdSucceeded(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(GetFeeSettingByOrganizationIdSucceeded),
        takeWhile(() => this.isAlive)
      )
      .subscribe(
        ({
          payload: {
            baseFee,
            feeExceptions: { items },
          },
        }: GetFeeSettingByOrganizationIdSucceeded) => {
          const feeExceptions = items.forEach((fee) => {
            const control = FeeSettingsComponent.createFeeExceptionsForm();
            control.patchValue({ ...fee });
            return control;
          });
          this.feeSettingsForm.patchValue({ baseFee, feeExceptions });
        }
      );
  }
}
