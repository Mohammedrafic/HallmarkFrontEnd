import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { combineLatest, debounceTime, filter, Observable, Subject, take, takeUntil, throttleTime, switchMap } from 'rxjs';

import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetMasterSkillsByOrganization,
  GetOrganizationSettings,
  GetRegions,
} from '@organization-management/store/organization-management.actions';
import {
  ClearSelectedOrder,
  ClearSuggestions,
  GetAssociateAgencies,
  GetContactDetails,
  GetOrganizationStatesWithKeyCode,
  GetProjectSpecialData,
  GetSuggestedDetails,
  SetIsDirtyOrderForm,
  SetPredefinedBillRatesData,
} from '@client/store/order-managment-content.actions';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import { Department } from '@shared/models/department.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { Order, OrderContactDetails, OrderWorkLocation, SuggestedDetails } from '@shared/models/order-management.model';
import { Document } from '@shared/models/document.model';

import { OrderType } from '@shared/enums/order-type';
import { Duration } from '@shared/enums/durations';
import { JobDistribution } from '@shared/enums/job-distibution';
import { JobClassification } from '@shared/enums/job-classification';

import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { integerValidator } from '@shared/validators/integer.validator';
import { currencyValidator } from '@shared/validators/currency.validator';

import { ORDER_CONTACT_DETAIL_TITLES, ORDER_EDITS, ORDER_PER_DIEM_EDITS } from '@shared/constants';
import PriceUtils from '@shared/utils/price.utils';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { SkillCategory } from '@shared/models/skill-category.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import { OrderStatus } from '@shared/enums/order-management';
import { disableControls } from '@shared/utils/form.utils';
import { AlertService } from '@shared/services/alert.service';
import { GetPredefinedCredentials } from '@order-credentials/store/credentials.actions';
import { Comment } from '@shared/models/comment.model';
import { ChangeArgs } from '@syncfusion/ej2-angular-buttons';
import { BillRate } from '@shared/models';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { CommentsService } from '@shared/services/comments.service';
import { greaterThanValidator } from '@shared/validators/greater-than.validator';
import { SettingsHelper } from '@core/helpers/settings.helper';
import { SettingsKeys } from '@shared/enums/settings';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { GetOrderRequisitionByPage } from '@organization-management/store/reject-reason.actions';
import { ORDER_DURATION_LIST } from '@shared/constants/order-duration-list';
import { ORDER_JOB_DISTRIBUTION_LIST } from '@shared/constants/order-job-distribution-list';
import { ORDER_MASTER_SHIFT_NAME_LIST } from '@shared/constants/order-master-shift-name-list';
import { DurationService } from '@shared/services/duration.service';

@Component({
  selector: 'app-order-details-form',
  templateUrl: './order-details-form.component.html',
  styleUrls: ['./order-details-form.component.scss'],
  providers: [MaskedDateTimeService],
})
export class OrderDetailsFormComponent implements OnInit, OnDestroy {
  @Input() isActive = false;
  @Input('disableOrderType') set disableOrderType(value: boolean) {
    if (value) {
      this.orderTypeForm.controls['orderType'].disable();
    }
  }

  @Output() orderTypeChanged = new EventEmitter<OrderType>();

  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public jobDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public workLocationForm: FormGroup;
  public specialProject: FormGroup;

  public contactDetailsFormArray: FormArray;
  public workLocationsFormArray: FormArray;

  public isEditContactTitle: boolean[] = [];
  public contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;

  public isJobEndDateControlEnabled = false;
  public agencyControlEnabled = false;

  public orderStatus = 'Incomplete';
  public order: Order | null;

  public today = new Date();
  public defaultMaxTime = new Date();
  public defaultMinTime = new Date();

  public maxTime = this.defaultMaxTime;
  public minTime = this.defaultMinTime;

  public documents: Blob[] = [];
  public deleteDocumentsGuids: string[] = [];
  public priceUtils = PriceUtils;

  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;

