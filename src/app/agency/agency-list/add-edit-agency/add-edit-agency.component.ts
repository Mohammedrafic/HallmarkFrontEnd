import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { filter, Observable, Subscription, takeWhile } from 'rxjs';
import { CANCEL_COFIRM_TEXT, DELETE_RECORD_TEXT } from 'src/app/shared/constants/messages';

import { MessageTypes } from 'src/app/shared/enums/message-types';
import {
  Agency,
  AgencyBillingDetails,
  AgencyContactDetails,
  AgencyDetails,
  AgencyPaymentDetails,
} from 'src/app/shared/models/agency.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState, ShowToast } from 'src/app/store/app.actions';
import { SaveAgency, SaveAgencySucceeded } from '../../store/agency.actions';
import { AgencyState } from '../../store/agency.state';
import { BillingDetailsGroupComponent } from './billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './contact-details-group/contact-details-group.component';
import { GeneralInfoGroupComponent } from './general-info-group/general-info-group.component';

const AGENCY_SAVED_TEXT = 'Agency details saved successfully';

type AgencyFormValue = {
  parentBusinessUnitId: number;
  agencyDetails: AgencyDetails;
  isBillingPopulated: boolean;
  agencyBillingDetails: Omit<AgencyBillingDetails, 'sameAsAgency'>;
  agencyContactDetails: AgencyContactDetails[];
  agencyPaymentDetails: AgencyPaymentDetails[];
};
@Component({
  selector: 'app-add-edit-agency',
  templateUrl: './add-edit-agency.component.html',
  styleUrls: ['./add-edit-agency.component.scss'],
})
export class AddEditAgencyComponent implements OnInit, OnDestroy {
  public agencyForm: FormGroup;

  get contacts(): FormArray {
    return this.agencyForm.get('agencyContactDetails') as FormArray;
  }

  get agencyControl(): AbstractControl | null {
    return this.agencyForm.get('agencyDetails');
  }

  get billingControl(): AbstractControl | null {
    return this.agencyForm.get('agencyBillingDetails');
  }

  @Select(AgencyState.isAgencyCreated)
  public isAgencyCreated$: Observable<boolean>;

  private populatedSubscription: Subscription | undefined;
  private isAlive = true;
  private logoFile: Blob | null;

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService
  ) {
    this.store.dispatch(new SetHeaderState({ title: 'Agency' }));
  }

  ngOnInit(): void {
    this.generateAgencyForm();
    this.onBillingPopulatedChange();

    this.actions$.pipe(ofActionSuccessful(SaveAgencySucceeded)).subscribe(() => {
      // this.uploadImages(this.currentBusinessUnitId); // TBD how to upload logo?
      this.store.dispatch(new ShowToast(MessageTypes.Success, AGENCY_SAVED_TEXT));
    });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public addContact(): void {
    this.contacts.push(ContactDetailsGroupComponent.createFormGroup());
  }

  public deleteContact(index: number): void {
    this.contacts.removeAt(index);
  }

  public onSave(): void {
    this.agencyForm.markAllAsTouched();
    if (this.agencyForm.valid) {
      const agency = this.valueToAngency(this.agencyForm.getRawValue());
      this.store.dispatch(new SaveAgency(agency));
    }
  }

  public onClear(): void {
    this.agencyForm.reset();
  }

  public onDelete(): void {
    this.confirmService
        .confirm(DELETE_RECORD_TEXT)
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          
        });
  }

  public onBack(): void {
    if (this.agencyForm.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT)
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
    }
  }

  public setLogoFile(file: Blob | null) {
    this.logoFile = file;
    console.log(this.logoFile);
  }

  private onBillingPopulatedChange(): void {
    this.agencyForm
      .get('isBillingPopulated')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe((checked: boolean) => {
        if (checked) {
          this.populatedSubscription = this.agencyControl?.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
            this.populateBillingFromGeneral();
          });
          this.agencyControl?.updateValueAndValidity();
          this.billingControl?.disable();
        } else {
          this.populatedSubscription?.unsubscribe();
          this.billingControl?.enable();
        }
      });
  }

  private populateBillingFromGeneral(): void {
    const agency = this.agencyControl?.value;

    this.billingControl?.patchValue({
      name: agency.name,
      address: agency.addressLine1,
      country: agency.country,
      state: agency.state,
      city: agency.city,
      zipCode: agency.zipCode,
      phone1: agency.phone1Ext,
      phone2: agency.phone2Ext,
      fax: agency.fax,
      ext: '',
    });
  }

  private generateAgencyForm(): void {
    this.agencyForm = this.fb.group({
      parentBusinessUnitId: this.fb.control(0),
      agencyDetails: GeneralInfoGroupComponent.createFormGroup(),
      isBillingPopulated: false,
      agencyBillingDetails: BillingDetailsGroupComponent.createFormGroup(),
      agencyContactDetails: this.fb.array([ContactDetailsGroupComponent.createFormGroup()]),
      agencyPaymentDetails: this.fb.array([]),
    });
  }

  private valueToAngency({ isBillingPopulated, agencyBillingDetails, ...value }: AgencyFormValue): Agency {
    return {
      ...value,
      agencyBillingDetails: {
        ...agencyBillingDetails,
        sameAsAgency: isBillingPopulated,
      },
    };
  }
}
