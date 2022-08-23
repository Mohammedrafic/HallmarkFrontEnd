import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChangeEventArgs, FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';

import { OrderType } from '@shared/enums/order-type';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Organisation, Region, Location, Department } from '@shared/models/visibility-settings.model';
import { currencyValidator } from '@shared/validators/currency.validator';
import { integerValidator } from '@shared/validators/integer.validator';
import { AllOrganizationsSkill } from 'src/app/dashboard/models/all-organization-skill.model';
import { Duration } from '@shared/enums/durations';
import { combineLatest, debounceTime, filter, Observable, of, Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { BillRate } from '@shared/models';
import { JobDistribution } from '@shared/enums/job-distibution';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { Select, Store } from '@ngxs/store';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { GetAssociateAgencies } from '@client/store/order-managment-content.actions';
import { MasterShiftName } from '@shared/enums/master-shifts-id.enum';
import { ReasonForRequisitionList } from '@shared/models/reason-for-requisition-list';
import PriceUtils from '@shared/utils/price.utils';
import { ORDER_CONTACT_DETAIL_TITLES } from '@shared/constants';

@Component({
  selector: 'app-quick-order-form',
  templateUrl: './quick-order-form.component.html',
  styleUrls: ['./quick-order-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickOrderFormComponent extends DestroyableDirective implements OnInit {
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public skills: AllOrganizationsSkill[];
  @Input() public organizationStructure: OrganizationStructure;
  @Input() public openEvent: Subject<boolean>;

  @ViewChild('multiselect') public readonly multiselect: MultiSelectComponent;

  public organizationForm: FormGroup;
  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public orderStatus = 'Open';
  public isPermPlacementOrder = false;
  public priceUtils = PriceUtils;
  public isEditContactTitle = false;

  public readonly orderTypes = [
    { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
    { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
    { id: OrderType.PermPlacement, name: 'Perm. Placement' },
    { id: OrderType.Traveler, name: 'Traveler' },
  ];

  public readonly organizationTypeFields: FieldSettingsModel = { text: 'name', value: 'organizationId' };

  public readonly orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public readonly regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isRegionsDropDownEnabled = false;
  public regionDataSource: Region[] | OrganizationRegion[] = [];

  public readonly locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isLocationsDropDownEnabled = false;
  public locationDataSource: Location[] = [];

  public readonly departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isDepartmentsDropDownEnabled = false;
  public departmentDataSource: Department[] = [];

  public skillDataSource: AllOrganizationsSkill[] = [];
  public readonly skillFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };

  public readonly durations = [
    { id: Duration.TwelveWeeks, name: '12 Weeks' },
    { id: Duration.ThirteenWeeks, name: '13 Weeks' },
    { id: Duration.TwentySixWeeks, name: '26 Weeks' },
    { id: Duration.Month, name: 'Month' },
    { id: Duration.Year, name: 'Year' },
    { id: Duration.NinetyDays, name: '90 Days' },
    { id: Duration.Other, name: 'Other' },
  ];
  public readonly durationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public today = new Date();

  public isJobEndDateControlEnabled = false;
  public isContactToPermOrder = false;
  public isTravelerOrder = false;
  public isOpenPerDiem = false;
  public isReOrder = false

  public readonly jobDistributions = [
    { id: JobDistribution.All, name: 'All' },
    { id: JobDistribution.Internal, name: 'Internal' },
    { id: JobDistribution.ExternalTier1, name: 'External Tier 1' },
    { id: JobDistribution.ExternalTier2, name: 'External Tier 2' },
    { id: JobDistribution.ExternalTier3, name: 'External Tier 3' },
    { id: JobDistribution.Selected, name: 'Selected' },
  ];
  public readonly jobDistributionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public agencyControlEnabled = false;

  @Select(OrderManagementContentState.associateAgencies)
  associateAgencies$: Observable<AssociateAgency[]>;
  associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };

  public readonly masterShiftNames = [
    { id: MasterShiftName.Day, name: 'Day' },
    { id: MasterShiftName.Evening, name: 'Evening' },
    { id: MasterShiftName.Night, name: 'Night' },
    { id: MasterShiftName.Rotating, name: 'Rotating' },
  ];

  public readonly masterShiftFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public readonly reasonsForRequisition = ReasonForRequisitionList;
  public readonly reasonForRequisitionFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public readonly contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;

  get organizationControl() {
    return this.organizationForm.get('organization') as AbstractControl;
  }

  get orderTypeControl() {
    return this.orderTypeForm.get('orderType') as AbstractControl;
  }

  get jobStartDateControl() {
    return this.generalInformationForm.get('jobStartDate') as AbstractControl;
  }

  get jobEndDateControl() {
    return this.generalInformationForm.get('jobEndDate') as AbstractControl;
  }

  get durationControl() {
    return this.generalInformationForm.get('duration') as AbstractControl;
  }

  get departmentControl() {
    return this.generalInformationForm.get('departmentId') as AbstractControl;
  }

  get skillControl() {
    return this.generalInformationForm.get('skillId') as AbstractControl;
  }

  get openPosition() {
    return this.generalInformationForm.get('openPositions') as AbstractControl;
  }

  get jobDistributionControl() {
    return this.jobDistributionDescriptionForm.get('jobDistribution') as AbstractControl;
  }

  get jobDistributionsControl() {
    return this.jobDistributionDescriptionForm.get('jobDistributions') as AbstractControl;
  }

  get agencyControl() {
    return this.jobDistributionDescriptionForm.get('agency') as AbstractControl;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly store: Store,
    private readonly orderManagementService: OrderManagementContentService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initOrganizationForm();
    this.initOrderTypeForm();
    this.initGeneralInformationForm();
    this.initJobDistributionDescriptionForm();
    this.handleDurationControlValueChanges();
    this.handleJobStartDateValueChanges();
    this.handleOrderTypeControlValueChanges();
    this.handleJobDistributionValueChanges();
    this.orderTypeDeparmnetSkillListener();
    this.populateNewOrderForm();
    this.populateJobjobDistributionForm();
    this.refreshMultiSelectAfterOpenDialog();
    this.initContactDetailsForm();

    if(!this.userIsAdmin) {
      this.store.dispatch(new GetAssociateAgencies());
    }

    this.associateAgencies$.subscribe((data) => {
      console.error(data);
    })
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['skills'] && this.handleAllOrganizationSkills();
    changes['organizationStructure'] && this.handleOrganizationUserDataStructure();
  }

  private initOrganizationForm(): void {
    this.organizationForm = this.fb.group({
      organization: [null, Validators.required],
    });
  }
  private initOrderTypeForm(): void {
    this.orderTypeForm = this.fb.group({
      orderType: [null, Validators.required],
    });
  }

  private initGeneralInformationForm(): void {
    this.generalInformationForm = this.fb.group({
      title: [null, [Validators.required, Validators.maxLength(50)]],
      regionId: [null, Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      skillId: [null, Validators.required],
      hourlyRate: [null, [Validators.required, Validators.maxLength(10), currencyValidator(1)]],
      openPositions: [null, [Validators.required, Validators.maxLength(10), integerValidator(1)]],
      duration: [null, Validators.required],
      jobStartDate: [null, Validators.required],
      jobEndDate: [null, Validators.required],
      shift: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
      orderPlacementFee: [null, Validators.required],
      annualSalaryRangeFrom: [null, Validators.required],
      annualSalaryRangeTo: [null, Validators.required],
    });
  }

  private initJobDistributionDescriptionForm(): void {
    this.jobDistributionDescriptionForm = this.fb.group({
      jobDistribution: [[], Validators.required],
      agency: [null],
      jobDistributions: [[]],
      jobDescription: ['', Validators.maxLength(500)],
      reasonForRequisition: [null, Validators.required],
    });
  }

  private initContactDetailsForm(): void {
    this.contactDetailsForm = this.fb.group({
      title: [[], Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.required, Validators.email]
    })
  }

  public onOrganizationDropDownSelected(event: ChangeEventArgs): void {
    const selectedOrganization = event.itemData as Organisation;
    this.regionDataSource = selectedOrganization.regions;
    this.isRegionsDropDownEnabled = true;
    this.handleAllOrganizationSkills(selectedOrganization.organizationId);
    this.store.dispatch(new GetAssociateAgencies(selectedOrganization.organizationId));
  }

  public onRegionDropDownSelected(event: ChangeEventArgs): void {
    const selectedRegion = event.itemData as Region;
    this.locationDataSource = selectedRegion.locations;
    this.isLocationsDropDownEnabled = true;
  }

  public onLocationDropDownSelected(event: ChangeEventArgs): void {
    const selectedLocation = event.itemData as Location;
    this.departmentDataSource = selectedLocation.departments;
    this.isDepartmentsDropDownEnabled = true;
  }

  private handleAllOrganizationSkills(organizationId?: number): void {
    this.skillDataSource = this.userIsAdmin
      ? this.skills.filter((skill) =>
          organizationId ? !skill.businessUnitId || skill.businessUnitId === organizationId : !skill.businessUnitId
        )
      : this.skills;
  }

  private handleOrganizationUserDataStructure(): void {
    if (!this.userIsAdmin && this.organizationStructure) {
      this.regionDataSource = this.organizationStructure.regions;
      this.isRegionsDropDownEnabled = true;
    }
  }

  private handleDurationControlValueChanges(): void {
    this.durationControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((duration: Duration) => {
      this.cdr.markForCheck();
      this.isJobEndDateControlEnabled = duration === Duration.Other;

      const jobStartDate = this.getNextSundayAfterThreeWeeks();
      if (!(jobStartDate instanceof Date)) {
        return;
      }
      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });
  }

  private getNextSundayAfterThreeWeeks(): Date {
    const weekDays = 7;
    const numWeeks = 3;
    const today = new Date();
    today.setDate(today.getDate() + numWeeks * weekDays);
    today.setDate(today.getDate() + ((weekDays - today.getDay()) % weekDays));
    return today;
  }

  private handleJobStartDateValueChanges(): void {
    this.jobStartDateControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((jobStartDate: Date | null) => {
      const duration = this.durationControl.value;
      if (
        isNaN(parseInt(duration)) ||
        !(jobStartDate instanceof Date) ||
        this.orderTypeControl.value === OrderType.PermPlacement
      ) {
        return;
      }
      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    /** Clone Date object to avoid modifying */
    const jobStartDateValue = new Date(jobStartDate.getTime());

    switch (duration) {
      case Duration.TwelveWeeks:
        this.jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 12 * 7)));
        break;

      case Duration.ThirteenWeeks:
        this.jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 13 * 7)));
        break;

      case Duration.TwentySixWeeks:
        this.jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 26 * 7)));
        break;

      case Duration.Month:
        this.jobEndDateControl.patchValue(new Date(jobStartDateValue.setMonth(jobStartDateValue.getMonth() + 1)));
        break;

      case Duration.Year:
        this.jobEndDateControl.patchValue(new Date(jobStartDateValue.setFullYear(jobStartDateValue.getFullYear() + 1)));
        break;

      case Duration.NinetyDays:
        this.jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 90)));
        break;
    }
  }

  private handleOrderTypeControlValueChanges(): void {
    this.orderTypeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.cdr.markForCheck();
      this.isContactToPermOrder = value === OrderType.ContractToPerm;
      this.isTravelerOrder = value === OrderType.Traveler;
      this.isPermPlacementOrder = value === OrderType.PermPlacement;
      this.isOpenPerDiem = value === OrderType.OpenPerDiem;
      this.isReOrder = value === OrderType.ReOrder;
    });
  }

  private orderTypeDeparmnetSkillListener(): void {
    combineLatest([
      this.orderTypeControl.valueChanges,
      this.departmentControl.valueChanges,
      this.skillControl.valueChanges,
      this.userIsAdmin ? this.organizationControl.valueChanges : of(null),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([orderType, departmentId, skillId, organizationId]) => {
        if (isNaN(parseInt(orderType)) || !departmentId || !skillId) {
          return;
        }

        this.populateHourlyRateField(orderType, departmentId, skillId, organizationId);
        // this.store.dispatch(new SetPredefinedBillRatesData(orderType, departmentId, skillId));
      });
  }

  private populateHourlyRateField(orderType: OrderType, departmentId: number, skillId: number, organizationId?: number): void {
    if (this.isTravelerOrder || this.isContactToPermOrder) {
      this.orderManagementService
        .getRegularLocalBillRate(orderType, departmentId, skillId, organizationId)
        .pipe(
          takeUntil(this.destroy$),
          filter((billRate) => !!billRate.length)
        )
        .subscribe((billRates: BillRate[]) =>
          this.generalInformationForm.controls['hourlyRate'].patchValue(billRates[0].rateHour)
        );
    }
  }

  private populateContactDetailsForm(name: string, email: string, mobilePhone: string): void {
    // const contactDetailsFormArray = this.contactDetailsForm.controls['contactDetails'] as FormArray;
    // const firstContactDetailsControl = contactDetailsFormArray.at(0) as FormGroup;
    // firstContactDetailsControl.controls['name'].patchValue(name);
    // firstContactDetailsControl.controls['email'].patchValue(email);
    // firstContactDetailsControl.controls['mobilePhone'].patchValue(mobilePhone);
  }

  private populateNewOrderForm(): void {
    this.orderTypeControl.patchValue(OrderType.Traveler);
    this.openPosition.patchValue(1);
    this.durationControl.patchValue(Duration.ThirteenWeeks);
    const nextSundayAfterThreeWeeks: Date = this.getNextSundayAfterThreeWeeks();
    if (nextSundayAfterThreeWeeks instanceof Date) {
      this.jobStartDateControl.patchValue(nextSundayAfterThreeWeeks);
    }

    // this.contactDetails$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((contactDetails) => {
    // const { facilityContact, facilityPhoneNo, facilityEmail } = contactDetails;
    // this.populateContactDetailsForm(facilityContact, facilityEmail, facilityPhoneNo);
    // });
  }
  private populateJobjobDistributionForm(): void {
    this.jobDistributionControl.patchValue([
      JobDistribution.All
    ]);
  }

  private refreshMultiSelectAfterOpenDialog(): void {
    this.openEvent.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe((isOpen) => {
      if(isOpen) {
        this.multiselect.refresh();
      }
    })
  }

  private handleJobDistributionValueChanges(): void {
    this.jobDistributionControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((jobDistributionIds: JobDistribution[]) => {
        if (jobDistributionIds.includes(JobDistribution.All)) {
          jobDistributionIds = [
            JobDistribution.All,
            JobDistribution.Internal,
            JobDistribution.ExternalTier1,
            JobDistribution.ExternalTier2,
            JobDistribution.ExternalTier3,
          ];

          this.jobDistributionControl.patchValue(jobDistributionIds, { emitEvent: false });
        }

        this.agencyControlEnabled = jobDistributionIds.includes(JobDistribution.Selected);
        const selectedJobDistributions: JobDistributionModel[] = [];
        if (this.agencyControlEnabled) {
          this.agencyControl.addValidators(Validators.required);
          const agencyIds = this.agencyControl.value;
          if (agencyIds) {
            agencyIds.forEach((agencyId: number) => {
              selectedJobDistributions.push({
                id: 0,
                orderId: 0,
                jobDistributionOption: JobDistribution.Selected,
                agencyId,
              });
            });
          }
        } else {
          this.agencyControl.removeValidators(Validators.required);
          this.agencyControl.reset();
        }
        this.agencyControl.updateValueAndValidity();
        let jobDistributions: JobDistributionModel[] = jobDistributionIds
          .filter((jobDistributionId) => jobDistributionId !== JobDistribution.Selected)
          .map((jobDistributionId) => {
            return {
              id: 0,
              orderId: 0,
              jobDistributionOption: jobDistributionId,
              agencyId: null,
            };
          });

        this.jobDistributionsControl.patchValue([...jobDistributions, ...selectedJobDistributions], { emitEvent: false });
      });
  }

  public onSubmitQuickOrderForm(): void {
    const data = {
      organization: this.organizationForm.getRawValue(),
      orderType: this.orderTypeForm.getRawValue(),
      JobDistribution: this.jobDistributionDescriptionForm.getRawValue(),
      contactDetail: this.contactDetailsForm.getRawValue(),
    }
  }
}

