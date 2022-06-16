import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject, takeUntil } from 'rxjs';

import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetMasterSkillsByOrganization,
  GetRegions
} from '@organization-management/store/organization-management.actions';
import {
  GetAssociateAgencies,
  GetMasterShifts,
  GetOrganizationStatesWithKeyCode,
  GetProjectNames,
  GetProjectTypes,
  GetWorkflows,
  SetPredefinedBillRatesData
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
import { ProjectName, ProjectType } from '@shared/models/project.model';
import { WorkflowByDepartmentAndSkill } from '@shared/models/workflow-mapping.model';
import { Order, OrderContactDetails, OrderWorkLocation } from '@shared/models/order-management.model';
import { Document } from '@shared/models/document.model';

import { OrderType } from '@shared/enums/order-type';
import { Duration } from '@shared/enums/durations';
import { JobDistribution } from '@shared/enums/job-distibution';
import { JobClassification } from '@shared/enums/job-classification';
import { ReasonForRequisition } from '@shared/enums/reason-for-requisition';
import { OrderStatus } from '@shared/enums/order-status';

import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { integerValidator } from '@shared/validators/integer.validator';
import { currencyValidator } from '@shared/validators/currency.validator';

import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { ORDER_CONTACT_DETAIL_TITLES, ORDER_EDITS } from '@shared/constants';
import PriceUtils from '@shared/utils/price.utils';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { SkillCategory } from '@shared/models/skill-category.model';
import { OrganizationStateWithKeyCode } from '@shared/models/organization-state-with-key-code.model';

@Component({
  selector: 'app-order-details-form',
  templateUrl: './order-details-form.component.html',
  styleUrls: ['./order-details-form.component.scss'],
  providers: [MaskedDateTimeService]
})
export class OrderDetailsFormComponent implements OnInit, OnDestroy {
  @Input() isActive = false;
  public orderTypeStatusForm: FormGroup;
  public generalInformationForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public jobDescriptionForm: FormGroup;
  public contactDetailsForm: FormGroup;
  public workLocationForm: FormGroup;
  public workflowForm: FormGroup;

  public contactDetailsFormArray: FormArray;
  public workLocationsFormArray: FormArray;

  public isEditContactTitle: boolean[] = [];
  public contactDetailTitles = ORDER_CONTACT_DETAIL_TITLES;

  public isEditProjectType = false;
  public isEditProjectName = false;
  public isJobEndDateControlEnabled = false;
  public agencyControlEnabled = false;

  public isEditMode: boolean;
  public order: Order | null;

  public today = new Date();
  public defaultMaxTime = new Date();
  public defaultMinTime = new Date();

  public maxTime = this.defaultMaxTime;
  public minTime = this.defaultMinTime;

  public documents: Blob[] = [];
  public deleteDocumentsGuids: string[] = [];
  public priceUtils = PriceUtils;

  public orderTypes = [
    { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
    { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
    { id: OrderType.PermPlacement, name: 'Perm. Placement' },
    { id: OrderType.Traveler, name: 'Traveler' }
  ];
  public orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public orderStatuses = [
    { id: OrderStatus.Incomplete, name: 'Incomplete' },
    { id: OrderStatus.PreOpen, name: 'Pre Open' },
    { id: OrderStatus.Open, name: 'Open' },
    { id: OrderStatus.InProgress, name: 'In Progress' },
    { id: OrderStatus.InProgressOfferPending, name: 'In Progress Offer Pending' },
    { id: OrderStatus.InProgressOfferAccepted, name: 'In Progress Offer Accepted' },
    { id: OrderStatus.Filled, name: 'Filled' },
    { id: OrderStatus.Closed, name: 'Closed' }
  ];
  public orderStatusFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public durations = [
    { id: Duration.TwelveWeeks, name: '12 Weeks' },
    { id: Duration.ThirteenWeeks, name: '13 Weeks' },
    { id: Duration.TwentySixWeeks, name: '26 Weeks' },
    { id: Duration.Month, name: 'Month' },
    { id: Duration.Year, name: 'Year' },
    { id: Duration.NinetyDays, name: '90 Days' },
    { id: Duration.Other, name: 'Other' }
  ];
  public durationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobDistributions = [
    { id: JobDistribution.All, name: 'All' },
    { id: JobDistribution.Internal, name: 'Internal' },
    { id: JobDistribution.ExternalTier1, name: 'External Tier 1' },
    { id: JobDistribution.ExternalTier2, name: 'External Tier 2' },
    { id: JobDistribution.ExternalTier3, name: 'External Tier 3' },
    { id: JobDistribution.Selected, name: 'Selected' }
  ];
  public jobDistributionFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public jobClassifications = [
    { id: JobClassification.Alumni, name: 'Alumni' },
    { id: JobClassification.International, name: 'International' },
    { id: JobClassification.Interns, name: 'Interns' },
    { id: JobClassification.Locums, name: 'Locums' },
    { id: JobClassification.Students, name: 'Students' },
    { id: JobClassification.Volunteers, name: 'Volunteers' }
  ];
  public jobClassificationFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public reasonsForRequisition = [
    { id: ReasonForRequisition.FmlaLoa, name: 'FMLA/LOA' },
    { id: ReasonForRequisition.OpenPositions, name: 'Open Positions' },
    { id: ReasonForRequisition.Orientation, name: 'Orientation' },
    { id: ReasonForRequisition.Other, name: 'Other' },
    { id: ReasonForRequisition.Pto, name: 'PTO' },
    { id: ReasonForRequisition.ReplaceAgency, name: 'Replace Agency' }
  ];
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

  @Select(OrderManagementContentState.projectTypes)
  projectTypes$: Observable<ProjectType[]>;
  projectTypeFields: FieldSettingsModel = { text: 'projectType', value: 'id' };

  @Select(OrderManagementContentState.projectNames)
  projectNames$: Observable<ProjectName[]>;
  projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };

  @Select(OrderManagementContentState.masterShifts)
  masterShifts$: Observable<MasterShift[]>;
  masterShiftFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrderManagementContentState.associateAgencies)
  associateAgencies$: Observable<AssociateAgency[]>;
  associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };

  @Select(OrderManagementContentState.organizationStatesWithKeyCode)
  organizationStatesWithKeyCode$: Observable<AssociateAgency[]>;
  organizationStateWithKeyCodeFields: FieldSettingsModel = { text: 'title', value: 'keyCode' };

  @Select(OrderManagementContentState.workflows)
  workflows$: Observable<WorkflowByDepartmentAndSkill[]>;
  workflowFields: FieldSettingsModel = { text: 'workflowGroupName', value: 'workflowGroupId' };

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private formBuilder: FormBuilder, private route: ActivatedRoute) {
    this.orderTypeStatusForm = this.formBuilder.group({
      orderType: [null, Validators.required],
      status: [OrderStatus.Incomplete]
    });

    this.generalInformationForm = this.formBuilder.group({
      title: [null, [Validators.required, Validators.maxLength(50)]],
      regionId: [null, Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      skillId: [null, Validators.required],
      projectTypeId: [null, Validators.required],
      projectType: [null, Validators.required],
      projectNameId: [null, Validators.required],
      projectName: [null, Validators.required],
      hourlyRate: [null, [Validators.required, Validators.maxLength(11), currencyValidator(1)]],
      openPositions: [null, [Validators.required, Validators.maxLength(10), integerValidator(1)]],
      minYrsRequired: [null, [Validators.maxLength(10), integerValidator(1)]],
      joiningBonus: [null, [Validators.maxLength(11), currencyValidator(1)]],
      compBonus: [null, [Validators.maxLength(11), currencyValidator(1)]],
      duration: [null, Validators.required],
      jobStartDate: [null, Validators.required],
      jobEndDate: [null, Validators.required],
      shiftRequirementId: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required]
    });

    this.jobDistributionForm = this.formBuilder.group({
      jobDistribution: [[], Validators.required],
      agency: [null],
      jobDistributions: [[]]
    });

    this.jobDescriptionForm = this.formBuilder.group({
      classification: [null, Validators.required],
      onCallRequired: [false],
      asapStart: [false],
      criticalOrder: [false],
      nO_OT: [false],
      jobDescription: ['', Validators.maxLength(500)],
      unitDescription: ['', Validators.maxLength(500)],
      reasonForRequisition: [null, Validators.required]
    });

    this.contactDetailsForm = this.formBuilder.group({
      contactDetails: new FormArray([this.newContactDetailsFormGroup()])
    });

    this.contactDetailsFormArray = this.contactDetailsForm.get('contactDetails') as FormArray;

    this.workLocationForm = this.formBuilder.group({
      workLocations: new FormArray([this.newWorkLocationFormGroup()])
    });

    this.workLocationsFormArray = this.workLocationForm.get('workLocations') as FormArray;

    this.workflowForm = this.formBuilder.group({
      workflowId: [null, Validators.required]
    });

    const orderTypeControl = this.orderTypeStatusForm.get('orderType') as AbstractControl;
    const locationIdControl = this.generalInformationForm.get('locationId') as AbstractControl;
    const departmentIdControl = this.generalInformationForm.get('departmentId') as AbstractControl;
    const skillIdControl = this.generalInformationForm.get('skillId') as AbstractControl;
    const projectTypeIdControl = this.generalInformationForm.get('projectTypeId') as AbstractControl;
    const projectTypeControl = this.generalInformationForm.get('projectType') as AbstractControl;
    const projectNameIdControl = this.generalInformationForm.get('projectNameId') as AbstractControl;
    const projectNameControl = this.generalInformationForm.get('projectName') as AbstractControl;
    const durationControl = this.generalInformationForm.get('duration') as AbstractControl;
    const jobStartDateControl = this.generalInformationForm.get('jobStartDate') as AbstractControl;
    const shiftRequirementIdControl = this.generalInformationForm.get('shiftRequirementId') as AbstractControl;
    const shiftStartTimeControl = this.generalInformationForm.get('shiftStartTime') as AbstractControl;
    const shiftEndTimeControl = this.generalInformationForm.get('shiftEndTime') as AbstractControl;
    const jobDistributionControl = this.jobDistributionForm.get('jobDistribution') as AbstractControl;
    const agencyControl = this.jobDistributionForm.get('agency') as AbstractControl;
    const jobDistributionsControl = this.jobDistributionForm.get('jobDistributions') as AbstractControl;

    locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((locationId: number) => {
      const locations = this.store.selectSnapshot(OrganizationManagementState.locationsByRegionId);
      const location = locations.find(i => i.id === locationId);

      if (!location || this.isEditMode) {
        return;
      }

      const contactDetailsFormArray = this.contactDetailsForm.controls['contactDetails'] as FormArray;
      const firstContactDetailsControl = contactDetailsFormArray.at(0) as FormGroup;

      firstContactDetailsControl.controls['name'].patchValue(location.contactPerson);
      firstContactDetailsControl.controls['email'].patchValue(location.contactEmail);
      firstContactDetailsControl.controls['mobilePhone'].patchValue(location.phoneNumber);

      const workLocationsFormArray = this.workLocationForm.controls['workLocations'] as FormArray;
      const firstWorlLocationsControl = workLocationsFormArray.at(0) as FormGroup;

      firstWorlLocationsControl.controls['address'].patchValue(location.address1);
      firstWorlLocationsControl.controls['state'].patchValue(this.findTargetState(location));
      firstWorlLocationsControl.controls['city'].patchValue(location.city);
      firstWorlLocationsControl.controls['zipCode'].patchValue(location.zip);
    });

    combineLatest([
      orderTypeControl.valueChanges,
      departmentIdControl.valueChanges,
      skillIdControl.valueChanges
    ]).pipe(takeUntil(this.unsubscribe$)).subscribe(([orderType, departmentId, skillId]) => {
      if (isNaN(parseInt(orderType)) || !departmentId || !skillId) {
        return;
      }

      this.store.dispatch(new SetPredefinedBillRatesData(orderType, departmentId, skillId));
    });

    combineLatest([
      departmentIdControl.valueChanges,
      skillIdControl.valueChanges
    ]).pipe(takeUntil(this.unsubscribe$)).subscribe(([departmentId, skillId]) => {
      if (!departmentId || !skillId) {
        return;
      }

      this.store.dispatch(new GetWorkflows(departmentId, skillId));
    });

    projectTypeIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectTypeId: number) => {
      const projectTypes = this.store.selectSnapshot(OrderManagementContentState.projectTypes);
      projectTypeControl.patchValue(projectTypes.find(i => i.id === projectTypeId)?.projectType);
    });

    projectTypeControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectType: string | null) => {
      if (projectType) {
        projectTypeIdControl.removeValidators(Validators.required);
      } else {
        projectTypeIdControl.addValidators(Validators.required);
      }

      projectTypeIdControl.updateValueAndValidity({ emitEvent: false });

      const projectTypes = this.store.selectSnapshot(OrderManagementContentState.projectTypes);
      const matchedProjectType = projectTypes.find(i => i.projectType.toLowerCase() === projectType?.toLowerCase());

      projectTypeIdControl.patchValue(matchedProjectType?.id || null, { emitEvent: false });

      if (matchedProjectType) {
        projectTypeControl.patchValue(matchedProjectType.projectType, { emitEvent: false });
      }
    });

    projectNameIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectNameId: number) => {
      const projectNames = this.store.selectSnapshot(OrderManagementContentState.projectNames);
      projectNameControl.patchValue(projectNames.find(i => i.id === projectNameId)?.projectName);
    });

    projectNameControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectName: string | null) => {
      if (projectName) {
        projectNameIdControl.removeValidators(Validators.required);
      } else {
        projectNameIdControl.addValidators(Validators.required);
      }

      projectNameIdControl.updateValueAndValidity({ emitEvent: false });

      const projectNames = this.store.selectSnapshot(OrderManagementContentState.projectNames);
      const matchedProjectName = projectNames.find(i => i.projectName.toLowerCase() === projectName?.toLowerCase());

      projectNameIdControl.patchValue(matchedProjectName?.id || null, { emitEvent: false });

      if (matchedProjectName) {
        projectNameControl.patchValue(matchedProjectName.projectName, { emitEvent: false });
      }
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

    shiftRequirementIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(shiftId => {
      const masterShifts = this.store.selectSnapshot(OrderManagementContentState.masterShifts);
      const masterShift = masterShifts.find(i => i.id === shiftId);

      if (!masterShift) {
        return;
      }

      let [startH, startM, startS] = getHoursMinutesSeconds(masterShift.startTime);
      let [endH, endM, endS] = getHoursMinutesSeconds(masterShift.endTime);
      let startDate = new Date();
      let endDate = new Date();

      startDate.setHours(startH, startM, startS);
      endDate.setHours(endH, endM, endS);

      this.generalInformationForm.controls['shiftStartTime'].patchValue(startDate);
      this.generalInformationForm.controls['shiftEndTime'].patchValue(endDate);
    });

    shiftEndTimeControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
      this.maxTime = val || this.defaultMaxTime;
      shiftStartTimeControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    shiftStartTimeControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
      this.minTime = val || this.defaultMinTime;
      shiftEndTimeControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    jobDistributionControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((jobDistributionIds: number[]) => {
      this.agencyControlEnabled = jobDistributionIds.includes(JobDistribution.Selected);

      if (this.agencyControlEnabled) {
        agencyControl.addValidators(Validators.required);
      } else {
        agencyControl.removeValidators(Validators.required);
        agencyControl.reset();
      }

      agencyControl.updateValueAndValidity();

      let jobDistributions: JobDistributionModel[] = jobDistributionIds
        .filter(jobDistributionId => jobDistributionId !== JobDistribution.Selected)
        .map(jobDistributionId => {
          return {
            id: 0,
            orderId: this.order?.id || 0,
            jobDistributionOption: jobDistributionId,
            agencyId: null
          };
        });

      jobDistributionsControl.patchValue(jobDistributions, { emitEvent: false });
    });

    agencyControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((agencyIds: number[] | null) => {
      const jobDistributions = (jobDistributionsControl.value as JobDistributionModel[]).filter(i => {
        return i.jobDistributionOption !== JobDistribution.Selected;
      });

      if (agencyIds) {
        agencyIds.forEach(agencyId => {
          jobDistributions.push({
            id: 0,
            orderId: this.order?.id || 0,
            jobDistributionOption: JobDistribution.Selected,
            agencyId
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
    this.store.dispatch(new GetProjectNames());
    this.store.dispatch(new GetProjectTypes());
    this.store.dispatch(new GetMasterShifts());
    this.store.dispatch(new GetAssociateAgencies());
    this.store.dispatch(new GetOrganizationStatesWithKeyCode());

    this.selectedOrder$.pipe(takeUntil(this.unsubscribe$)).subscribe(order => {
      const isEditMode = !!this.route.snapshot.paramMap.get('orderId');
      if (order && isEditMode) {
        this.isEditMode = true;
        this.order = order;
        this.populateForms(order);
      } else {
        this.isEditMode = false;
        this.order = null;
        //this.resetForms(); TODO: clarify
      }
    })
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.selectedRegion);
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
      this.isLocationsDropDownEnabled = true;
    }
  }

  public onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.selectedLocation);
    this.selectedLocation = event.itemData as Location;
    if (this.selectedLocation?.id) {
      this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.id));
      this.isDepartmentsDropDownEnabled = true;
    }
  }

  public onDepartmentDropDownChanged(event: ChangeEventArgs): void {
    this.userEditsOrder(this.selectedDepartment);
    this.selectedDepartment = event.itemData as Department;
  }

  onSkillsDropDownChanged(event: ChangeEventArgs) {
    this.userEditsOrder(this.selectedSkills);
    this.selectedSkills = event.itemData as SkillCategory;
  }

  private userEditsOrder(selectedItem: Object): void {
    if(!selectedItem) {
      this.store.dispatch(new ShowToast(MessageTypes.Success, ORDER_EDITS))
    }
  }

  public editProjectTypeHandler(): void {
    this.isEditProjectType = !this.isEditProjectType;
    this.generalInformationForm.get('projectTypeId')?.updateValueAndValidity();
    this.generalInformationForm.get('projectTypeId')?.markAllAsTouched();
  }

  public editProjectNameHandler(): void {
    this.isEditProjectName = !this.isEditProjectName;
    this.generalInformationForm.get('projectNameId')?.updateValueAndValidity();
    this.generalInformationForm.get('projectNameId')?.markAllAsTouched();
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
  }

  public onDocumentDeleted(document: Document): void {
    this.deleteDocumentsGuids.push(document.documentId);
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

  private populateForms(order: Order): void {
    this.orderTypeStatusForm.controls['orderType'].patchValue(order.orderType);
    this.orderTypeStatusForm.controls['status'].patchValue(order.status);

    this.generalInformationForm.controls['title'].patchValue(order.title);
    this.generalInformationForm.controls['regionId'].patchValue(order.regionId);
    this.generalInformationForm.controls['locationId'].patchValue(order.locationId);
    this.generalInformationForm.controls['departmentId'].patchValue(order.departmentId);
    this.generalInformationForm.controls['skillId'].patchValue(order.skillId);
    this.generalInformationForm.controls['projectTypeId'].patchValue(order.projectTypeId);
    this.generalInformationForm.controls['projectType'].patchValue(order.projectType);
    this.generalInformationForm.controls['projectNameId'].patchValue(order.projectNameId);
    this.generalInformationForm.controls['projectName'].patchValue(order.projectName);
    this.generalInformationForm.controls['hourlyRate'].patchValue(order.hourlyRate);
    this.generalInformationForm.controls['openPositions'].patchValue(order.openPositions);
    this.generalInformationForm.controls['minYrsRequired'].patchValue(order.minYrsRequired);
    this.generalInformationForm.controls['joiningBonus'].patchValue(order.joiningBonus);
    this.generalInformationForm.controls['compBonus'].patchValue(order.compBonus);
    this.generalInformationForm.controls['duration'].patchValue(order.duration);
    this.generalInformationForm.controls['shiftRequirementId'].patchValue(order.shiftRequirementId);
    this.generalInformationForm.controls['shiftStartTime'].patchValue(order.shiftStartTime);
    this.generalInformationForm.controls['shiftEndTime'].patchValue(order.shiftEndTime);

    if (order.regionId) {
      this.store.dispatch(new GetLocationsByRegionId(order.regionId));
      this.isLocationsDropDownEnabled = true;
    }

    if (order.locationId) {
      this.store.dispatch(new GetDepartmentsByLocationId(order.locationId));
      this.isDepartmentsDropDownEnabled = true;
    }

    if (order.jobStartDate) {
      this.generalInformationForm.controls['jobStartDate'].patchValue(new Date(order.jobStartDate));
    }

    if (order.jobEndDate) {
      this.generalInformationForm.controls['jobEndDate'].patchValue(new Date(order.jobEndDate));
    }

    const jobDistributionValues = order.jobDistributions
      .map(jobDistribution => jobDistribution.jobDistributionOption)
      .filter((value, i, array) => array.indexOf(value) === i); // filter duplicates

    const agencyValues = order.jobDistributions
      .filter(jobDistribution => jobDistribution.jobDistributionOption === JobDistribution.Selected)
      .map(jobDistribution => jobDistribution.agencyId);

    this.jobDistributionForm.controls['jobDistribution'].patchValue(jobDistributionValues);
    this.jobDistributionForm.controls['agency'].patchValue(agencyValues);
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
        this.isEditContactTitle[i] = Boolean(contactDetail.title) && !this.contactDetailTitles.includes(contactDetail.title);
      });
    } else {
      this.contactDetailsFormArray.push(this.newContactDetailsFormGroup());
    }

    if (order.workLocations.length) {
      order.workLocations.forEach(workLocation => {
        this.workLocationsFormArray.push(this.newWorkLocationFormGroup(workLocation));
      });
    } else {
      this.workLocationsFormArray.push(this.newWorkLocationFormGroup());
    }

    this.workflowForm.controls['workflowId'].patchValue(order.workflowId);
  }

  private resetForms(): void {
    this.orderTypeStatusForm.reset();
    this.orderTypeStatusForm.controls['status'].patchValue(-1);

    this.generalInformationForm.reset();
    this.jobDescriptionForm.reset();

    this.contactDetailsFormArray.clear();
    this.workLocationsFormArray.clear();

    this.contactDetailsFormArray.push(this.newContactDetailsFormGroup());
    this.workLocationsFormArray.push(this.newWorkLocationFormGroup());

    this.jobDistributionForm.controls['jobDistribution'].patchValue([]);
    this.jobDistributionForm.controls['agency'].patchValue(null);
    this.jobDistributionForm.controls['jobDistributions'].patchValue([]);

    this.jobDescriptionForm.controls['onCallRequired'].patchValue(false);
    this.jobDescriptionForm.controls['asapStart'].patchValue(false);
    this.jobDescriptionForm.controls['criticalOrder'].patchValue(false);
    this.jobDescriptionForm.controls['nO_OT'].patchValue(false);
  }

  private autoSetupJobEndDateControl(duration: Duration, jobStartDate: Date): void {
    const jobEndDateControl = this.generalInformationForm.get('jobEndDate') as AbstractControl;

    jobEndDateControl.reset();

    /** Clone Date object to avoid modifying */
    const jobStartDateValue = new Date(jobStartDate.getTime());

    switch(duration) {
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
      email: new FormControl(orderContactDetails?.email || '', [Validators.required, Validators.pattern(/^\S+@\S+\.\S+$/)]),
      mobilePhone: new FormControl(orderContactDetails?.mobilePhone || '', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)])
    });
  }

  private newWorkLocationFormGroup(orderWorkLocation?: OrderWorkLocation): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(orderWorkLocation?.id || 0),
      address: new FormControl(orderWorkLocation?.address || '', [Validators.required, Validators.maxLength(100)]),
      state: new FormControl(orderWorkLocation?.state || '', [Validators.required, Validators.maxLength(100)]),
      city: new FormControl(orderWorkLocation?.city || '', [Validators.required, Validators.maxLength(20)]),
      zipCode: new FormControl(orderWorkLocation?.zipCode || '', [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]+$/)])
    });
  }

  private findTargetState(location: Location): string | undefined {
    const states = this.store.selectSnapshot(OrderManagementContentState.organizationStatesWithKeyCode);
    return states.find(({ title }: OrganizationStateWithKeyCode) => title === location.state)?.keyCode;
  }
}
