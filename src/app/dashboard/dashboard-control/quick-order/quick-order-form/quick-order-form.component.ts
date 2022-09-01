import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChangeEventArgs, FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { combineLatest, debounceTime, filter, merge, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { OrderType } from '@shared/enums/order-type';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Organisation, Region, Location, Department } from '@shared/models/visibility-settings.model';
import { Department as ContactDetails } from '@shared/models/department.model';
import { currencyValidator } from '@shared/validators/currency.validator';
import { integerValidator } from '@shared/validators/integer.validator';
import { AllOrganizationsSkill } from 'src/app/dashboard/models/all-organization-skill.model';
import { Duration } from '@shared/enums/durations';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { BillRate } from '@shared/models';
import { JobDistribution } from '@shared/enums/job-distibution';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import {
  GetAssociateAgencies,
  GetContactDetails,
  GetProjectSpecialData,
  SaveOrder,
  SetIsDirtyQuickOrderForm,
} from '@client/store/order-managment-content.actions';
import { MasterShiftName } from '@shared/enums/master-shifts-id.enum';
import PriceUtils from '@shared/utils/price.utils';
import { ORDER_CONTACT_DETAIL_TITLES } from '@shared/constants';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { GetOrganizationSettings } from '@organization-management/store/organization-management.actions';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { SettingsKeys } from '@shared/enums/settings';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { GetOrderRequisitionByPage } from '@organization-management/store/reject-reason.actions';
import { ORDER_DURATION_LIST } from '@shared/constants/order-duration-list';
import { ORDER_JOB_DISTRIBUTION_LIST } from '@shared/constants/order-job-distribution-list';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { ManualInvoiceReason } from '@shared/models/manual-invoice-reasons.model';

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
  @Input() public submitQuickOrder$: Subject<boolean>;

  @ViewChild('multiselect') public readonly multiselect: MultiSelectComponent;

  public organizationForm: FormGroup;
  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public specialProjectForm: FormGroup;
  public isSpecialProjectFieldsRequired = true;
  public isPermPlacementOrder = false;
  public isContactToPermOrder = false;
  public isEditContactTitle = false;
  public isTravelerOrder = false;
  public isOpenPerDiem = false;
  public isReOrder = false;
  public orderStatus = 'Open';
  public priceUtils = PriceUtils;
  public settings: { [key in SettingsKeys]?: OrganizationSettingsGet };

  public readonly orderTypes = [
    { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
    { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
    { id: OrderType.PermPlacement, name: 'Perm. Placement' },
    { id: OrderType.Traveler, name: 'Traveler' },
  ];
  public readonly orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public readonly organizationTypeFields: FieldSettingsModel = { text: 'name', value: 'organizationId' };

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

  public readonly durations = ORDER_DURATION_LIST;
  public readonly durationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public today = new Date();

  public isJobEndDateControlEnabled = false;

  public readonly jobDistributions = ORDER_JOB_DISTRIBUTION_LIST;
  public readonly jobDistributionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public agencyControlEnabled = false;

  @Select(OrderManagementContentState.associateAgencies)
  associateAgencies$: Observable<AssociateAgency[]>;
  associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };

  public readonly masterShiftNames = ORDER_MASTER_SHIFT_NAME_LIST;

  @Select(OrderManagementContentState.projectSpecialData)
  public readonly projectSpecialData$: Observable<ProjectSpecialData>;
  public readonly specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
  public readonly projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
  public readonly poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };

  public readonly masterShiftFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(RejectReasonState.orderRequisition)
  public readonly reasons$: Observable<RejectReasonPage>;

  public readonly reasonForRequisitionFields: FieldSettingsModel = { text: 'reason', value: 'id' };

  public readonly contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;

  @Select(OrganizationManagementState.organizationSettings)
  private readonly organizationSettings$: Observable<OrganizationSettingsGet[]>;

  @Select(OrderManagementContentState.contactDetails)
  private readonly contactDetails$: Observable<ContactDetails>;

  private isFormDirty: boolean = false;

  get orderTypeControl() {
    return this.orderTypeForm.get('orderType') as AbstractControl;
  }

  get jobStartDateControl() {
    return this.generalInformationForm.get('jobStartDate') as AbstractControl;
  }

  get durationControl() {
    return this.generalInformationForm.get('duration') as AbstractControl;
  }

  get jobDistributionControl() {
    return this.jobDistributionDescriptionForm.get('jobDistribution') as AbstractControl;
  }

  get agencyControl() {
    return this.jobDistributionDescriptionForm.get('agency') as AbstractControl;
  }

  get isAnyFormsDirty(): boolean {
    return [
      this.organizationForm,
      this.orderTypeForm,
      this.generalInformationForm,
      this.jobDistributionDescriptionForm,
      this.contactDetailsForm,
      this.specialProjectForm,
    ].some((formGr) => formGr.dirty);
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly store: Store,
    private readonly orderManagementService: OrderManagementContentService,
    private readonly actions$: Actions
  ) {
    super();
    this.initOrganizationForm();
    this.initOrderTypeForm();
    this.initGeneralInformationForm();
    this.initJobDistributionDescriptionForm();
    this.initContactDetailsForm();
    this.initSpecialProjectForm();
  }

  public ngOnInit(): void {
    this.handleOrderTypeControlValueChanges();
    this.orderTypeDeparmnetSkillListener();
    this.handleJobStartDateValueChanges();
    this.handleJobDistributionValueChanges();
    this.handleDurationControlValueChanges();
    this.populateQuickOrderFormValues();
    this.populateJobDistributionForm();
    this.populateShiftTimes();
    this.refreshMultiSelectAfterOpenDialog();
    this.subscribeForSettings();
    this.getContactDetails();
    this.getDataForOrganizationUser();
    this.cleanUpValidatorsForOrganizationUser();
    this.submitQuickOrder();
    this.detectFormValueChanges();
    this.setIsFormDirty();
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
      jobDescription: ['', Validators.maxLength(4000)],
      orderRequisitionReasonId: [null, Validators.required],
      orderRequisitionReasonName: [null],
    });
  }

  private initContactDetailsForm(): void {
    this.contactDetailsForm = this.fb.group({
      title: [[], Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isPrimaryContact: true,
    });
  }

  private initSpecialProjectForm(): void {
    this.specialProjectForm = this.fb.group({
      projectTypeId: [null, Validators.required],
      projectNameId: [null, Validators.required],
      poNumberId: [null, Validators.required],
    });
  }

  public onOrganizationDropDownSelected(event: ChangeEventArgs): void {
    const selectedOrganization = event.itemData as Organisation;
    const organizationId = selectedOrganization.organizationId;
    this.regionDataSource = selectedOrganization.regions;
    this.isRegionsDropDownEnabled = true;
    this.handleAllOrganizationSkills(organizationId);
    this.populateRegLocDepSkillFields(selectedOrganization.regions[0]);
    this.store.dispatch(new GetOrganizationSettings(undefined, organizationId));
    this.store.dispatch(new GetAssociateAgencies(organizationId));
    this.store.dispatch(new GetProjectSpecialData(organizationId));
    this.store.dispatch(new GetOrderRequisitionByPage(undefined, undefined, undefined, organizationId));
  }

  public onRegionDropDownSelected(event: ChangeEventArgs): void {
    this.resetLocation();
    this.resetDepartment();
    const selectedRegion = event.itemData as Region;
    this.locationDataSource = selectedRegion.locations;
    this.isLocationsDropDownEnabled = true;
  }

  public onLocationDropDownSelected(event: ChangeEventArgs): void {
    this.resetDepartment();
    const selectedLocation = event.itemData as Location;
    this.departmentDataSource = selectedLocation.departments;
    this.isDepartmentsDropDownEnabled = true;
  }

  public onDepartmentDropDownSelected(event: ChangeEventArgs): void {
    const selectedDepartment = event.itemData as Department;
    this.store.dispatch(new GetContactDetails(selectedDepartment.id, selectedDepartment.organizationId));
  }

  private resetRegion(): void {
    this.cdr.markForCheck();
    const regionControl = this.generalInformationForm.get('regionId') as AbstractControl;
    if (regionControl.value) {
      regionControl.reset(null, { emitValue: false });
      regionControl.markAsUntouched();
      this.regionDataSource = [];
      this.isRegionsDropDownEnabled = false;
    }
  }

  private resetLocation(): void {
    this.cdr.markForCheck();
    const locationControl = this.generalInformationForm.get('locationId') as AbstractControl;
    if (locationControl.value) {
      locationControl.reset(null, { emitValue: false });
      locationControl.markAsUntouched();
      this.locationDataSource = [];
      this.isLocationsDropDownEnabled = false;
    }
  }

  private resetDepartment(): void {
    this.cdr.markForCheck();
    const departmentControl = this.generalInformationForm.get('departmentId') as AbstractControl;
    if (departmentControl.value) {
      departmentControl.reset(null, { emitValue: false });
      departmentControl.markAsUntouched();
      this.departmentDataSource = [];
      this.isDepartmentsDropDownEnabled = false;
    }
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
      this.populateRegLocDepSkillFields(this.regionDataSource[0]);
    }
  }

  private populateRegLocDepSkillFields(region: Region | OrganizationRegion): void {
    if (region) {
      this.generalInformationForm.controls['regionId'].patchValue(region.id);
      this.isRegionsDropDownEnabled = true;
      this.locationDataSource = region.locations as Location[];
    }
    if (this.locationDataSource.length > 0) {
      this.generalInformationForm.controls['locationId'].patchValue(this.locationDataSource[0].id);
      this.isLocationsDropDownEnabled = true;
      this.departmentDataSource = this.locationDataSource[0].departments;
    }

    if (this.departmentDataSource.length > 0) {
      this.generalInformationForm.controls['departmentId'].patchValue(this.departmentDataSource[0].id);
      this.store.dispatch(
        new GetContactDetails(this.departmentDataSource[0].id, this.departmentDataSource[0].organizationId)
      );
      this.isDepartmentsDropDownEnabled = true;
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

  private getDataForOrganizationUser(): void {
    if (!this.userIsAdmin) {
      this.store.dispatch(new GetAssociateAgencies());
      this.store.dispatch(new GetProjectSpecialData());
      this.store.dispatch(new GetOrganizationSettings());
      this.store.dispatch(new GetOrderRequisitionByPage());
    }
  }

  private cleanUpValidatorsForOrganizationUser(): void {
    if (!this.userIsAdmin) {
      const organizationControl = this.organizationForm.controls['organization'];
      organizationControl.clearValidators();
      organizationControl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    /** Clone Date object to avoid modifying */
    const jobStartDateValue = new Date(jobStartDate.getTime());
    const jobEndDateControl = this.generalInformationForm.get('jobEndDate') as AbstractControl;

    switch (duration) {
      case Duration.TwelveWeeks:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 12 * 7)));
        break;

      case Duration.ThirteenWeeks:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 13 * 7)));
        break;

      case Duration.TwentySixWeeks:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setMonth(jobStartDateValue.getMonth() + 1)));
        break;

      case Duration.Year:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setFullYear(jobStartDateValue.getFullYear() + 1)));
        break;

      case Duration.NinetyDays:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 90)));
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
      this.handlePerDiemOrder();
      this.handlePermPlacementOrder();

      Object.keys(this.generalInformationForm.controls).forEach((key: string) => {
        this.generalInformationForm.controls[key].updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
    });
  }

  private handlePerDiemOrder(): void {
    const listOfCommonControls = [
      'hourlyRate',
      'openPositions',
      'jobStartDate',
      'jobEndDate',
      'shift',
      'shiftStartTime',
      'shiftEndTime',
    ];
    if (this.isOpenPerDiem) {
      listOfCommonControls.forEach((control) => {
        this.generalInformationForm.controls[control].setValidators(null);
        this.generalInformationForm.controls[control].patchValue(null, { emitEvent: false });
      });
    } else {
      listOfCommonControls.forEach((control) => {
        if (control === 'hourlyRate' || control === 'openPositions') {
          this.generalInformationForm.controls[control]?.setValidators([
            Validators.required,
            Validators.maxLength(10),
            currencyValidator(1),
          ]);
          return;
        }
        this.generalInformationForm.controls[control].setValidators(Validators.required);
      });
    }
  }

  private handlePermPlacementOrder(): void {
    const listOfPermPlacementControls = ['orderPlacementFee', 'annualSalaryRangeFrom', 'annualSalaryRangeTo'];
    const listOfGeneralOrderControls = ['hourlyRate', 'jobEndDate', 'duration', 'joiningBonus', 'compBonus'];

    if (this.isPermPlacementOrder) {
      this.addPermPlacementControls(listOfPermPlacementControls);
      this.removeValidators(listOfGeneralOrderControls);
    } else {
      this.removePermPlacementControls(listOfPermPlacementControls);
    }
  }

  private addPermPlacementControls(controlNames: string[]): void {
    controlNames.forEach((controlName: string) => {
      const formControl = this.fb.control(null, [Validators.required, Validators.maxLength(10), currencyValidator(1)]);
      this.generalInformationForm.addControl(controlName, formControl, { emitEvent: false });
    });
  }

  private removeValidators(controls: string[]): void {
    controls.forEach((controlName: string) => {
      if (this.generalInformationForm.contains(controlName)) {
        this.generalInformationForm.get(controlName)?.clearValidators();
      }
    });
  }

  private removePermPlacementControls(controls: string[]): void {
    controls.forEach((control: string) => {
      this.generalInformationForm.contains(control) &&
        this.generalInformationForm.removeControl(control, { emitEvent: false });
    });
  }

  private orderTypeDeparmnetSkillListener(): void {
    combineLatest([
      this.orderTypeControl.valueChanges,
      this.generalInformationForm.controls['departmentId'].valueChanges,
      this.generalInformationForm.controls['skillId'].valueChanges,
      this.userIsAdmin ? this.organizationForm.controls['organization'].valueChanges : of(null),
    ])
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(([orderType, departmentId, skillId, organizationId]) => {
        if (isNaN(parseInt(orderType)) || !departmentId || !skillId) {
          return;
        }
       
        this.populateHourlyRateField(orderType, departmentId, skillId, organizationId);
      });
  }

  private populateHourlyRateField(
    orderType: OrderType,
    departmentId: number,
    skillId: number,
    organizationId?: number
  ): void {;
    if (this.isTravelerOrder || this.isContactToPermOrder) {
      this.orderManagementService
        .getRegularLocalBillRate(orderType, departmentId, skillId, organizationId)
        .pipe(take(1))
        .subscribe((billRates: BillRate[]) => this.generalInformationForm.controls['hourlyRate'].patchValue(billRates[0]?.rateHour || null));
    }
  }

  private populateContactDetailsForm(name: string, email: string): void {
    this.contactDetailsForm.controls['name'].patchValue(name);
    this.contactDetailsForm.controls['email'].patchValue(email);
  }

  private populateQuickOrderFormValues(): void {
    this.orderTypeControl.patchValue(OrderType.Traveler);
    this.generalInformationForm.controls['openPositions'].patchValue(1);
    this.durationControl.patchValue(Duration.ThirteenWeeks);
    const nextSundayAfterThreeWeeks: Date = this.getNextSundayAfterThreeWeeks();
    if (nextSundayAfterThreeWeeks instanceof Date) {
      this.jobStartDateControl.patchValue(nextSundayAfterThreeWeeks);
    }
  }

  private getContactDetails(): void {
    this.contactDetails$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((contactDetails) => {
      const { facilityContact, facilityEmail } = contactDetails;
      this.populateContactDetailsForm(facilityContact, facilityEmail);
    });
  }

  private populateJobDistributionForm(): void {
    this.jobDistributionControl.patchValue([JobDistribution.All]);
  }

  private populateShiftTimes() {
    const date = new Date();
    const shiftControls = {
      shift: MasterShiftName.Day,
      shiftStartTime: new Date(date.setHours(7, 0, 0)),
      shiftEndTime: new Date(date.setHours(19, 30, 0)),
    };
    if (this.isTravelerOrder || this.isContactToPermOrder || this.isPermPlacementOrder) {
      Object.entries(shiftControls).forEach(([name, value]) => {
        this.generalInformationForm.get(name)?.patchValue(value);
      });
    } else {
      Object.keys(shiftControls).forEach((name) => {
        this.generalInformationForm.contains(name) && this.generalInformationForm.setValidators(null);
      });
    }
  }

  private refreshMultiSelectAfterOpenDialog(): void {
    this.openEvent.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe((isOpen) => {
      if (isOpen) {
        this.multiselect.refresh();
      }
    });
  }

  private handleJobDistributionValueChanges(): void {
    this.jobDistributionControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((jobDistributionIds: JobDistribution[]) => {
        this.cdr.markForCheck();
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

        this.jobDistributionDescriptionForm.controls['jobDistributions'].patchValue(
          [...jobDistributions, ...selectedJobDistributions],
          {
            emitEvent: false,
          }
        );
      });
  }

  private subscribeForSettings(): void {
    this.organizationSettings$.pipe(takeUntil(this.destroy$)).subscribe((settings) => {
      const projectFields = ['projectTypeId', 'projectNameId', 'poNumberId'];
      this.settings = SettingsHelper.mapSettings(settings);
      this.isSpecialProjectFieldsRequired = this.settings[SettingsKeys.MandatorySpecialProjectDetails]?.value;
      if (this.specialProjectForm != null) {
        if (this.isSpecialProjectFieldsRequired) {
          projectFields.forEach((control) =>
            this.specialProjectForm.controls[control].setValidators(Validators.required)
          );
        } else {
          projectFields.forEach((control) => this.specialProjectForm.controls[control].clearValidators());
        }
        projectFields.forEach((control) => this.specialProjectForm.controls[control].updateValueAndValidity());
      }
    });
  }

  public onSubmitQuickOrderForm(): void {
    if (
      this.organizationForm.valid &&
      this.orderTypeForm.valid &&
      this.generalInformationForm.valid &&
      this.jobDistributionDescriptionForm.valid &&
      this.contactDetailsForm.valid &&
      this.specialProjectForm.valid
    ) {
      const order = {
        isSubmit: true,
        isQuickOrder: true,
        contactDetails: [this.contactDetailsForm.getRawValue()],
        ...this.orderTypeForm.getRawValue(),
        ...this.generalInformationForm.getRawValue(),
        ...this.specialProjectForm.getRawValue(),
        ...this.jobDistributionDescriptionForm.getRawValue(),
      };
      const selectedBusinessUnitId = this.organizationForm.value.organization;
      this.store.dispatch(new SaveOrder(order, [], undefined, selectedBusinessUnitId));
      this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(SaveOrder)).subscribe(() => {
        this.openEvent.next(false);
      });
    } else {
      this.cdr.markForCheck();
      this.organizationForm.markAllAsTouched();
      this.orderTypeForm.markAllAsTouched();
      this.generalInformationForm.markAllAsTouched();
      this.jobDistributionDescriptionForm.markAllAsTouched();
      this.contactDetailsForm.markAllAsTouched();
      this.specialProjectForm.markAllAsTouched();
    }
  }

  private submitQuickOrder(): void {
    this.submitQuickOrder$.pipe(takeUntil(this.destroy$)).subscribe((isSubmit) => {
      if (isSubmit) {
        this.onSubmitQuickOrderForm();
      }
    });
  }

  private detectFormValueChanges(): void {
    this.contactDetailsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
    this.jobDistributionDescriptionForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
    this.generalInformationForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.cdr.markForCheck());
  }

  private setIsFormDirty(): void {
    merge(
      this.organizationForm.valueChanges,
      this.orderTypeForm.valueChanges,
      this.generalInformationForm.valueChanges,
      this.jobDistributionDescriptionForm.valueChanges,
      this.contactDetailsForm.valueChanges,
      this.specialProjectForm.valueChanges
    )
      .pipe(
        takeUntil(this.destroy$),
        filter(() => this.isFormDirty !== this.isAnyFormsDirty)
      )
      .subscribe(() => {
        this.isFormDirty = this.isAnyFormsDirty;
        this.store.dispatch(new SetIsDirtyQuickOrderForm(this.isAnyFormsDirty));
      });
  }

  public onRequisitionChange(event: ChangeEventArgs): void {
    const reasonName = (event.itemData as ManualInvoiceReason).reason;
    this.jobDistributionDescriptionForm.controls['orderRequisitionReasonName'].patchValue(reasonName);
  }
}