  public orderTypes = [
    { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
    { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
    { id: OrderType.PermPlacement, name: 'Perm. Placement' },
    { id: OrderType.Traveler, name: 'Traveler' },
  ];
  public orderTypesDataSource: { id: number; name: string }[];
  public orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public durations = ORDER_DURATION_LIST;
  public durationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobDistributions = ORDER_JOB_DISTRIBUTION_LIST;
  public jobDistributionFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobClassifications = [
    { id: JobClassification.Alumni, name: 'Alumni' },
    { id: JobClassification.International, name: 'International' },
    { id: JobClassification.Interns, name: 'Interns' },
    { id: JobClassification.Locums, name: 'Locums' },
    { id: JobClassification.Students, name: 'Students' },
    { id: JobClassification.Volunteers, name: 'Volunteers' },
  ];

  public masterShiftNames = ORDER_MASTER_SHIFT_NAME_LIST;

  public masterShiftFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobClassificationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public reasonForRequisitionFields: FieldSettingsModel = { text: 'reason', value: 'id' };

  public isSpecialProjectFieldsRequired: boolean;
  public settings: { [key in SettingsKeys]?: OrganizationSettingsGet };
  public SettingsKeys = SettingsKeys;

  @Select(OrderManagementContentState.selectedOrder)
  selectedOrder$: Observable<Order | null>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegion: Region;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocation: Location;

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  isDepartmentsDropDownEnabled: boolean = false;
  departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  selectedDepartment: Department;

  @Select(OrganizationManagementState.masterSkillsByOrganization)
  skills$: Observable<MasterSkillByOrganization[]>;
  skillFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedSkills: SkillCategory;

  @Select(OrderManagementContentState.projectSpecialData)
  projectSpecialData$: Observable<ProjectSpecialData>;
  specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
  projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
  poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };

  @Select(OrderManagementContentState.associateAgencies)
  associateAgencies$: Observable<AssociateAgency[]>;
  associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };

  @Select(OrderManagementContentState.organizationStatesWithKeyCode)
  organizationStatesWithKeyCode$: Observable<AssociateAgency[]>;
  organizationStateWithKeyCodeFields: FieldSettingsModel = { text: 'title', value: 'keyCode' };

  @Select(OrderManagementContentState.suggestedDetails)
  suggestedDetails$: Observable<SuggestedDetails | null>;

  @Select(OrderManagementContentState.contactDetails)
  contactDetails$: Observable<Department>;

  @Select(OrganizationManagementState.organizationSettings)
  organizationSettings$: Observable<OrganizationSettingsGet[]>;

  @Select(RejectReasonState.orderRequisition)
  public reasons$: Observable<RejectReasonPage>;

  public isEditMode: boolean;

  private touchedFields: Set<string> = new Set();
  private alreadyShownDialog: boolean = false;
  private unsubscribe$: Subject<void> = new Subject();

  public isPerDiem = false;
  public isPermPlacementOrder = false;

  public commentContainerId: number = 0;
  public orderId: string | null;

