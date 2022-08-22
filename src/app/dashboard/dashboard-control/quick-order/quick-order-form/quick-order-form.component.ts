import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { OrderType } from '@shared/enums/order-type';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Organisation, Region, Location, Department } from '@shared/models/visibility-settings.model';
import { currencyValidator } from '@shared/validators/currency.validator';
import { integerValidator } from '@shared/validators/integer.validator';
import { AllOrganizationsSkill } from 'src/app/dashboard/models/all-organization-skill.model';
import { Duration } from '@shared/enums/durations';
import { combineLatest, filter, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { BillRate } from '@shared/models';

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

  public organizationForm: FormGroup;
  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public orderStatus = 'Open';
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
  public isTravelerOrContactPermOrder = true;

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly orderManagementService: OrderManagementContentService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initOrganizationForm();
    this.initOrderTypeForm();
    this.initGeneralInformationForm();
    this.handleDurationControlValueChanges();
    this.handleJobStartDateValueChanges();
    this.handleOrderTypeControlValueChanges();
    this.orderTypeDeparmnetSkillListener();
    this.populateNewOrderForm();
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

  public onOrganizationDropDownSelected(event: ChangeEventArgs): void {
    const selectedOrganization = event.itemData as Organisation;
    this.regionDataSource = selectedOrganization.regions;
    this.isRegionsDropDownEnabled = true;
    this.handleAllOrganizationSkills(selectedOrganization.organizationId);
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
      this.isTravelerOrContactPermOrder = value === OrderType.ContractToPerm || value === OrderType.Traveler;
    });
  }

  private orderTypeDeparmnetSkillListener(): void {
    combineLatest([
      this.orderTypeControl.valueChanges,
      this.departmentControl.valueChanges,
      this.skillControl.valueChanges,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([orderType, departmentId, skillId]) => {
        if (isNaN(parseInt(orderType)) || !departmentId || !skillId) {
          return;
        }
        this.populateHourlyRateField(orderType, departmentId, skillId);
        // this.store.dispatch(new SetPredefinedBillRatesData(orderType, departmentId, skillId));
      });
  }

  private populateHourlyRateField(orderType: OrderType, departmentId: number, skillId: number): void {
    if (this.isTravelerOrContactPermOrder) {
      this.orderManagementService
        .getRegularLocalBillRate(orderType, departmentId, skillId)
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
    this.durationControl.patchValue(Duration.ThirteenWeeks, { emitEvent: false });
    const nextSundayAfterThreeWeeks: Date = this.getNextSundayAfterThreeWeeks();
    if (nextSundayAfterThreeWeeks instanceof Date) {
      this.jobStartDateControl.patchValue(nextSundayAfterThreeWeeks);
    }
    // this.jobDistributionForm.controls['jobDistribution'].patchValue([JobDistribution.All]);

    // this.contactDetails$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((contactDetails) => {
    // const { facilityContact, facilityPhoneNo, facilityEmail } = contactDetails;
    // this.populateContactDetailsForm(facilityContact, facilityEmail, facilityPhoneNo);
    // });
  }
}
