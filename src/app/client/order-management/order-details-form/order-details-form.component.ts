import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  GetAssociateAgencies,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetMasterShifts,
  GetMasterSkillsByOrganization,
  GetProjectNames,
  GetProjectTypes,
  GetRegions
} from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';

import { Location } from '@shared/models/location.model';
import { Region } from '@shared/models/region.model';
import { Department } from '@shared/models/department.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { MasterShift } from '@shared/models/master-shift.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { ProjectName, ProjectType } from '@shared/models/project.model';

import { OrderType } from '@shared/enums/order-type';
import { Duration } from '@shared/enums/durations';
import { JobDistribution } from '@shared/enums/job-distibution';
import { JobClassification } from '@shared/enums/job-classification';
import { ReasonForRequisition } from '@shared/enums/reason-for-requisition';

import { WorkflowState } from '@organization-management/store/workflow.state';
import { GetWorkflows } from '@organization-management/store/workflow.actions';

import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { integerValidator } from '@shared/validators/integer.validator';
import { currencyValidator } from '@shared/validators/currency.validator';

import { getHoursMinutesSeconds } from '@shared/utils/date-time.utils';
import { ORDER_CONTACT_DETAIL_TITLES } from '@shared/constants';

@Component({
  selector: 'app-order-details-form',
  templateUrl: './order-details-form.component.html',
  styleUrls: ['./order-details-form.component.scss']
})
export class OrderDetailsFormComponent implements OnInit, OnDestroy {
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

  public today = new Date();
  public defaultMaxTime = new Date();
  public defaultMinTime = new Date();

  public maxTime = this.defaultMaxTime;
  public minTime = this.defaultMinTime;

  public documents: Blob[] = [];

  public orderTypes = [
    { id: OrderType.ContractToPerm, name: 'Contract To Perm' },
    { id: OrderType.OpenPerDiem, name: 'Open Per Diem' },
    { id: OrderType.PermPlacement, name: 'Perm. Placement' },
    { id: OrderType.Traveler, name: 'Traveler' }
  ];
  public orderTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };

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

  public orderStatuses = [
    { id: 0, name: 'Incomplete' }
  ];
  public orderStatusFields: FieldSettingsModel = { text: 'name', value: 'id' };

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

  @Select(OrganizationManagementState.projectTypes)
  projectTypes$: Observable<ProjectType[]>;
  projectTypeFields: FieldSettingsModel = { text: 'projectType', value: 'id' };

  @Select(OrganizationManagementState.projectNames)
  projectNames$: Observable<ProjectName[]>;
  projectNameFields: FieldSettingsModel = { text: 'projectName', value: 'id' };

  @Select(OrganizationManagementState.masterShifts)
  masterShifts$: Observable<MasterShift[]>;
  masterShiftFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(OrganizationManagementState.associateAgencies)
  associateAgencies$: Observable<AssociateAgency[]>;
  associateAgencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };

  @Select(WorkflowState.workflows)
  workflows$: Observable<WorkflowWithDetails[]>;
  workflowFields: FieldSettingsModel = { text: 'name', value: 'id' };

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store, private formBuilder: FormBuilder) {
    this.orderTypeStatusForm = this.formBuilder.group({
      orderType: [null, Validators.required]
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
      workflowId: [null]
    });

    const locationIdControl = this.generalInformationForm.get('locationId') as AbstractControl;
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

      if (!location) {
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
      firstWorlLocationsControl.controls['state'].patchValue(location.state);
      firstWorlLocationsControl.controls['city'].patchValue(location.city);
      firstWorlLocationsControl.controls['zipCode'].patchValue(location.zip);
    });

    projectTypeIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectTypeId: number) => {
      const projectTypes = this.store.selectSnapshot(OrganizationManagementState.projectTypes);
      projectTypeControl.patchValue(projectTypes.find(i => i.id === projectTypeId)?.projectType);
    });

    projectTypeControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectType: string) => {
      if (projectType) {
        projectTypeIdControl.removeValidators(Validators.required);
      } else {
        projectTypeIdControl.addValidators(Validators.required);
      }

      projectTypeIdControl.updateValueAndValidity({ emitEvent: false });

      const projectTypes = this.store.selectSnapshot(OrganizationManagementState.projectTypes);
      const matchedProjectType = projectTypes.find(i => i.projectType.toLowerCase() === projectType.toLowerCase());

      projectTypeIdControl.patchValue(matchedProjectType?.id || null, { emitEvent: false });

      if (matchedProjectType) {
        projectTypeControl.patchValue(matchedProjectType.projectType, { emitEvent: false });
      }
    });

    projectNameIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectNameId: number) => {
      const projectNames = this.store.selectSnapshot(OrganizationManagementState.projectNames);
      projectNameControl.patchValue(projectNames.find(i => i.id === projectNameId)?.projectName);
    });

    projectNameControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((projectName: string) => {
      if (projectName) {
        projectNameIdControl.removeValidators(Validators.required);
      } else {
        projectNameIdControl.addValidators(Validators.required);
      }

      projectNameIdControl.updateValueAndValidity({ emitEvent: false });

      const projectNames = this.store.selectSnapshot(OrganizationManagementState.projectNames);
      const matchedProjectName = projectNames.find(i => i.projectName.toLowerCase() === projectName.toLowerCase());

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
      const masterShifts = this.store.selectSnapshot(OrganizationManagementState.masterShifts);
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
            orderId: 0,
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
            orderId: 0,
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

  ngOnInit(): void {
    this.store.dispatch(new GetRegions());
    this.store.dispatch(new GetMasterSkillsByOrganization());
    this.store.dispatch(new GetProjectNames());
    this.store.dispatch(new GetProjectTypes());
    this.store.dispatch(new GetMasterShifts());
    this.store.dispatch(new GetAssociateAgencies());
    this.store.dispatch(new GetWorkflows());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onRegionDropDownChanged(event: ChangeEventArgs): void {
    this.selectedRegion = event.itemData as Region;
    if (this.selectedRegion.id) {
      this.store.dispatch(new GetLocationsByRegionId(this.selectedRegion.id));
      this.isLocationsDropDownEnabled = true;
    }
  }

  public onLocationDropDownChanged(event: ChangeEventArgs): void {
    this.selectedLocation = event.itemData as Location;
    if (this.selectedLocation?.id) {
      this.store.dispatch(new GetDepartmentsByLocationId(this.selectedLocation.id));
      this.isDepartmentsDropDownEnabled = true;
    }
  }

  public onDepartmentDropDownChanged(event: ChangeEventArgs): void {
    this.selectedDepartment = event.itemData as Department;
  }

  public editProjectTypeHandler(): void {
    this.isEditProjectType = !this.isEditProjectType;
  }

  public editProjectNameHandler(): void {
    this.isEditProjectName = !this.isEditProjectName;
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

  private newContactDetailsFormGroup(): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(0),
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      title: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern(/^\S+@\S+\.\S+$/)]),
      mobilePhone: new FormControl('', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)])
    });
  }

  private newWorkLocationFormGroup(): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(0),
      address: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      state: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      city: new FormControl('', [Validators.required, Validators.maxLength(20)]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern(/^[0-9]+$/)])
    });
  }
}
