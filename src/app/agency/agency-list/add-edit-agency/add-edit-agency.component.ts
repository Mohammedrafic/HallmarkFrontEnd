import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subscription, takeWhile } from 'rxjs';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';

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
import { GetAgencyById, GetAgencyByIdSucceeded, SaveAgency, SaveAgencySucceeded } from '../../store/agency.actions';
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
export class AddEditAgencyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') tab: TabComponent;

  public agencyForm: FormGroup;
  public title = 'Add';

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
  private fetchedAgency: Agency;

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService
  ) {
    this.store.dispatch(new SetHeaderState({ title: 'Agency List' }));
  }

  ngOnInit(): void {
    this.generateAgencyForm();
    this.onBillingPopulatedChange();

    this.actions$.pipe(ofActionSuccessful(SaveAgencySucceeded)).subscribe(() => {
      // this.uploadImages(this.currentBusinessUnitId); // TBD how to upload logo?
      this.store.dispatch(new ShowToast(MessageTypes.Success, AGENCY_SAVED_TEXT));
    });
    this.actions$.pipe(ofActionSuccessful(GetAgencyByIdSucceeded)).subscribe((agency: { payload: Agency }) => {
      this.fetchedAgency = agency.payload;
      this.patchAgencyFormValue(this.fetchedAgency);
    })

    if (this.route.snapshot.paramMap.get('id')) {
      this.title = 'Edit';
      this.store.dispatch(new GetAgencyById(parseInt(this.route.snapshot.paramMap.get('id') as string)));
    }
  }

  ngAfterViewInit(): void {
    this.tab.enableTab(1, false);

    this.isAgencyCreated$.pipe(takeWhile(() => this.isAlive)).subscribe((res) => {
      if (res) {
        this.tab.enableTab(1, true);
      } else {
        this.tab.enableTab(1, false);
      }
    });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public addContact(contactDetails?: AgencyContactDetails): void {
    this.contacts.push(ContactDetailsGroupComponent.createFormGroup(contactDetails));
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
      .subscribe(() => {});
  }

  public onBack(): void {
    if (this.agencyForm.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT)
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.navigateToAgencyList();
        });
    } else {
      this.navigateToAgencyList();
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

  private valueToAngency(agencyFormValue: AgencyFormValue): Agency {
    const id = this.fetchedAgency?.agencyDetails.id;
    const agencyContactDetails: AgencyContactDetails[] = [...agencyFormValue.agencyContactDetails];
    const agencyPaymentDetails: AgencyPaymentDetails[] = [...agencyFormValue.agencyPaymentDetails];

    agencyContactDetails.forEach(contact => contact.agencyId = id);
    agencyPaymentDetails.forEach(payment => payment.agencyId = id);

    return  {
      agencyDetails: {...agencyFormValue.agencyDetails, id},
      agencyBillingDetails: {
        ...agencyFormValue.agencyBillingDetails,
        sameAsAgency: agencyFormValue.isBillingPopulated,
        id
      },
      agencyContactDetails,
      agencyPaymentDetails,
      agencyId: id,
      parentBusinessUnitId: this.fetchedAgency?.parentBusinessUnitId
    };
  }

  private patchAgencyFormValue(agency: Agency) {
    this.agencyForm.get('parentBusinessUnitId')?.patchValue(agency.parentBusinessUnitId);
    this.agencyControl?.patchValue({
      name: agency.agencyDetails.name,
      externalId: agency.agencyDetails.externalId,
      taxId: agency.agencyDetails.taxId,
      addressLine1: agency.agencyDetails.addressLine1,
      addressLine2: agency.agencyDetails.addressLine2,
      country: agency.agencyDetails.country,
      state: agency.agencyDetails.state,
      city: agency.agencyDetails.city,
      zipCode: agency.agencyDetails.zipCode,
      phone1Ext: agency.agencyDetails.phone1Ext,
      phone2Ext: agency.agencyDetails.phone2Ext,
      fax: agency.agencyDetails.fax,
      status: agency.agencyDetails.status,
      website: agency.agencyDetails.website
    });
    this.billingControl?.patchValue({
      name: agency.agencyBillingDetails.name,
      address: agency.agencyBillingDetails.address,
      country: agency.agencyBillingDetails.country,
      state: agency.agencyBillingDetails.state,
      city: agency.agencyBillingDetails.city,
      zipCode: agency.agencyBillingDetails.zipCode,
      phone1: agency.agencyBillingDetails.phone1,
      phone2: agency.agencyBillingDetails.phone2,
      fax: agency.agencyBillingDetails.fax,
      ext: agency.agencyBillingDetails.ext
    });
    this.contacts.clear();
    agency.agencyContactDetails.forEach(contact => this.addContact(contact))
  }

  private navigateToAgencyList(): void {
    this.router.navigate(['/agency/agency-list']);
  }
}
