import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { filter, Observable, Subscription, takeWhile } from 'rxjs';

import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import { DELETE_RECORD_TEXT } from '@shared/constants/messages';
import {
  Agency,
  AgencyBillingDetails,
  AgencyConfig,
  AgencyContactDetails,
  AgencyDetails,
  AgencyRegionSkills,
} from 'src/app/shared/models/agency.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState } from 'src/app/store/app.actions';
import {
  GetAgencyById,
  GetAgencyByIdSucceeded,
  GetAgencyLogo,
  GetAgencyLogoSucceeded,
  GetAgencyRegionsSkills,
  GetBusinessUnitList,
  RemoveAgencyLogo,
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
import { ComponentCanDeactivate } from '@shared/guards/pending-changes.guard';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';
import { JobDistributionComponent } from '@agency/agency-list/add-edit-agency/job-distribution/job-distribution.component';
import { AgencyStatus } from '@shared/enums/status';
import { AbstractPermission } from '@shared/helpers/permissions';

type AgencyFormValue = {
  parentBusinessUnitId: number;
  agencyDetails: AgencyDetails;
  isBillingPopulated: boolean;
  agencyBillingDetails: Omit<AgencyBillingDetails, 'sameAsAgency'>;
  agencyContactDetails: AgencyContactDetails[];
  agencyPaymentDetails: PaymentDetails[] | ElectronicPaymentDetails[];
  agencyJobDistribution: AgencyRegionSkills;
};

@Component({
  selector: 'app-add-edit-agency',
  templateUrl: './add-edit-agency.component.html',
  styleUrls: ['./add-edit-agency.component.scss'],
})
export class AddEditAgencyComponent extends AbstractPermission implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild('stepper') tab: TabComponent;

  public agencyForm: FormGroup;
  public createUnderAvailable = false;
  public createUnderFields = OPRION_FIELDS;
  public title = 'Add';
  public readonly agencyStatus = AgencyStatus;
  public activeUser: User;
  public readonly businessUnitType = BusinessUnitType;
  public readonly agencyConfig: AgencyConfig = {
    isAgencyUser: false,
    isHallmarkUser: false,
    agencyIsMsp: false,
    isEditMode: false,
  }

  get contacts(): FormArray {
    return this.agencyForm.get('agencyContactDetails') as FormArray;
  }

  get agencyControl(): AbstractControl | null {
    return this.agencyForm.get('agencyDetails');
  }

  get paymentDetailsControl(): FormArray {
    return this.agencyForm.get('agencyPaymentDetails') as FormArray;
  }

  get billingControl(): AbstractControl | null {
    return this.agencyForm.get('agencyBillingDetails');
  }

  get distributionControl(): AbstractControl | null {
    return this.agencyForm.get('agencyJobDistribution');
  }

  get isSeccondStepActive(): boolean {
    return this.tab?.selectedItem === 1;
  }

  @Select(AgencyState.isAgencyCreated)
  public isAgencyCreated$: Observable<boolean>;

  @Select(AgencyState.businessUnits)
  businessUnits$: Observable<BusinessUnit[]>;

  @Select(UserState.user)
  public currentUser$: Observable<User>;

  public logo: Blob | null = null;

  private populatedSubscription: Subscription | undefined;
  private isAlive = true;
  private filesDetails: Blob[] = [];
  private agencyId: number | null = null;
  private isRemoveLogo: boolean = false;
  private fetchedAgency: Agency;

  constructor(
    protected override store: Store,
    private actions$: Actions,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService
  ) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Agency', iconName: 'briefcase' }));
    this.store.dispatch(new GetBusinessUnitList());
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.generateAgencyForm();
    this.checkAgencyUser();
    this.onBillingPopulatedChange();
    this.enableCreateUnderControl();
    this.getAgencyRegionsSkills();
    this.getActiveUser();

    this.actions$
      .pipe(
        takeWhile(() => this.isAlive),
        ofActionSuccessful(SaveAgencySucceeded)
      )
      .subscribe((agency: { payload: Agency }) => {
        this.agencyId = agency.payload.agencyDetails.id as number;
        this.uploadImages(this.agencyId);
        this.agencyForm.markAsPristine();
        if (
          this.activeUser.businessUnitType === BusinessUnitType.Hallmark
          || this.activeUser.businessUnitType === BusinessUnitType.MSP) {
          this.navigateToAgencyList();
        }
      });

    this.actions$
      .pipe(
        takeWhile(() => this.isAlive),
        ofActionSuccessful(GetAgencyByIdSucceeded)
      )
      .subscribe((agency: { payload: Agency }) => {
        this.agencyId = agency.payload.agencyDetails.id as number;
        this.fetchedAgency = agency.payload;
        this.agencyConfig.agencyIsMsp = !!agency.payload.isMsp;
        this.patchAgencyFormValue(this.fetchedAgency);
      });
  
    this.actions$
      .pipe(
        takeWhile(() => this.isAlive),
        ofActionSuccessful(GetAgencyLogoSucceeded)
      )
      .subscribe((logo: { payload: Blob }) => {
        this.logo = logo.payload;
      });

    if (this.route.snapshot.paramMap.get('id')) {
      this.agencyConfig.isEditMode = true;
      this.title = 'Edit';
      this.store.dispatch(new GetAgencyById(parseInt(this.route.snapshot.paramMap.get('id') as string)));
      this.store.dispatch(new GetAgencyLogo(parseInt(this.route.snapshot.paramMap.get('id') as string)));
    }
  }

  override ngOnDestroy(): void {
    this.isAlive = false;
    this.isRemoveLogo = false;
  }

  public enableCreateUnderControl(): void {
    const user = this.store.selectSnapshot(UserState.user) as User;
    const parentBusinessUnitIdControl = this.agencyForm.get('parentBusinessUnitId');
    parentBusinessUnitIdControl?.patchValue(user.businessUnitId);

    if (!DISABLED_BUSINESS_TYPES.includes(user?.businessUnitType)) {
      this.createUnderAvailable = true;
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
    const agencyFormValue = this.agencyForm.getRawValue();
    const status = agencyFormValue.agencyDetails.status;
    this.agencyForm.reset();
    this.agencyControl?.patchValue({ status });
  }

  public onDelete(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT)
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {});
  }

  public onBack(): void {
    this.navigateToAgencyList();
  }

  @HostListener('window:beforeunload')
  public canDeactivate(): Observable<boolean> | boolean {
    return !this.agencyForm.dirty;
  }

  public onImageSelect(event: Blob | null) {
    this.agencyForm.markAsDirty();
    if (event) {
      this.filesDetails = [event as Blob];
      this.isRemoveLogo = false;
    } else {
      this.filesDetails = [];
      this.isRemoveLogo = true;
    }
  }

  private uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadAgencyLogo(this.filesDetails[0] as Blob, businessUnitId));
    } else if (this.logo && this.isRemoveLogo) {
      this.store.dispatch(new RemoveAgencyLogo(businessUnitId));
    }
  }

  private onBillingPopulatedChange(): void {
    this.agencyForm
      .get('isBillingPopulated')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe((checked: boolean) => {
        if (checked) {
          this.populatedSubscription = this.agencyControl?.valueChanges
            .pipe(takeWhile(() => this.isAlive))
            .subscribe(() => {
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
      parentBusinessUnitId: this.fb.control(null, [Validators.required]),
      agencyDetails: GeneralInfoGroupComponent.createFormGroup(),
      isBillingPopulated: false,
      agencyBillingDetails: BillingDetailsGroupComponent.createFormGroup(),
      agencyContactDetails: this.fb.array([ContactDetailsGroupComponent.createFormGroup()]),
      agencyPaymentDetails: this.fb.array([]),
      agencyJobDistribution: JobDistributionComponent.createFormGroup(),
    });
  }

  private valueToAngency(agencyFormValue: AgencyFormValue): Agency {
    const id = this.fetchedAgency?.agencyDetails.id;
    const agencyContactDetails: AgencyContactDetails[] = [...agencyFormValue.agencyContactDetails];
    const agencyPaymentDetails: PaymentDetails[] | ElectronicPaymentDetails[] = [
      ...agencyFormValue.agencyPaymentDetails,
    ];

    agencyContactDetails.forEach((contact) => (contact.agencyId = id));
    agencyPaymentDetails.forEach((payment) => (payment.agencyId = id));

    return {
      isMsp: this.agencyConfig.agencyIsMsp,
      agencyDetails: { ...agencyFormValue.agencyDetails, id },
      agencyBillingDetails: {
        ...agencyFormValue.agencyBillingDetails,
        sameAsAgency: agencyFormValue.isBillingPopulated,
        id,
      },
      agencyJobDistribution: { ...agencyFormValue.agencyJobDistribution },
      agencyContactDetails,
      agencyPaymentDetails,
      agencyId: id,
      parentBusinessUnitId: agencyFormValue.parentBusinessUnitId,
    };
  }

  private patchAgencyFormValue({
    agencyDetails,
    agencyBillingDetails,
    agencyContactDetails,
    agencyPaymentDetails,
    agencyJobDistribution,
    createUnder,
  }: Agency) {
    const paymentDetailsForms = this.createPaymentDetails(agencyPaymentDetails);

    this.agencyForm.get('parentBusinessUnitId')?.patchValue(createUnder?.parentUnitId || 0);
    this.agencyForm.get('isBillingPopulated')?.patchValue(agencyBillingDetails.sameAsAgency);
    this.distributionControl?.patchValue({ ...agencyJobDistribution });
    this.agencyControl?.patchValue({ ...agencyDetails });
    this.billingControl?.patchValue({ ...agencyBillingDetails });
    paymentDetailsForms.forEach((form: FormGroup) => this.paymentDetailsControl?.push(form));
    this.contacts.clear();
    agencyContactDetails.forEach((contact) => this.addContact(contact));
  }

  private navigateToAgencyList(): void {
    this.router.navigate(['/agency/agency-list']);
  }

  private checkAgencyUser(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.agencyConfig.isAgencyUser = user?.businessUnitType === BusinessUnitType.Agency;
    this.agencyConfig.isHallmarkUser = user?.businessUnitType === BusinessUnitType.Hallmark;
  }

  private createPaymentDetails(paymentDetails: PaymentDetails[] | ElectronicPaymentDetails[]): FormGroup[] {
    return paymentDetails.map((paymentDetail: any) => {
      let controls = {};
      for (let key in paymentDetail) {
        controls = {
          ...controls,
          [key]: new FormControl(paymentDetail[key]),
        };
      }

      return new FormGroup(controls);
    });
  }

  private getActiveUser(): void {
    this.currentUser$.pipe(takeWhile(() => this.isAlive)).subscribe((user: User) => (this.activeUser = user));
  }

  private getAgencyRegionsSkills(): void {
    this.store.dispatch(new GetAgencyRegionsSkills());
  }

  public onMspCheckboxChecked(event: boolean): void {
    this.agencyConfig.agencyIsMsp = event;
    const parentBusinessUnitControl = this.agencyForm.get('parentBusinessUnitId');
    if(this.agencyConfig.agencyIsMsp) {
      parentBusinessUnitControl?.setValue(0);
      parentBusinessUnitControl?.disable();
    } else {
      parentBusinessUnitControl?.reset();
      parentBusinessUnitControl?.enable();
    }
  }
}
