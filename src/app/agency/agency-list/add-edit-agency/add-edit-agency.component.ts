import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subscription, takeWhile } from 'rxjs';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import {DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT} from '@shared/constants/messages';
import {
  Agency,
  AgencyBillingDetails,
  AgencyContactDetails,
  AgencyDetails,
  AgencyPaymentDetails,
} from 'src/app/shared/models/agency.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState } from 'src/app/store/app.actions';
import {
  GetAgencyById,
  GetAgencyByIdSucceeded,
  GetAgencyLogo,
  GetAgencyLogoSucceeded,
  GetBusinessUnitList,
  SaveAgency,
  SaveAgencySucceeded,
  UploadAgencyLogo,
} from '../../store/agency.actions';
import { AgencyState } from '../../store/agency.state';
import { BillingDetailsGroupComponent } from './billing-details-group/billing-details-group.component';
import { ContactDetailsGroupComponent } from './contact-details-group/contact-details-group.component';
import { GeneralInfoGroupComponent } from './general-info-group/general-info-group.component';
import { DISABLED_BUSINESS_TYPES, OPRION_FIELDS } from './add-edit-agency.constants';
import { UserState } from 'src/app/store/user.state';
import { User } from '@shared/models/user.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { BusinessUnit } from '@shared/models/business-unit.model';

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
  @ViewChild('stepper') tab: TabComponent;

  public agencyForm: FormGroup;
  public createUnderAvailable = false;
  public createUnderFields = OPRION_FIELDS;
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

  get isSeccondStepActive(): boolean {
    return this.tab?.selectedItem === 1;
  }

  get isSaveDisabled(): boolean {
    return !this.agencyForm.dirty;
  }

  @Select(AgencyState.isAgencyCreated)
  public isAgencyCreated$: Observable<boolean>;

  @Select(AgencyState.businessUnits)
  businessUnits$: Observable<BusinessUnit[]>;

  public logo: Blob | null = null;

  private populatedSubscription: Subscription | undefined;
  private isAlive = true;
  private filesDetails: Blob[] = [];
  private fetchedAgency: Agency;
  private agencyId: number | null = null;

  constructor(
    private store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService
  ) {
    this.store.dispatch(new SetHeaderState({ title: 'Agency', iconName: 'clock' }));
    this.store.dispatch(new GetBusinessUnitList());
  }

  ngOnInit(): void {
    this.generateAgencyForm();
    this.onBillingPopulatedChange();
    this.enableCreateUnderControl();

    this.actions$.pipe(ofActionSuccessful(SaveAgencySucceeded)).subscribe((agency: { payload: Agency }) => {
      this.agencyId = agency.payload.agencyDetails.id as number;
      this.uploadImages(this.agencyId);
      this.agencyForm.markAsPristine();
    });
    this.actions$.pipe(ofActionSuccessful(GetAgencyByIdSucceeded)).subscribe((agency: { payload: Agency }) => {
      this.agencyId = agency.payload.agencyDetails.id as number;
      this.fetchedAgency = agency.payload;
      this.patchAgencyFormValue(this.fetchedAgency);
    });
    this.actions$.pipe(ofActionSuccessful(GetAgencyLogoSucceeded)).subscribe((logo: { payload: Blob }) => {
      this.logo = logo.payload;
    });

    if (this.route.snapshot.paramMap.get('id')) {
      this.title = 'Edit';
      this.store.dispatch(new GetAgencyById(parseInt(this.route.snapshot.paramMap.get('id') as string)));
      this.store.dispatch(new GetAgencyLogo(parseInt(this.route.snapshot.paramMap.get('id') as string)));
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public enableCreateUnderControl(): void {
    const user = this.store.selectSnapshot(UserState.user) as User;
    if (!DISABLED_BUSINESS_TYPES.includes(user?.businessUnitType)) {
      this.createUnderAvailable = true;
      if (user.businessUnitType === BusinessUnitType.MSP) {
        const parentBusinessUnitIdControl = this.agencyForm.get('parentBusinessUnitId');
        parentBusinessUnitIdControl?.patchValue(BusinessUnitType.MSP);
        parentBusinessUnitIdControl?.disable();
      }
    }
  }

  public onStepperCreated(): void {
    this.tab.enableTab(1, false);
    this.isAgencyCreated$.pipe(takeWhile(() => this.isAlive)).subscribe((res) => {
      if (res) {
        this.tab.enableTab(1, true);
      } else {
        this.tab.enableTab(1, false);
      }
    });
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
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.navigateToAgencyList();
        });
    } else {
      this.navigateToAgencyList();
    }
  }

  public onImageSelect(event: Blob | null) {
    if (event) {
      this.filesDetails = [event as Blob];
    } else {
      this.filesDetails = [];
    }
  }

  private uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadAgencyLogo(this.filesDetails[0] as Blob, businessUnitId));
    }
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
      parentBusinessUnitId: this.fb.control(null),
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

    agencyContactDetails.forEach((contact) => (contact.agencyId = id));
    agencyPaymentDetails.forEach((payment) => (payment.agencyId = id));

    return {
      agencyDetails: { ...agencyFormValue.agencyDetails, id },
      agencyBillingDetails: {
        ...agencyFormValue.agencyBillingDetails,
        sameAsAgency: agencyFormValue.isBillingPopulated,
        id,
      },
      agencyContactDetails,
      agencyPaymentDetails,
      agencyId: id,
      parentBusinessUnitId: agencyFormValue.parentBusinessUnitId,
    };
  }

  private patchAgencyFormValue({ agencyDetails, agencyBillingDetails, agencyContactDetails, createUnder }: Agency) {
    this.agencyForm.get('parentBusinessUnitId')?.patchValue(createUnder?.parentUnitId);
    this.agencyForm.get('isBillingPopulated')?.patchValue(agencyBillingDetails.sameAsAgency);
    this.agencyControl?.patchValue({ ...agencyDetails });
    this.billingControl?.patchValue({ ...agencyBillingDetails });
    this.contacts.clear();
    agencyContactDetails.forEach((contact) => this.addContact(contact));
  }

  private navigateToAgencyList(): void {
    this.router.navigate(['/agency/agency-list']);
  }
}
