import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { combineLatest, debounceTime, filter, Observable, Subject, take, takeUntil, throttleTime } from 'rxjs';

import { ChangeEventArgs, DropDownListComponent, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetMasterSkillsByOrganization,
  GetRegions,
} from '@organization-management/store/organization-management.actions';
import {
  ClearSelectedOrder,
  ClearSuggestions,
  GetAssociateAgencies,
  GetContactDetails,
  GetMasterShifts,
  GetOrganizationStatesWithKeyCode,
  GetProjectSpecialData,
  GetRegularLocalBillRate,
  GetSuggestedDetails,
  GetWorkflows,
  SetIsDirtyOrderForm,
  SetPredefinedBillRatesData,
} from '@client/store/order-managment-content.actions';

import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import { Department } from '@shared/models/department.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { MasterShift } from '@shared/models/master-shift.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
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
import { ReasonForRequisitionList } from '@shared/models/reason-for-requisition-list';
import { Comment } from '@shared/models/comment.model';
import { MasterShiftName } from '@shared/enums/master-shifts-id.enum';

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

  @ViewChild('workflowDropdown')
  public workflowDropdown: DropDownListComponent;

  public orderTypeForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public jobDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public workLocationForm: FormGroup;
  public workflowForm: FormGroup;
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
  public orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public durations = [
    { id: Duration.TwelveWeeks, name: '12 Weeks' },
    { id: Duration.ThirteenWeeks, name: '13 Weeks' },
    { id: Duration.TwentySixWeeks, name: '26 Weeks' },
    { id: Duration.Month, name: 'Month' },
    { id: Duration.Year, name: 'Year' },
    { id: Duration.NinetyDays, name: '90 Days' },
    { id: Duration.Other, name: 'Other' },
  ];
  public durationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobDistributions = [
    { id: JobDistribution.All, name: 'All' },
    { id: JobDistribution.Internal, name: 'Internal' },
    { id: JobDistribution.ExternalTier1, name: 'External Tier 1' },
    { id: JobDistribution.ExternalTier2, name: 'External Tier 2' },
    { id: JobDistribution.ExternalTier3, name: 'External Tier 3' },
    { id: JobDistribution.Selected, name: 'Selected' },
  ];
  public jobDistributionFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobClassifications = [
    { id: JobClassification.Alumni, name: 'Alumni' },
    { id: JobClassification.International, name: 'International' },
    { id: JobClassification.Interns, name: 'Interns' },
    { id: JobClassification.Locums, name: 'Locums' },
    { id: JobClassification.Students, name: 'Students' },
    { id: JobClassification.Volunteers, name: 'Volunteers' },
  ];

  public masterShiftNames = [
    { id: MasterShiftName.Day, name: 'Day' },
    { id: MasterShiftName.Evening, name: 'Evening' },
    { id: MasterShiftName.Night, name: 'Night' },
    { id: MasterShiftName.Rotating, name: 'Rotating' },
  ];

  public jobClassificationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public reasonsForRequisition = ReasonForRequisitionList;
  public reasonForRequisitionFields: FieldSettingsModel = { text: 'name', value: 'id' };

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
  reasonsForRequestFields: FieldSettingsModel = { text: 'reasonForRequest', value: 'id' };
  specialProjectCategoriesFields: FieldSettingsModel = { text: 'projectType', value: 'id' };
  projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };
  poNumberFields: FieldSettingsModel = { text: 'poNumber', value: 'id' };

  @Select(OrderManagementContentState.masterShifts)
  masterShifts$: Observable<MasterShift[]>;
  masterShiftFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrderManagementContentState.associateAgencies)
  associateAgencies$: Observable<AssociateAgency[]>;
  associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };

  @Select(OrderManagementContentState.organizationStatesWithKeyCode)
  organizationStatesWithKeyCode$: Observable<AssociateAgency[]>;
  organizationStateWithKeyCodeFields: FieldSettingsModel = { text: 'title', value: 'keyCode' };

  @Select(OrderManagementContentState.suggestedDetails)
  suggestedDetails$: Observable<SuggestedDetails | null>;

  @Select(OrderManagementContentState.workflows)
  workflows$: Observable<WorkflowByDepartmentAndSkill[]>;
  workflowFields: FieldSettingsModel = { text: 'workflowGroupName', value: 'workflowGroupId' };

  @Select(OrderManagementContentState.contactDetails)
  contactDetails$: Observable<Department>;

  @Select(OrderManagementContentState.regularLocalBillRate)
  regularLocalBillRate$: Observable<any>;

  private isEditMode: boolean;

  private touchedFields: Set<string> = new Set();
  private alreadyShownDialog: boolean = false;
  private unsubscribe$: Subject<void> = new Subject();

  public isPerDiem = false;
  public isPermPlacementOrder = false;

  public comments: Comment[] = [] /*[ // TODO: Mocked data, remove after BE
    {
      id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet', isExternal: true, creationDate: new Date()
    },
    {
      id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date()
    },
    {
      id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date()
    },
    {
      id: 0, text: 'Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: false, creationDate: new Date()
    },
    {
      id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment', isExternal: true, creationDate: new Date()
    },
    {
      id: 0, text: '500 chars comment Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second linecomment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: false, creationDate: new Date()
    },
    {
      id: 0, text: 'short', isExternal: false, creationDate: new Date()
    },
    {
      id: 0, text: 'Some Text', isExternal: true, creationDate: new Date()
    },
    {
      id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date()
    },
    {
      id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date()
    },
  ];*/

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.orderTypeForm = this.formBuilder.group({
      orderType: [null, Validators.required],
    });

    this.generalInformationForm = this.formBuilder.group({
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
      shiftRequirementId: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
    });

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
      classification: [null, Validators.required],
      onCallRequired: [false],
      asapStart: [false],
      criticalOrder: [false],
      nO_OT: [false],
      jobDescription: ['', Validators.maxLength(500)],
      unitDescription: ['', Validators.maxLength(500)],
      reasonForRequisition: [null, Validators.required],
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

    this.workflowForm = this.formBuilder.group({
      workflowId: [null, Validators.required],
    });

    this.workflowForm.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      this.store.dispatch(new SetIsDirtyOrderForm(this.workflowForm.dirty));
    });

    this.specialProject = this.formBuilder.group({
      reasonForRequestId: [null, Validators.required],
      projectTypeId: [null, Validators.required],
      projectNameId: [null, Validators.required],
      poNumberId: [null, Validators.required],
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

        this.store.dispatch(new SetPredefinedBillRatesData(orderType, departmentId, skillId));
      });

    combineLatest([departmentIdControl.valueChanges, skillIdControl.valueChanges])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([departmentId, skillId]) => {
        if (!departmentId || !skillId) {
          return;
        }

        this.store.dispatch(new GetWorkflows(departmentId, skillId));
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

      if (isNaN(parseInt(duration)) || !(jobStartDate instanceof Date)) {
        return;
      }

      this.autoSetupJobEndDateControl(duration, jobStartDate);
    });

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
    this.store.dispatch(new GetRegions());
    this.store.dispatch(new GetMasterSkillsByOrganization());
    this.store.dispatch(new GetProjectSpecialData());
    this.store.dispatch(new GetMasterShifts());
    this.store.dispatch(new GetAssociateAgencies());
    this.store.dispatch(new GetOrganizationStatesWithKeyCode());

    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe((order) => {
      const isEditMode = !!this.route.snapshot.paramMap.get('orderId');
      if (order && isEditMode) {
        this.isEditMode = true;
        this.order = order;
        this.populateForms(order);
      } else if (order?.isTemplate) {
        this.order = order;
        this.populateForms(order);
      } else {
        this.isEditMode = false;
        this.order = null;
        this.populateNewOrderForm();
      }
    });

    this.suggestedDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe((suggestedDetails) => {
      if (!suggestedDetails) {
        return;
      }

      const { name, email, mobilePhone } = suggestedDetails.contactDetails;
      const { address, state, city, zipCode } = suggestedDetails.workLocation;

      this.populateContactDetailsForm(name, email, mobilePhone);

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

  private populateContactDetailsForm(name: string, email: string, mobilePhone: string): void {
    const contactDetailsFormArray = this.contactDetailsForm.controls['contactDetails'] as FormArray;
    const firstContactDetailsControl = contactDetailsFormArray.at(0) as FormGroup;
    firstContactDetailsControl.controls['name'].patchValue(name);
    firstContactDetailsControl.controls['email'].patchValue(email);
    firstContactDetailsControl.controls['mobilePhone'].patchValue(mobilePhone);
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
      this.generalInformationForm.controls['shiftRequirementId'].setValidators(null);
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
      this.generalInformationForm.controls['shiftRequirementId'].setValidators(Validators.required);
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
    this.isEditContactTitle.splice(index, 1);
    this.contactDetailsFormArray.removeAt(index);
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
    const isStatusEditOrProgress = order.status === OrderStatus.Filled || order.status === OrderStatus.InProgress;
    this.isPermPlacementOrder = order.orderType === OrderType.PermPlacement;

    const hourlyRate = order.hourlyRate ? parseFloat(order.hourlyRate.toString()).toFixed(2) : '';
    const joiningBonus = order.joiningBonus ? parseFloat(order.joiningBonus.toString()).toFixed(2) : '';
    const compBonus = order.compBonus ? parseFloat(order.compBonus.toString()).toFixed(2) : '';

    this.orderStatus = order.statusText;
    this.orderTypeForm.controls['orderType'].patchValue(order.orderType);
    this.generalInformationForm.controls['title'].patchValue(order.title);

    this.skills$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.generalInformationForm.controls['skillId'].patchValue(order.skillId));

    this.masterShifts$.pipe(takeUntil(this.unsubscribe$)).subscribe(() =>
      this.generalInformationForm.controls['shiftRequirementId'].patchValue(order.shiftRequirementId, {
        emitEvent: false,
      })
    );

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
      this.specialProject.controls['reasonForRequestId'].patchValue(order.reasonForRequestId);
      this.specialProject.controls['poNumberId'].patchValue(order.poNumberId);
    });

    if (order.regionId) {
      this.store
        .dispatch(new GetLocationsByRegionId(order.regionId))
        .pipe(take(1))
        .subscribe(() => {
          this.generalInformationForm.controls['locationId'].patchValue(order.locationId);
          this.isLocationsDropDownEnabled = !isStatusEditOrProgress;
        });
    }

    if (order.locationId) {
      this.store
        .dispatch(new GetDepartmentsByLocationId(order.locationId))
        .pipe(take(1))
        .subscribe(() => {
          this.generalInformationForm.controls['departmentId'].patchValue(order.departmentId);
          this.isDepartmentsDropDownEnabled = !isStatusEditOrProgress;
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
    this.jobDescriptionForm.controls['reasonForRequisition'].patchValue(order.reasonForRequisition);

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

    this.workflows$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.workflowForm.controls['workflowId'].patchValue(order.workflowId);
      this.disableFormControls(order);
      this.workflowForm.controls['workflowId'].updateValueAndValidity();
      this.workflowDropdown.refresh();
    });
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    const jobEndDateControl = this.generalInformationForm.get('jobEndDate') as AbstractControl;

    jobEndDateControl.reset();

    /** Clone Date object to avoid modifying */
    const jobStartDateValue = new Date(jobStartDate.getTime());

    switch (duration) {
      case Duration.TwelveWeeks:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 12 * 7)));
        break;

      case Duration.ThirteenWeeks:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 13 * 7)));
        break;

      case Duration.TwentySixWeeks:
        jobEndDateControl.patchValue(new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 26 * 7)));
        break;

      case Duration.Month:
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
    if (order.status === OrderStatus.InProgress || order.status === OrderStatus.Filled) {
      this.generalInformationForm = disableControls(this.generalInformationForm, ['regionId', 'skillId'], false);
      this.workflowForm.get('workflowId')?.disable({ onlySelf: true });
    }
    if (order.orderType === OrderType.OpenPerDiem && order.status === OrderStatus.Open) {
      this.generalInformationForm = disableControls(
        this.generalInformationForm,
        ['title', 'regionId', 'locationId', 'departmentId', 'skillId'],
        false
      );
      this.workflowForm.get('workflowId')?.disable({ onlySelf: true });
    }
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
    this.store.dispatch(new GetRegularLocalBillRate());

    this.orderTypeForm.controls['orderType'].patchValue(OrderType.Traveler);
    this.generalInformationForm.controls['duration'].patchValue(Duration.ThirteenWeeks);
    this.jobDistributionForm.controls['jobDistribution'].patchValue([JobDistribution.All]);

    this.contactDetails$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((contactDetails) => {
      const { facilityContact, facilityPhoneNo, facilityEmail } = contactDetails;
      this.populateContactDetailsForm(facilityContact, facilityEmail, facilityPhoneNo);
    });

    this.regularLocalBillRate$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((regularLocalBillRate) => {
      this.generalInformationForm.controls['hourlyRate'].patchValue(regularLocalBillRate[0]);
    });
  }
}
