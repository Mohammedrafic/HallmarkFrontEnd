import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChangeEventArgs, FieldSettingsModel, FilteringEventArgs, highlightSearch } from '@syncfusion/ej2-angular-dropdowns';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { OrderType, OrderTypeOptions } from '@shared/enums/order-type';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { Department as ContactDetails } from '@shared/models/department.model';
import { currencyValidator } from '@shared/validators/currency.validator';
import { Duration } from '@shared/enums/durations';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { BillRate } from '@shared/models';
import { OrderJobDistribution } from '@shared/enums/job-distibution';
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
import { ORDER_CONTACT_DETAIL_TITLES, OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
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
import { distributionSource, ORDER_JOB_DISTRIBUTION } from '@shared/constants/order-job-distribution-list';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { ManualInvoiceReason } from '@shared/models/manual-invoice-reasons.model';
import { DurationService } from '@shared/services/duration.service';
import { DateTimeHelper, GenerateLocationDepartmentOverlapMessage } from '@core/helpers';
import { TierLogic } from '@shared/enums/tier-logic.enum';
import { SettingsViewService } from '@shared/services';
import {
  associateAgencyFields,
  CommonList,
  GeneralOrderList,
  optionFields,
  organizationFields,
  PermPlacementList,
  poNumberFields,
  projectNameFields,
  QuickOrderCondition,
  reasonForRequisitionFields,
  skillsFields,
  specialProjectCategoriesFields,
} from '../constants';
import { QuickOrderConditions } from '../interfaces';
import { QuickOrderService } from '../services';

import { GetOrganizationSkills, ToggleQuickOrderDialog } from 'src/app/dashboard/store/dashboard.actions';
import { DashboardState } from 'src/app/dashboard/store/dashboard.state';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { PartialSearchService } from '@shared/services/partial-search.service';
import { PartialSearchDataType } from '@shared/models/partial-search-data-source.model';
import { CreateOrderDto } from '@shared/models/order-management.model';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-quick-order-form',
  templateUrl: './quick-order-form.component.html',
  styleUrls: ['./quick-order-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickOrderFormComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public organizationStructure: OrganizationStructure;
  @Input() public submitQuickOrder$: Subject<boolean>;
  @Input() public isMobile: boolean;

  public organizationForm: FormGroup;
  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public specialProjectForm: FormGroup;

  public shiftNameField: AbstractControl;
  public shiftStartTimeField: AbstractControl;
  public shiftEndTimeField: AbstractControl;
  private filterQueryString: string;
  private readonly highlightDropdownSearchString  = { itemCreated: (e: { item: HTMLElement; }) => {
    highlightSearch(e.item, this.filterQueryString, true, 'Contains') }
  }

  public readonly quickOrderConditions: QuickOrderConditions = { ...QuickOrderCondition };
  public readonly optionFields: FieldSettingsModel = { ...optionFields, ...this.highlightDropdownSearchString };
  public readonly skillFields: FieldSettingsModel = { ...skillsFields, ...this.highlightDropdownSearchString };
  public readonly organizationTypeFields: FieldSettingsModel = organizationFields;
  public readonly associateAgencyFields: FieldSettingsModel = associateAgencyFields;
  public readonly specialProjectCategoriesFields: FieldSettingsModel = specialProjectCategoriesFields;
  public readonly projectNameFields: FieldSettingsModel = projectNameFields;
  public readonly poNumberFields: FieldSettingsModel = poNumberFields;
  public readonly reasonForRequisitionFields: FieldSettingsModel = reasonForRequisitionFields;

  public orderStatus = 'Open';
  public priceUtils = PriceUtils;
  public settings: { [key in SettingsKeys]?: OrganizationSettingsGet };
  public readonly orderTypes = OrderTypeOptions;
  public readonly durations = ORDER_DURATION_LIST;
  public readonly masterShiftNames = ORDER_MASTER_SHIFT_NAME_LIST;
  public readonly contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;
  public regionDataSource: OrganizationRegion[] = [];
  public locationDataSource: OrganizationLocation[] = [];
  public departmentDataSource: OrganizationDepartment[] = [];
  public jobDistributions = ORDER_JOB_DISTRIBUTION;

  private selectedOrganizationId: number;
  private selectedLocation: OrganizationLocation;
  private selectedDepartment: OrganizationDepartment;

  @Select(OrderManagementContentState.associateAgencies)
  public associateAgencies$: Observable<AssociateAgency[]>;
  @Select(OrderManagementContentState.projectSpecialData)
  public readonly projectSpecialData$: Observable<ProjectSpecialData>;
  @Select(RejectReasonState.sortedOrderRequisition)
  public readonly reasons$: Observable<RejectReasonPage>;
  @Select(OrganizationManagementState.organizationSettings)
  private readonly organizationSettings$: Observable<OrganizationSettingsGet[]>;
  @Select(OrderManagementContentState.contactDetails)
  private readonly contactDetails$: Observable<ContactDetails>;
  @Select(DashboardState.getOrganizationSkills) public readonly organizationSkills$: Observable<AssignedSkillsByOrganization[]>;

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
    private readonly actions$: Actions,
    private readonly durationService: DurationService,
    private readonly settingsViewService: SettingsViewService,
    private readonly quickOrderService: QuickOrderService,
    private readonly partialSearchService: PartialSearchService,
    private readonly confirmService: ConfirmService,
  ) {
    super();
    this.initOrderForms();
    this.initOrderInformationForm();
  }

  public ngOnInit(): void {
    this.handleOrderTypeControlValueChanges();
    this.orderTypeDepartmentSkillListener();
    this.handleJobStartDateValueChanges();
    this.handleJobDistributionValueChanges();
    this.handleAgencyValueChanges();
    this.handleDurationControlValueChanges();
    this.populateQuickOrderFormValues();
    this.populateShiftTimes();
    this.handleOrganizationUserDataStructure();
    this.subscribeForSettings();
    this.getContactDetails();
    this.getDataForOrganizationUser();
    this.cleanUpValidatorsForOrganizationUser();
    this.submitQuickOrder();
    this.detectFormValueChanges();
    this.populateJobDistributionForm();
    this.setIsFormDirty();
    this.watchForDepartmentId();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['organizationStructure'] && this.handleOrganizationUserDataStructure();
  }

  private initOrderForms(): void {
    this.organizationForm = this.quickOrderService.createOrganizationForm();
    this.orderTypeForm = this.quickOrderService.createOrderTypeForm();
    this.jobDistributionDescriptionForm = this.quickOrderService.createJobDistributionForm();
    this.contactDetailsForm = this.quickOrderService.createContactDetailsForm();
    this.specialProjectForm = this.quickOrderService.createSpecialProjectForm();
  }

  private initOrderInformationForm(): void {
    this.generalInformationForm = this.quickOrderService.createOrderInformationForm();
    this.shiftNameField = this.generalInformationForm.get('shift') as AbstractControl;
    this.shiftStartTimeField = this.generalInformationForm.get('shiftStartTime') as AbstractControl;
    this.shiftEndTimeField = this.generalInformationForm.get('shiftEndTime') as AbstractControl;
    this.setShiftsValidation();

    this.watchForShifts();
  }

  private watchForShifts(): void {
    this.shiftNameField.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    )
      .subscribe((value: MasterShiftName) => {
        if (value === MasterShiftName.Rotating) {
          this.clearShiftsValidation();
          this.quickOrderConditions.isShiftTimeRequired = false;
        } else {
          this.setShiftsValidation();
          this.quickOrderConditions.isShiftTimeRequired = true;
        }
        this.updateShifts();
      });
  }

  public changeOrganizationDropdown(event: ChangeEventArgs): void {
    const selectedOrganization = event.itemData as Organisation;
    this.selectedOrganizationId = selectedOrganization.organizationId;
    const organizationId = selectedOrganization.organizationId;
    this.regionDataSource = selectedOrganization.regions;
    this.quickOrderConditions.isRegionsDropDownEnabled = true;
    this.populateRegLocDepFields(selectedOrganization.regions[0]);

    this.store.dispatch([
      new GetOrganizationSettings(undefined, organizationId),
      new GetAssociateAgencies(organizationId),
      new GetProjectSpecialData(organizationId),
      new GetOrderRequisitionByPage(undefined, undefined, undefined, organizationId),
      new GetOrganizationSkills(organizationId),
    ]);

    this.orderTypeControl.updateValueAndValidity();
  }

  public changeRegionDropdown(event: ChangeEventArgs): void {
    this.resetLocation();
    this.resetDepartment();
    const selectedRegion = event.itemData as OrganizationRegion;
    this.locationDataSource = this.getActiveLocations(selectedRegion.locations || []);
    this.quickOrderConditions.isLocationsDropDownEnabled = true;
  }

  public changeLocationDropdown(event: ChangeEventArgs): void {
    this.resetDepartment();
    this.selectedLocation = event.itemData as OrganizationLocation;
    this.departmentDataSource = this.getActiveDepartments(this.selectedLocation.departments);
    this.quickOrderConditions.isDepartmentsDropDownEnabled = true;
  }

  public changeDepartmentDropdown(event: ChangeEventArgs): void {
    this.selectedDepartment = event.itemData as OrganizationDepartment;
    this.store.dispatch(new GetContactDetails(this.selectedDepartment.id, this.selectedDepartment.organizationId));
  }

  private resetLocation(): void {
    this.cdr.markForCheck();
    const locationControl = this.generalInformationForm.get('locationId') as AbstractControl;
    if (locationControl.value) {
      locationControl.reset(null, { emitValue: false });
      locationControl.markAsUntouched();
      this.locationDataSource = [];
      this.quickOrderConditions.isLocationsDropDownEnabled = false;
    }
  }

  private resetDepartment(): void {
    this.cdr.markForCheck();
    const departmentControl = this.generalInformationForm.get('departmentId') as AbstractControl;
    if (departmentControl.value) {
      departmentControl.reset(null, { emitValue: false });
      departmentControl.markAsUntouched();
      this.departmentDataSource = [];
      this.quickOrderConditions.isDepartmentsDropDownEnabled = false;
    }
  }

  private handleOrganizationUserDataStructure(): void {
    if (!this.userIsAdmin && this.organizationStructure) {
      this.regionDataSource = this.organizationStructure.regions;
      this.populateRegLocDepFields(this.regionDataSource[0]);
      this.orderTypeControl.updateValueAndValidity();
      this.getContactDetails();
    }
  }

  private getActiveLocations(arr: OrganizationLocation[]): OrganizationLocation[] {
    return arr.filter((location: OrganizationLocation) => !location.isDeactivated);
  }

  private getActiveDepartments(arr: OrganizationDepartment[]): OrganizationDepartment[] {
    return arr.filter((department: OrganizationDepartment) => !department.isDeactivated);
  }

  private populateRegLocDepFields(region: OrganizationRegion): void {
    if (region) {
      this.generalInformationForm.controls['regionId'].patchValue(region.id);
      this.quickOrderConditions.isRegionsDropDownEnabled = true;
      this.locationDataSource = region.locations ? this.getActiveLocations(region.locations) : [];
    }
    if (this.locationDataSource.length > 0) {
      this.selectedLocation = this.locationDataSource[0];
      this.generalInformationForm.controls['locationId'].patchValue(this.locationDataSource[0].id);
      this.quickOrderConditions.isLocationsDropDownEnabled = true;
      this.departmentDataSource = this.getActiveDepartments(this.locationDataSource[0].departments);
    }

    if (this.departmentDataSource.length > 0) {
      this.selectedDepartment = this.departmentDataSource[0];
      this.generalInformationForm.controls['departmentId'].patchValue(this.departmentDataSource[0].id);
      this.store.dispatch(
        new GetContactDetails(this.departmentDataSource[0].id, this.departmentDataSource[0].organizationId)
      );
      this.quickOrderConditions.isDepartmentsDropDownEnabled = true;
    }
  }

  private handleDurationControlValueChanges(): void {
    this.durationControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((duration: Duration) => {
      this.quickOrderConditions.isJobEndDateControlEnabled = duration === Duration.Other;

      const jobStartDate = this.getNextSundayAfterThreeWeeks();
      if (!(jobStartDate instanceof Date)) {
        return;
      }
      jobStartDate.setHours(0, 0, 0, 0);
      this.jobStartDateControl.patchValue(jobStartDate);
      this.autoSetupJobEndDateControl(duration, jobStartDate);
      this.cdr.markForCheck();
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
    this.jobStartDateControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((jobStartDate: Date | null) => {
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
      this.store.dispatch([
        new GetAssociateAgencies(),
        new GetProjectSpecialData(),
        new GetOrganizationSettings(),
        new GetOrderRequisitionByPage(),
        new GetOrganizationSkills()
      ]);
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

    const jobEndDate: Date = this.durationService.getEndDate(duration, jobStartDateValue);
    jobEndDate.setHours(0, 0, 0, 0);
    jobEndDateControl.patchValue(jobEndDate);
  }

  private handleOrderTypeControlValueChanges(): void {
    this.orderTypeControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.quickOrderConditions.isContactToPermOrder = value === OrderType.ContractToPerm;
      this.quickOrderConditions.isTravelerOrder = value === OrderType.Traveler;
      this.quickOrderConditions.isPermPlacementOrder = value === OrderType.PermPlacement;
      this.quickOrderConditions.isOpenPerDiem = value === OrderType.OpenPerDiem;
      this.handlePerDiemOrder();
      this.handlePermPlacementOrder();

      Object.keys(this.generalInformationForm.controls).forEach((key: string) => {
        this.generalInformationForm.controls[key].updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });

      this.cdr.markForCheck();
    });
  }

  private handlePerDiemOrder(): void {
    const listOfCommonControls = CommonList;

    if (this.quickOrderConditions.isOpenPerDiem) {
      listOfCommonControls.forEach((control) => {
        this.generalInformationForm.controls[control].setValidators(null);
        this.generalInformationForm.controls[control].patchValue(null, { emitEvent: false });
      });
    } else {
      this.populateQuickOrderFormValues();
      this.populateShiftTimes();
      listOfCommonControls.forEach((control) => {
        if (control === 'openPositions') {
          this.generalInformationForm.controls['control']?.setValidators([
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
    const listOfPermPlacementControls = PermPlacementList;
    const listOfGeneralOrderControls = GeneralOrderList;

    if (this.quickOrderConditions.isPermPlacementOrder) {
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

  private orderTypeDepartmentSkillListener(): void {
    combineLatest([
      this.orderTypeControl.valueChanges,
      this.generalInformationForm.controls['departmentId'].valueChanges,
      this.generalInformationForm.controls['skillId'].valueChanges,
      this.generalInformationForm.controls['jobStartDate'].valueChanges,
      this.generalInformationForm.controls['jobEndDate'].valueChanges,
      this.userIsAdmin ? this.organizationForm.controls['organization'].valueChanges : of(null),
    ])
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      ).subscribe(([orderType, departmentId, skillId, jobStartDate, jobEndDate, organizationId]) => {
        if (isNaN(parseInt(orderType)) || !departmentId || !skillId || !jobStartDate || !jobEndDate) {
          return;
        }

        this.populateHourlyRateField(orderType, departmentId, skillId, jobStartDate, jobEndDate, organizationId);
      });
  }

  private populateHourlyRateField(
    orderType: OrderType,
    departmentId: number,
    skillId: number,
    jobStartDate: Date,
    jobEndDate: Date,
    organizationId?: number
  ): void {
    if (this.quickOrderConditions.isTravelerOrder || this.quickOrderConditions.isContactToPermOrder) {
      const startDate = DateTimeHelper.toUtcFormat(jobStartDate);
      const endDate = DateTimeHelper.toUtcFormat(jobEndDate);
      this.orderManagementService
        .getRegularBillRate(orderType, departmentId, skillId, startDate, endDate, organizationId)
        .pipe(take(1))
        .subscribe((billRate: BillRate) =>
          this.generalInformationForm.controls['hourlyRate'].patchValue(billRate?.rateHour.toFixed(2) || null)
        );
    }
  }

  private populateContactDetailsForm(name: string, email: string): void {
    this.contactDetailsForm.controls['name'].patchValue(name);
    this.contactDetailsForm.controls['email'].patchValue(email);
  }

  private populateQuickOrderFormValues(): void {
    this.generalInformationForm.controls['openPositions'].patchValue(1);
    this.durationControl.patchValue(Duration.ThirteenWeeks);
    const nextSundayAfterThreeWeeks: Date = this.getNextSundayAfterThreeWeeks();
    nextSundayAfterThreeWeeks.setHours(0, 0, 0, 0);
    if (nextSundayAfterThreeWeeks instanceof Date) {
      this.jobStartDateControl.patchValue(nextSundayAfterThreeWeeks);
    }
  }

  private getContactDetails(): void {
    this.generalInformationForm.controls['departmentId'].valueChanges
      .pipe(
        switchMap(() => {
          return this.contactDetails$;
        }),
        filter(Boolean),
        takeUntil(this.destroy$)
      )
      .subscribe((contactDetails) => {
        const { facilityContact, facilityEmail } = contactDetails;
        this.populateContactDetailsForm(facilityContact, facilityEmail);
      });
  }

  private populateJobDistributionForm(): void {
    this.jobDistributionControl.patchValue(OrderJobDistribution.All);
  }

  private populateShiftTimes() {
    const date = new Date();
    const shiftControls = {
      shift: MasterShiftName.Day,
      shiftStartTime: new Date(date.setHours(7, 0, 0)),
      shiftEndTime: new Date(date.setHours(19, 30, 0)),
    };
    if (this.quickOrderConditions.isTravelerOrder || this.quickOrderConditions.isContactToPermOrder || this.quickOrderConditions.isPermPlacementOrder) {
      Object.entries(shiftControls).forEach(([name, value]) => {
        this.generalInformationForm.get(name)?.patchValue(value);
      });
    } else {
      Object.keys(shiftControls).forEach((name) => {
        this.generalInformationForm.contains(name) && this.generalInformationForm.setValidators(null);
      });
    }
  }

  private handleAgencyValueChanges(): void {
    this.agencyControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((agencyIds) => {
      const selectedJobDistributions: JobDistributionModel[] = [];
      if (agencyIds) {
        agencyIds.forEach((agencyId: number) => {
          selectedJobDistributions.push({
            id: 0,
            orderId: 0,
            jobDistributionOption: OrderJobDistribution.Selected,
            agencyId,
          });
        });
        this.jobDistributionDescriptionForm.controls['jobDistributions'].patchValue(selectedJobDistributions, {
          emitEvent: false,
        });
      }
    });
  }

  private handleJobDistributionValueChanges(): void {
    this.jobDistributionControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((jobDistributionId: OrderJobDistribution) => {
        this.cdr.markForCheck();
        if (jobDistributionId === OrderJobDistribution.All) {
          this.jobDistributionControl.patchValue(OrderJobDistribution.All, { emitEvent: false });
        }

        this.quickOrderConditions.agencyControlEnabled = jobDistributionId === OrderJobDistribution.Selected;
        this.addValidatorsForAgencyControl();

        let jobDistributions = {
          id: 0,
          orderId: 0,
          jobDistributionOption: jobDistributionId,
          agencyId: null,
        };

        this.jobDistributionDescriptionForm.controls['jobDistributions'].patchValue([jobDistributions], {
          emitEvent: false,
        });
      });
  }

  private addValidatorsForAgencyControl(): void {
    if (this.quickOrderConditions.agencyControlEnabled) {
      this.agencyControl.addValidators(Validators.required);
    } else {
      this.agencyControl.removeValidators(Validators.required);
      this.agencyControl.reset();
    }
    this.agencyControl.updateValueAndValidity();
  }

  private subscribeForSettings(): void {
    this.organizationSettings$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((settings: OrganizationSettingsGet[]) => {
      const projectFields = ['projectTypeId', 'projectNameId', 'poNumberId'];
      this.settings = SettingsHelper.mapSettings(settings);
      this.quickOrderConditions.isSpecialProjectFieldsRequired = this.settings[SettingsKeys.MandatorySpecialProjectDetails]?.value;
      if (this.specialProjectForm != null) {
        if (this.quickOrderConditions.isSpecialProjectFieldsRequired) {
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

  private showConfirmLocationDepartmentOverlap(order: CreateOrderDto, message: string): void {
    this.confirmService
      .confirm(message, {
        title: 'Confirmation',
        okButtonLabel: 'Yes',
        cancelButtonLabel: 'Cancel',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe((res) => {
        this.proceedWithSaving(order);
      });
  }

  private proceedWithSaving(order: CreateOrderDto): void {
    const selectedBusinessUnitId = this.organizationForm.value.organization;
    this.store.dispatch(new SaveOrder(order, [], undefined, selectedBusinessUnitId));
    this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(SaveOrder)).subscribe(() => {
      this.store.dispatch(new ToggleQuickOrderDialog(false));
    });
  }

  private checkInactiveLocationDepartmentOverlap(order: CreateOrderDto): void {
    if (this.selectedLocation && this.selectedDepartment && (order.orderType !== OrderType.OpenPerDiem)) {
      const jobEndDate = order.jobEndDate;
      const locationInactiveDate = this.selectedLocation.inactiveDate ?
        new Date(DateTimeHelper.formatDateUTC(this.selectedLocation.inactiveDate, 'MM/dd/yyyy')) : null;
      const departmentInactiveDate = this.selectedDepartment.inactiveDate ?
        new Date(DateTimeHelper.formatDateUTC(this.selectedDepartment.inactiveDate, 'MM/dd/yyyy')) : null;
        locationInactiveDate && locationInactiveDate.setHours(0, 0, 0, 0);
        departmentInactiveDate && departmentInactiveDate.setHours(0, 0, 0, 0);
      const isLocationOverlaps = !!locationInactiveDate && DateTimeHelper.isDateBefore(locationInactiveDate, jobEndDate);
      const isDepartmentOverlaps = !!departmentInactiveDate && DateTimeHelper.isDateBefore(departmentInactiveDate, jobEndDate);
      const isLocationDepartmentDateSame = this.selectedLocation.inactiveDate === this.selectedDepartment.inactiveDate;
      if (isLocationOverlaps || isDepartmentOverlaps) {
        this.showConfirmLocationDepartmentOverlap(order, GenerateLocationDepartmentOverlapMessage(isLocationOverlaps, isDepartmentOverlaps, isLocationDepartmentDateSame, locationInactiveDate as Date, departmentInactiveDate as Date));
      } else {
        this.proceedWithSaving(order);
      }
    } else {
      this.proceedWithSaving(order);
    }
  }

  public submitQuickOrderForm(): void {
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
        title: this.organizationForm.get('title')?.value,
        contactDetails: [this.contactDetailsForm.getRawValue()],
        ...this.orderTypeForm.getRawValue(),
        ...this.generalInformationForm.getRawValue(),
        ...this.specialProjectForm.getRawValue(),
        ...this.jobDistributionDescriptionForm.getRawValue(),
      };
      this.checkInactiveLocationDepartmentOverlap(order);
    } else {
      this.organizationForm.markAllAsTouched();
      this.orderTypeForm.markAllAsTouched();
      this.generalInformationForm.markAllAsTouched();
      this.jobDistributionDescriptionForm.markAllAsTouched();
      this.contactDetailsForm.markAllAsTouched();
      this.specialProjectForm.markAllAsTouched();
      this.cdr.markForCheck();
    }
  }

  private submitQuickOrder(): void {
    this.submitQuickOrder$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$))
      .subscribe(() => {
        this.submitQuickOrderForm();
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
        filter(() => this.quickOrderConditions.isFormDirty !== this.isAnyFormsDirty),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.quickOrderConditions.isFormDirty = this.isAnyFormsDirty;
        this.store.dispatch(new SetIsDirtyQuickOrderForm(this.isAnyFormsDirty));
      });
  }

  public onRequisitionChange(event: ChangeEventArgs): void {
    const reasonName = (event.itemData as ManualInvoiceReason).reason;
    this.jobDistributionDescriptionForm.controls['orderRequisitionReasonName'].patchValue(reasonName);
  }

  setShiftsValidation(): void {
    this.shiftStartTimeField.addValidators([
      Validators.required
    ]);
    this.shiftEndTimeField.addValidators([
      Validators.required
    ]);
  }

  clearShiftsValidation(): void {
    this.shiftStartTimeField.clearValidators();
    this.shiftEndTimeField.clearValidators();
  }

  updateShifts(): void {
    this.shiftStartTimeField.updateValueAndValidity();
    this.shiftEndTimeField.updateValueAndValidity();
  }

  private watchForDepartmentId(): void {
    this.generalInformationForm.get('departmentId')?.valueChanges
      .pipe(
        filter(Boolean),
        switchMap((id: number) => {
          return this.settingsViewService.getViewSettingKey(
            OrganizationSettingKeys.TieringLogic,
            OrganizationalHierarchy.Department,
            id,
            this.selectedOrganizationId
          )
        }),
        takeUntil(this.destroy$)
      ).subscribe(({ TieringLogic }) => {
        this.jobDistributions = distributionSource(TieringLogic === TierLogic.Show);
        this.cdr.markForCheck();
      });
  }

  public filterItemsBySubString<T>(
    event: FilteringEventArgs,
    dataSource: T[],
    options: FieldSettingsModel,
  ): void {
    const queryString = event.text.trim();
    this.partialSearchService
      .searchDropdownItems(dataSource, queryString, options)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.filterQueryString = queryString;
        event.updateData(data as PartialSearchDataType[]);
      });
  }

  public closeDropdown(): void {
    this.filterQueryString = '';
  }
}