  public comments: Comment[] = [];

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private orderManagementService: OrderManagementContentService,
    private commentsService: CommentsService,
    private durationService: DurationService
  ) {
    this.orderTypeForm = this.formBuilder.group({
      orderType: [null, Validators.required],
    });
    this.store.dispatch(new GetOrderRequisitionByPage());
    this.getSettings();
    this.generalInformationForm = this.formBuilder.group(
      {
        title: [null, [Validators.required, Validators.maxLength(50)]],
        regionId: [null, Validators.required],
        locationId: [null, Validators.required],
        departmentId: [null, Validators.required],
        skillId: [null, Validators.required],
        hourlyRate: [null, [Validators.required, Validators.maxLength(10), currencyValidator(1)]],
        openPositions: [null, [Validators.required, Validators.maxLength(10), integerValidator(1)]],
        minYrsRequired: [null, [Validators.maxLength(10), integerValidator(1)]],
        joiningBonus: [null, [Validators.maxLength(10), currencyValidator(1)]],
        compBonus: [null, [Validators.maxLength(10), currencyValidator(1)]],
        duration: [null, Validators.required],
        jobStartDate: [null, Validators.required],
        jobEndDate: [null, Validators.required],
        shift: [null, Validators.required],
        shiftStartTime: [null, Validators.required],
        shiftEndTime: [null, Validators.required],
      },
      { validators: greaterThanValidator('annualSalaryRangeFrom', 'annualSalaryRangeTo') }
    );

    this.orderTypeForm.valueChanges.pipe(takeUntil(this.unsubscribe$), throttleTime(500)).subscribe((val) => {
      this.isPerDiem = val.orderType === OrderType.OpenPerDiem;
      this.isPermPlacementOrder = val.orderType === OrderType.PermPlacement;
      this.orderTypeChanged.emit(val.orderType);
      this.store.dispatch(new SetIsDirtyOrderForm(this.orderTypeForm.dirty));

      this.handlePerDiemOrder();
      this.handlePermPlacementOrder();

      Object.keys(this.generalInformationForm.controls).forEach((key: string) => {
        this.generalInformationForm.controls[key].updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
    });

    this.locationIdControl = this.generalInformationForm.get('locationId') as AbstractControl;
    this.departmentIdControl = this.generalInformationForm.get('departmentId') as AbstractControl;

    this.generalInformationForm.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.generalInformationForm.dirty));
    });
    this.jobDistributionForm = this.formBuilder.group({
      jobDistribution: [[], Validators.required],
      agency: [null],
      jobDistributions: [[]],
    });

    this.jobDistributionForm.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.jobDistributionForm.dirty));
    });

    this.jobDescriptionForm = this.formBuilder.group({
      classification: [null],
      onCallRequired: [false],
      asapStart: [false],
      criticalOrder: [false],
      nO_OT: [false],
      jobDescription: ['', Validators.maxLength(4000)],
      unitDescription: ['', Validators.maxLength(500)],
      orderRequisitionReasonId: [null, Validators.required],
      orderRequisitionReasonName: [null],
    });

    this.jobDescriptionForm.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.jobDescriptionForm.dirty));
    });

    this.contactDetailsForm = this.formBuilder.group({
      contactDetails: new FormArray([this.newContactDetailsFormGroup()]),
    });

    this.contactDetailsForm.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.contactDetailsForm.dirty));
    });

    this.contactDetailsFormArray = this.contactDetailsForm.get('contactDetails') as FormArray;

    this.contactDetailsFormArray.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.contactDetailsFormArray.dirty));
    });

    this.workLocationForm = this.formBuilder.group({
      workLocations: new FormArray([this.newWorkLocationFormGroup()]),
    });

    this.workLocationForm.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.workLocationForm.dirty));
    });

    this.workLocationsFormArray = this.workLocationForm.get('workLocations') as FormArray;

    this.workLocationsFormArray.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.workLocationsFormArray.dirty));
    });

    this.specialProject = this.formBuilder.group({
      projectTypeId: [null, this.isSpecialProjectFieldsRequired ? Validators.required : ''],
      projectNameId: [null, this.isSpecialProjectFieldsRequired ? Validators.required : ''],
      poNumberId: [null, this.isSpecialProjectFieldsRequired ? Validators.required : ''],
    });

    this.specialProject.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.specialProject.dirty));
    });

    const orderTypeControl = this.orderTypeForm.get('orderType') as AbstractControl;
    const departmentIdControl = this.generalInformationForm.get('departmentId') as AbstractControl;
    const skillIdControl = this.generalInformationForm.get('skillId') as AbstractControl;
    const durationControl = this.generalInformationForm.get('duration') as AbstractControl;
    const jobStartDateControl = this.generalInformationForm.get('jobStartDate') as AbstractControl;
    const shiftStartTimeControl = this.generalInformationForm.get('shiftStartTime') as AbstractControl;
    const shiftEndTimeControl = this.generalInformationForm.get('shiftEndTime') as AbstractControl;
    const jobDistributionControl = this.jobDistributionForm.get('jobDistribution') as AbstractControl;
    const agencyControl = this.jobDistributionForm.get('agency') as AbstractControl;
    const jobDistributionsControl = this.jobDistributionForm.get('jobDistributions') as AbstractControl;

    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((departmentId: number) => {
      if (!departmentId || this.isEditMode) {
        return;
      }
      this.store.dispatch(new GetContactDetails(departmentId));
    });

    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((locationId: number) => {
      if (!locationId || this.isEditMode) {
        return;
      }
      this.store.dispatch(new GetSuggestedDetails(locationId));
    });

    combineLatest([orderTypeControl.valueChanges, departmentIdControl.valueChanges, skillIdControl.valueChanges])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([orderType, departmentId, skillId]) => {
        if (isNaN(parseInt(orderType)) || !departmentId || !skillId) {
          return;
        }
        if (!this.isEditMode) {
          this.populateHourlyRateField(orderType, departmentId, skillId);
        }
        this.store.dispatch(new SetPredefinedBillRatesData(orderType, departmentId, skillId));
      });

    combineLatest([departmentIdControl.valueChanges, skillIdControl.valueChanges])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([departmentId, skillId]) => {
        if (!departmentId || !skillId) {
          return;
        }

        this.store.dispatch(new GetPredefinedCredentials(departmentId, skillId));
      });

    durationControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((duration: Duration) => {
      this.isJobEndDateControlEnabled = duration === Duration.Other;

      const jobStartDate = jobStartDateControl.value as Date | null;

      if (!(jobStartDate instanceof Date)) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });

    jobStartDateControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((jobStartDate: Date | null) => {
      const duration = durationControl.value;

      if (
        isNaN(parseInt(duration)) ||
        !(jobStartDate instanceof Date) ||
        orderTypeControl.value === OrderType.PermPlacement
      ) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });

    this.defaultMaxTime.setHours(23, 59, 59);
    this.defaultMinTime.setHours(0, 0, 0);

    shiftEndTimeControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val) => {
      this.maxTime = val || this.defaultMaxTime;
      shiftStartTimeControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    shiftStartTimeControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((val) => {
      this.minTime = val || this.defaultMinTime;
      shiftEndTimeControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    jobDistributionControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$), debounceTime(600))
      .subscribe((jobDistributionIds: JobDistribution[]) => {
        if (jobDistributionIds.includes(JobDistribution.All)) {
          jobDistributionIds = [
            JobDistribution.All,
            JobDistribution.Internal,
            JobDistribution.ExternalTier1,
            JobDistribution.ExternalTier2,
            JobDistribution.ExternalTier3,
          ];

          jobDistributionControl.patchValue(jobDistributionIds, { emitEvent: false });
        }

        this.agencyControlEnabled = jobDistributionIds.includes(JobDistribution.Selected);
        const selectedJobDistributions: JobDistributionModel[] = [];
        if (this.agencyControlEnabled) {
          agencyControl.addValidators(Validators.required);
          const agencyIds = agencyControl.value;
          if (agencyIds) {
            agencyIds.forEach((agencyId: number) => {
              selectedJobDistributions.push({
                id: 0,
                orderId: this.order?.id || 0,
                jobDistributionOption: JobDistribution.Selected,
                agencyId,
              });
            });
          }
        } else {
          agencyControl.removeValidators(Validators.required);
          agencyControl.reset();
        }

        agencyControl.updateValueAndValidity();

        let jobDistributions: JobDistributionModel[] = jobDistributionIds
          .filter((jobDistributionId) => jobDistributionId !== JobDistribution.Selected)
          .map((jobDistributionId) => {
            return {
              id: 0,
              orderId: this.order?.id || 0,
              jobDistributionOption: jobDistributionId,
              agencyId: null,
            };
          });

        jobDistributionsControl.patchValue([...jobDistributions, ...selectedJobDistributions], { emitEvent: false });
      });

    agencyControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((agencyIds: number[] | null) => {
      const jobDistributions = (jobDistributionsControl.value as JobDistributionModel[]).filter((i) => {
        return i.jobDistributionOption !== JobDistribution.Selected;
      });

      if (agencyIds) {
        agencyIds.forEach((agencyId) => {
          jobDistributions.push({
            id: 0,
            orderId: this.order?.id || 0,
            jobDistributionOption: JobDistribution.Selected,
            agencyId,
          });
        });
      }

      jobDistributionsControl.patchValue(jobDistributions, { emitEvent: false });
    });

    shiftStartTimeControl.addValidators(startTimeValidator(this.generalInformationForm, 'shiftEndTime'));
    shiftEndTimeControl.addValidators(endTimeValidator(this.generalInformationForm, 'shiftStartTime'));
  }

  public ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || null;
    this.store.dispatch(new GetRegions());
    this.store.dispatch(new GetMasterSkillsByOrganization());
    this.store.dispatch(new GetProjectSpecialData());
    this.store.dispatch(new GetAssociateAgencies());
    this.store.dispatch(new GetOrganizationStatesWithKeyCode());

    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
      const isEditMode = !!this.orderId;
      if (order && isEditMode) {
        this.isPerDiem = order.orderType === OrderType.OpenPerDiem;
        this.isEditMode = true;
        this.order = order;
        this.commentContainerId = order.commentContainerId as number;
        this.getComments();
        this.populateForms(order);
        this.subscribeForSettings();
      } else if (order?.isTemplate) {
        this.order = order;
        this.populateForms(order);
        this.subscribeForSettings();
      } else {
        this.subscribeForSettings();
        this.isEditMode = false;
        this.order = null;
        this.populateNewOrderForm();
      }
    });

    this.suggestedDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((suggestedDetails) => {
      if (!suggestedDetails) {
        return;
      }

      const { address, state, city, zipCode } = suggestedDetails.workLocation;

      const workLocationsFormArray = this.workLocationForm.controls['workLocations'] as FormArray;
      const firstWorlLocationsControl = workLocationsFormArray.at(0) as FormGroup;

      firstWorlLocationsControl.controls['address'].patchValue(address);
      firstWorlLocationsControl.controls['state'].patchValue(state);
      firstWorlLocationsControl.controls['city'].patchValue(city);
      firstWorlLocationsControl.controls['zipCode'].patchValue(zipCode);
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch([new ClearSelectedOrder(), new ClearSuggestions()]);
  }

  public onRequisitionChange(event: any): void {
    this.jobDescriptionForm.controls['orderRequisitionReasonName'].patchValue(event.itemData.reason);
  }

  private getSettings(): void {
    this.store.dispatch(new GetOrganizationSettings());
  }

  private getComments(): void {
    this.commentsService.getComments(this.commentContainerId, null).subscribe((comments: Comment[]) => {
      this.comments = comments;
    });
  }

  private populateContactDetailsForm(name: string, email: string, mobilePhone: string): void {
    const contactDetailsFormArray = this.contactDetailsForm.controls['contactDetails'] as FormArray;
    const firstContactDetailsControl = contactDetailsFormArray.at(0) as FormGroup;
    firstContactDetailsControl.controls['name'].patchValue(name);
    firstContactDetailsControl.controls['email'].patchValue(email);
    firstContactDetailsControl.controls['mobilePhone'].patchValue(mobilePhone);
  }

  private populateHourlyRateField(orderType: OrderType, departmentId: number, skillId: number): void {
    if (orderType === OrderType.PermPlacement) {
      return;
    }
    this.orderManagementService
      .getRegularLocalBillRate(orderType, departmentId, skillId)
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((billRate) => !!billRate.length)
      )
      .subscribe((billRates: BillRate[]) =>
        this.generalInformationForm.controls['hourlyRate'].patchValue(billRates[0].rateHour.toFixed(2))
      );
  }

  public onRegionDropDownChanged(event: ChangeEventArgs): void {
    const fieldName = 'region';
    this.userEditsOrder(this.isFieldTouched(fieldName));
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.markTouchedField(fieldName);
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
      this.isLocationsDropDownEnabled = true;
      this.resetLocation();
      this.resetDepartment();
    }
  }

  public onLocationDropDownChanged(event: ChangeEventArgs): void {
    const fieldName = 'location';
    this.userEditsOrder(this.isFieldTouched(fieldName));
    this.selectedLocation = event.itemData as Location;
    if (this.selectedLocation?.id) {
      this.markTouchedField(fieldName);
      this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.id));
      this.isDepartmentsDropDownEnabled = true;
      this.resetDepartment();
    }
  }

  public onDepartmentDropDownChanged(event: ChangeEventArgs): void {
    const fieldName = 'department';
    this.userEditsOrder(this.isFieldTouched(fieldName));
    this.selectedDepartment = event.itemData as Department;
    this.markTouchedField(fieldName);
  }

  public onSkillsDropDownChanged(event: ChangeEventArgs): void {
    const fieldName = 'skills';
    this.userEditsOrder(this.isFieldTouched(fieldName));
    this.selectedSkills = event.itemData as SkillCategory;
    this.markTouchedField(fieldName);
  }

  private handlePerDiemOrder(): void {
    if (this.isPerDiem) {
      this.generalInformationForm.controls['hourlyRate'].setValidators(null);
      this.generalInformationForm.controls['openPositions'].setValidators(null);
      this.generalInformationForm.controls['minYrsRequired'].setValidators(null);
      this.generalInformationForm.controls['joiningBonus'].setValidators(null);
      this.generalInformationForm.controls['compBonus'].setValidators(null);
      this.generalInformationForm.controls['duration'].setValidators(null);
      this.generalInformationForm.controls['jobStartDate'].setValidators(null);
      this.generalInformationForm.controls['jobEndDate'].setValidators(null);
      this.generalInformationForm.controls['shift'].setValidators(null);
      this.generalInformationForm.controls['shiftStartTime'].setValidators(null);
      this.generalInformationForm.controls['shiftEndTime'].setValidators(null);
    } else {
      this.generalInformationForm.controls['hourlyRate']?.setValidators([
        Validators.required,
        Validators.maxLength(10),
        currencyValidator(1),
      ]);
      this.generalInformationForm.controls['openPositions'].setValidators([
        Validators.required,
        Validators.maxLength(10),
        integerValidator(1),
      ]);
      this.generalInformationForm.controls['minYrsRequired'].setValidators([
        Validators.maxLength(10),
        integerValidator(1),
      ]);
      this.generalInformationForm.controls['joiningBonus']?.setValidators([
        Validators.maxLength(10),
        currencyValidator(1),
      ]);
      this.generalInformationForm.controls['compBonus']?.setValidators([
        Validators.maxLength(10),
        currencyValidator(1),
      ]);
      this.generalInformationForm.controls['duration']?.setValidators(Validators.required);
      this.generalInformationForm.controls['jobStartDate'].setValidators(Validators.required);
      this.generalInformationForm.controls['jobEndDate']?.setValidators(Validators.required);
      this.generalInformationForm.controls['shift'].setValidators(Validators.required);
      this.generalInformationForm.controls['shiftStartTime'].setValidators(Validators.required);
      this.generalInformationForm.controls['shiftEndTime'].setValidators(Validators.required);
    }
  }

  private userEditsOrder(fieldIsTouched: boolean): void {
    if (!fieldIsTouched && this.isEditMode && !this.alreadyShownDialog) {
      this.alreadyShownDialog = true;
      const message =
        this.orderTypeForm.controls['orderType'].value === OrderType.OpenPerDiem ? ORDER_PER_DIEM_EDITS : ORDER_EDITS;
      this.alertService
        .alert(message, {
          title: 'Warning',
          okButtonClass: 'ok-button',
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe();
    }
  }

  private orderTypeDataSourceHandler(): void {
    if (this.orderId) {
      if (
        this.settings[SettingsKeys.IsReOrder]?.value ||
        (!this.settings[SettingsKeys.IsReOrder]?.value && this.order?.orderType === OrderType.OpenPerDiem)
      ) {
        this.orderTypesDataSource = this.orderTypes;
      } else {
        this.orderTypesDataSource = this.orderTypes.filter((orderType) => orderType.id !== OrderType.OpenPerDiem);
      }
    } else {
      if (this.settings[SettingsKeys.IsReOrder]?.value) {
        this.orderTypesDataSource = this.orderTypes;
      } else {
        this.orderTypesDataSource = this.orderTypes.filter((orderType) => orderType.id !== OrderType.OpenPerDiem);
      }
    }
  }

  private subscribeForSettings(): void {
    this.organizationSettings$.pipe(takeUntil(this.unsubscribe$), filter(settings => !!settings.length)).subscribe((settings) => {
      this.settings = SettingsHelper.mapSettings(settings);
      this.isSpecialProjectFieldsRequired = this.settings[SettingsKeys.MandatorySpecialProjectDetails]?.value;
      this.orderTypeDataSourceHandler();
      if (this.specialProject != null) {
        if (this.isSpecialProjectFieldsRequired) {
          this.specialProject.controls['projectTypeId'].setValidators(Validators.required);
          this.specialProject.controls['projectNameId'].setValidators(Validators.required);
          this.specialProject.controls['poNumberId'].setValidators(Validators.required);
        } else {
          this.specialProject.controls['projectTypeId'].clearValidators();
          this.specialProject.controls['projectNameId'].clearValidators();
          this.specialProject.controls['poNumberId'].clearValidators();
        }
        this.specialProject.controls['projectTypeId'].updateValueAndValidity();
        this.specialProject.controls['projectNameId'].updateValueAndValidity();
        this.specialProject.controls['poNumberId'].updateValueAndValidity();
      }
    });
  }

  private isFieldTouched(field: string): boolean {
    return this.touchedFields.has(field);
  }

  private markTouchedField(field: string) {
    this.touchedFields.add(field);
  }

  public addContact(): void {
    this.createContactForm();
  }

  public removeContact(index: number): void {
    const isPrimaryContact = this.contactDetailsFormArray.controls[index].get('isPrimaryContact')?.value;
    this.isEditContactTitle.splice(index, 1);
    this.contactDetailsFormArray.removeAt(index);

    if (isPrimaryContact) {
      this.setDefaultPrimaryContact();
    }
  }

  private setDefaultPrimaryContact(): void {
    this.contactDetailsFormArray.controls[0].get('isPrimaryContact')?.patchValue(true);
  }

  public editContactTitleHandler(i: number): void {
    this.isEditContactTitle[i] = !this.isEditContactTitle[i];
  }

  public addWorkLocation(): void {
    this.createWorkLocationForm();
  }

  public removeWorkLocation(index: number): void {
    this.workLocationsFormArray.removeAt(index);
  }

  public onDocumentsSelected(documents: Blob[]): void {
    this.documents = documents;
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public onDocumentDeleted(document: Document): void {
    this.deleteDocumentsGuids.push(document.documentId);
    this.store.dispatch(new SetIsDirtyOrderForm(true));
  }

  public setPriceMask(controlName: string, e: FocusEvent): void {
    const input = e.target as HTMLInputElement;
    if (!input.value.length) {
      this.generalInformationForm.get(controlName)?.patchValue(`.00`, { emitEvent: false });
      setTimeout(() => input.setSelectionRange(0, 0));
    }
  }

  public setTwoDecimals(controlName: string, e: FocusEvent): void {
    const input = e.target as HTMLInputElement;
    const inputValue = input.value ? String(input.value) : '';
    const integerLength = inputValue.split('.')[0].length;
    let zerosCount = 2;

    if (integerLength > 8 && integerLength < 10) {
      zerosCount = 1;
    } else if (integerLength > 9) {
      zerosCount = 0;
    }

    const value = Number(inputValue).toFixed(Math.max(inputValue.split('.')[1]?.length, zerosCount) || zerosCount);
    this.generalInformationForm.get(controlName)?.patchValue(value, { emitEvent: false });
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

  private populatePermPlacementControls(order: Order): void {
    this.handlePermPlacementOrder();

    if (this.isPermPlacementOrder)
      this.generalInformationForm.patchValue({
        orderPlacementFee: order?.orderPlacementFee,
        annualSalaryRangeFrom: order?.annualSalaryRangeFrom,
        annualSalaryRangeTo: order?.annualSalaryRangeTo,
      });
  }

  private removePermPlacementControls(controls: string[]): void {
    controls.forEach((control: string) => {
      this.generalInformationForm.contains(control) &&
        this.generalInformationForm.removeControl(control, { emitEvent: false });
    });
  }

  private removeValidators(controls: string[]): void {
    controls.forEach((controlName: string) => {
      if (this.generalInformationForm.contains(controlName)) {
        const control = this.generalInformationForm.get(controlName);
        control?.clearValidators();
        control?.updateValueAndValidity();
      }
    });
  }

  private addPermPlacementControls(controlNames: string[]): void {
    controlNames.forEach((controlName: string) => {
      const formControl = this.formBuilder.control(null, [
        Validators.required,
        Validators.maxLength(10),
        currencyValidator(1),
      ]);
      this.generalInformationForm.addControl(controlName, formControl, { emitEvent: false });
    });
  }

  private populateForms(order: Order): void {
    this.isPermPlacementOrder = order.orderType === OrderType.PermPlacement;
    this.orderTypeChanged.emit(order.orderType);

    const hourlyRate = order.hourlyRate ? parseFloat(order.hourlyRate.toString()).toFixed(2) : '';
    const joiningBonus = order.joiningBonus ? parseFloat(order.joiningBonus.toString()).toFixed(2) : '';
    const compBonus = order.compBonus ? parseFloat(order.compBonus.toString()).toFixed(2) : '';

    this.orderStatus = order.statusText;
    this.orderTypeForm.controls['orderType'].patchValue(order.orderType);
    this.generalInformationForm.controls['title'].patchValue(order.title);

    this.skills$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.generalInformationForm.controls['skillId'].patchValue(order.skillId));

    this.generalInformationForm.controls['shift'].patchValue(order.shift, { emitEvent: false });

    this.regions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.generalInformationForm.controls['regionId'].patchValue(order.regionId));

    this.generalInformationForm.controls['hourlyRate'].patchValue(hourlyRate);
    this.generalInformationForm.controls['openPositions'].patchValue(order.openPositions);
    this.generalInformationForm.controls['minYrsRequired'].patchValue(order.minYrsRequired);
    this.generalInformationForm.controls['joiningBonus'].patchValue(joiningBonus);
    this.generalInformationForm.controls['compBonus'].patchValue(compBonus);
    this.generalInformationForm.controls['duration'].patchValue(order.duration);
    this.generalInformationForm.controls['shiftStartTime'].patchValue(order.shiftStartTime);
    this.generalInformationForm.controls['shiftEndTime'].patchValue(order.shiftEndTime);

    this.populatePermPlacementControls(order);

    this.projectSpecialData$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.specialProject.controls['projectTypeId'].patchValue(order.projectTypeId);
      this.specialProject.controls['projectNameId'].patchValue(order.projectNameId);
      this.specialProject.controls['poNumberId'].patchValue(order.poNumberId);
    });

    if (order.regionId) {
      this.store
        .dispatch(new GetLocationsByRegionId(order.regionId))
        .pipe(take(1))
        .subscribe(() => {
          this.generalInformationForm.controls['locationId'].patchValue(order.locationId);
        });
    }

    if (order.locationId) {
      this.store
        .dispatch(new GetDepartmentsByLocationId(order.locationId))
        .pipe(take(1))
        .subscribe(() => {
          this.generalInformationForm.controls['departmentId'].patchValue(order.departmentId);
        });
    }

    if (order.jobStartDate) {
      this.generalInformationForm.controls['jobStartDate'].patchValue(new Date(order.jobStartDate));
    }

    if (order.jobEndDate) {
      this.generalInformationForm.controls['jobEndDate'].patchValue(new Date(order.jobEndDate));
    }

    const jobDistributionValues = order.jobDistributions
      .map((jobDistribution) => jobDistribution.jobDistributionOption)
      .filter((value, i, array) => array.indexOf(value) === i); // filter duplicates

    const agencyValues = order.jobDistributions
      .filter((jobDistribution) => jobDistribution.jobDistributionOption === JobDistribution.Selected)
      .map((jobDistribution) => jobDistribution.agencyId);

    this.jobDistributionForm.controls['jobDistribution'].patchValue(jobDistributionValues);

    this.associateAgencies$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((val) => !!val.length)
      )
      .subscribe(() => this.jobDistributionForm.controls['agency'].patchValue(agencyValues));

    this.jobDistributionForm.controls['jobDistributions'].patchValue(order.jobDistributions);
    this.jobDescriptionForm.controls['classification'].patchValue(order.classification);
    this.jobDescriptionForm.controls['onCallRequired'].patchValue(order.onCallRequired);
    this.jobDescriptionForm.controls['asapStart'].patchValue(order.asapStart);
    this.jobDescriptionForm.controls['criticalOrder'].patchValue(order.criticalOrder);
    this.jobDescriptionForm.controls['nO_OT'].patchValue(order.nO_OT);
    this.jobDescriptionForm.controls['jobDescription'].patchValue(order.jobDescription);
    this.jobDescriptionForm.controls['unitDescription'].patchValue(order.unitDescription);
    this.jobDescriptionForm.controls['orderRequisitionReasonId'].patchValue(order.orderRequisitionReasonId);
    this.jobDescriptionForm.controls['orderRequisitionReasonName'].patchValue(order.orderRequisitionReasonName);

    this.contactDetailsFormArray.clear();
    this.workLocationsFormArray.clear();

    if (order.contactDetails.length) {
      order.contactDetails.forEach((contactDetail, i) => {
        this.contactDetailsFormArray.push(this.newContactDetailsFormGroup(contactDetail));
        this.isEditContactTitle[i] =
          Boolean(contactDetail.title) && !this.contactDetailTitles.includes(contactDetail.title);
      });
    } else {
      this.contactDetailsFormArray.push(this.newContactDetailsFormGroup());
    }

    if (order.workLocations.length) {
      order.workLocations.forEach((workLocation) => {
        this.workLocationsFormArray.push(this.newWorkLocationFormGroup(workLocation));
      });
    } else {
      this.workLocationsFormArray.push(this.newWorkLocationFormGroup());
    }
    this.disableFormControls(order);
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    /** Clone Date object to avoid modifying */
    const jobStartDateValue = new Date(jobStartDate.getTime());
    const jobEndDateControl = this.generalInformationForm.get('jobEndDate') as AbstractControl;
    
    const jobEndDate: Date = this.durationService.getEndDate(duration, jobStartDateValue);
    jobEndDateControl.patchValue(jobEndDate);
  }

  private createContactForm(): void {
    this.contactDetailsFormArray.push(this.newContactDetailsFormGroup());
  }

  private createWorkLocationForm(): void {
    this.workLocationsFormArray.push(this.newWorkLocationFormGroup());
  }

  private newContactDetailsFormGroup(orderContactDetails?: OrderContactDetails): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(orderContactDetails?.id || 0),
      name: new FormControl(orderContactDetails?.name || '', [Validators.required, Validators.maxLength(50)]),
      title: new FormControl(orderContactDetails?.title || '', Validators.required),
      email: new FormControl(orderContactDetails?.email || '', [Validators.required, Validators.email]),
      mobilePhone: new FormControl(orderContactDetails?.mobilePhone || '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      isPrimaryContact: new FormControl(
        orderContactDetails ? orderContactDetails.isPrimaryContact : !this.contactDetailsFormArray?.length
      ),
    });
  }

  private newWorkLocationFormGroup(orderWorkLocation?: OrderWorkLocation): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(orderWorkLocation?.id || 0),
      address: new FormControl(orderWorkLocation?.address || '', [Validators.required, Validators.maxLength(100)]),
      state: new FormControl(orderWorkLocation?.state || '', [Validators.required, Validators.maxLength(100)]),
      city: new FormControl(orderWorkLocation?.city || '', [Validators.required, Validators.maxLength(20)]),
      zipCode: new FormControl(orderWorkLocation?.zipCode || '', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]),
    });
  }

  /** During editing order (in progress or filled), some fields have to be disabled */
  private disableFormControls(order: Order): void {
    const controlNames = ['regionId', 'locationId', 'departmentId', 'skillId'];

    if (order.status === OrderStatus.Incomplete || order.status === OrderStatus.Open) {
      controlNames.forEach((control) => this.generalInformationForm.controls[control].enable());
    }
    if (order.status === OrderStatus.InProgress || order.status === OrderStatus.Filled) {
      this.generalInformationForm = disableControls(this.generalInformationForm, controlNames, false);
    }
    if (order.orderType === OrderType.OpenPerDiem && order.status === OrderStatus.Open) {
      this.handlePerDiemOrder();
      this.generalInformationForm = disableControls(this.generalInformationForm, controlNames, false);
    }

    Object.keys(this.generalInformationForm.controls).forEach((key: string) => {
      this.generalInformationForm.controls[key].updateValueAndValidity({ onlySelf: false, emitEvent: false });
    });
  }

  private resetLocation(): void {
    this.locationIdControl.reset(null, { emitValue: false });
    this.locationIdControl.markAsUntouched();
  }

  private resetDepartment(): void {
    this.departmentIdControl.reset(null, { emitValue: false });
    this.departmentIdControl.markAsUntouched();
  }

  private populateNewOrderForm(): void {
    this.orderTypeForm.controls['orderType'].patchValue(OrderType.Traveler);
    this.generalInformationForm.controls['duration'].patchValue(Duration.ThirteenWeeks);
    this.jobDistributionForm.controls['jobDistribution'].patchValue([JobDistribution.All]);

    this.generalInformationForm.controls['departmentId'].valueChanges
    .pipe(
      switchMap(() => {
          return this.contactDetails$;
      }),
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    )
    .subscribe((contactDetails) => {
      const { facilityContact, facilityPhoneNo, facilityEmail } = contactDetails;
      this.populateContactDetailsForm(facilityContact, facilityEmail, facilityPhoneNo);
    });
  }

  public selectPrimaryContact(event: ChangeArgs): void {
    const checkedValue = Number(event.value);
    this.contactDetailsFormArray.controls.forEach((control, index) => {
      const primaryContact = control.get('isPrimaryContact');
      if (primaryContact) {
        index !== checkedValue ? primaryContact.patchValue(false) : primaryContact.patchValue(true);
      }
    });
  }
}
