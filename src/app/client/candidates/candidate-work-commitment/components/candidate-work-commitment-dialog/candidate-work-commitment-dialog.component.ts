import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, Input, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OutsideZone } from '@core/decorators';
import { DateTimeHelper, distinctByKey, groupBy } from '@core/helpers';
import { Select, Store } from '@ngxs/store';
import { WorkCommitmentDetails, WorkCommitmentDetailsGroup, WorkCommitmentOrgHierarchies, WorkCommitmentsPage } from '@organization-management/work-commitment/interfaces';
import { DatepickerComponent } from '@shared/components/form-controls/datepicker/datepicker.component';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { convertHolidaysToDataSource } from '@shared/helpers/dropdown-options.helper';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { addDays } from '@shared/utils/date-time.utils';
import { getAllErrors } from '@shared/utils/error.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { uniq } from 'lodash';
import { catchError, distinctUntilChanged, filter, Observable, Subject, takeUntil, tap } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { CandidateWorkCommitment } from '../../models/candidate-work-commitment.model';
import { CandidateWorkCommitmentService } from '../../services/candidate-work-commitment.service';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { commonRangesValidator } from '@shared/validators/date.validator';

@Component({
  selector: 'app-candidate-work-commitment-dialog',
  templateUrl: './candidate-work-commitment-dialog.component.html',
  styleUrls: ['./candidate-work-commitment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('startDatePicker') startDatePicker: DatepickerComponent;

  @Input() public dialogSubject$: Subject<{ isOpen: boolean, isEdit: boolean, commitment?: CandidateWorkCommitment }>;
  @Input() public refreshSubject$: Subject<void>;
  @Input() set employeeIdVal(value: number | null) {
    if (value) {
      this.employeeId = value;
      this.setWorkCommitmentDataSource();
      this.setHolidayDataSource();
    }
  }

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;

  public title: string;
  public workCommitments: WorkCommitmentDetailsGroup[] = [];
  public allWorkCommitments: WorkCommitmentDetails[] = [];
  public workCommitmentGroup: WorkCommitmentDetailsGroup;
  public selectedRegions: OrganizationRegion[];
  public selectedRegionLocations: OrganizationLocation[];
  public holidays: { id: number, name: number }[] = [];
  public regions: OrganizationRegion[] = [];
  public allRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public selectedLocations: number[] = [];
  public candidateWorkCommitmentForm: FormGroup;
  public employeeId: number;
  public sortOrder = SortOrder;
  public formatPayRate = '#.###';
  public readonly fields = {
    text: 'name',
    value: 'id',
  };

  public readonly numericInputAttributes = { maxLength: '10' };
  public format = '#.#';

  public todayDate = new Date();
  public lastActiveDate: Date | null;
  public selectWorkCommitmentStartDate: Date;
  public minimumDate: Date | undefined;
  public maximumDate: Date | undefined;
  public startDate: Date;
  public showCommonRangesError: boolean = false;


  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private candidateWorkCommitmentService: CandidateWorkCommitmentService,
    private store: Store,
    private confirmService: ConfirmService,
    private candidateService: CandidatesService,
    private ngZone: NgZone,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.todayDate.setHours(0, 0, 0, 0);
    this.subscribeOnDialog();
    this.createForm();
    this.setRegionsLocationsDataSource();
    this.subscribeOnCommitmentDropdownChange();
  }

  public dateValueChange(event: Date): void {
    this.startDate = event;
  }

  private createForm(): void {
    this.candidateWorkCommitmentForm = this.fb.group({
      id: [0],
      employeeId: [this.employeeId],
      workCommitmentIds: [[], Validators.required],
      masterWorkCommitmentId: [null],
      regionIds: [[], Validators.required],
      locationIds: [[], Validators.required],
      startDate: [null, Validators.required],
      endDate: [null],
      jobCode: [null, Validators.required],
      payRate: [null],
      minWorkExperience: [null],
      availRequirement: [null],
      schedulePeriod: [null],
      holiday: [null],
      criticalOrder: [null],
      comment: [null],
    });
  }

  private getCommitmentRegionsFromHierarchy(workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[]): number[] {
    let regions = workCommitmentOrgHierarchies.map((val) => val.regionId);
    regions = uniq(regions);
    return regions;
  }

  private getCommitmentLocationsFromHierarchy(workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[]): number[] {
    let locations = workCommitmentOrgHierarchies.map((val) => val.locationId);
    locations = uniq(locations);
    return locations;
  }

  private setRegionsDataSource(regions: number[]): void {
    this.regions = this.allRegions.filter((region) => regions.indexOf(region.regionId as number) > -1);
  }

  private setLocationsDataSource(locations: OrganizationLocation[]): void {
    this.locations = locations.filter((location) => this.selectedLocations.indexOf(location.locationId as number) > -1);
  }

  private populateRegionsLocations(commitmentGroup: WorkCommitmentDetailsGroup): void {
    const workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[] = [];
    commitmentGroup.items.forEach(item => {
      workCommitmentOrgHierarchies.push(...item.workCommitmentOrgHierarchies);
    });
    const regions = this.getCommitmentRegionsFromHierarchy(workCommitmentOrgHierarchies);
    this.setRegionsDataSource(regions);
  }

  private isEveryValSame(selectedCommitments: WorkCommitmentDetails[], key: keyof WorkCommitmentDetails): boolean {
    return selectedCommitments.every(item => {
      return selectedCommitments[0][key] === item[key];
    });
  }

  private getDatesOverlap(selectedCommitments: WorkCommitmentDetails[]): Date[] | null {
    let start = new Date(selectedCommitments[0].startDate);
    let end = selectedCommitments[0].endDate ? new Date(selectedCommitments[0].endDate) : null;
    let overlap: boolean = true;

    selectedCommitments.forEach(item => {
      const currentStart = new Date(item.startDate);
      const currentEnd = item.endDate ? new Date(item.endDate) : null;
  
      if ((end && currentStart > end) || (end && currentEnd && currentEnd < start)) {
        overlap = false;
      } else {
        start = new Date(Math.max(start.getTime(), currentStart.getTime()));
        if (end === null || currentEnd === null) {
          end = null;
        } else {
          end = new Date(Math.min(end.getTime(), currentEnd.getTime()));
        }
      }
    });

    return overlap ? ([start, end] as Date[]) : null;
  }

  private addValidators(): void {
    this.candidateWorkCommitmentForm.controls['locationIds'].markAsTouched();
    this.candidateWorkCommitmentForm.controls['locationIds'].markAsDirty();
    this.candidateWorkCommitmentForm.controls['locationIds'].addValidators(commonRangesValidator());
    this.candidateWorkCommitmentForm.controls['locationIds'].updateValueAndValidity();
    this.candidateWorkCommitmentForm.controls['regionIds'].markAsTouched();
    this.candidateWorkCommitmentForm.controls['regionIds'].markAsDirty();
    this.candidateWorkCommitmentForm.controls['regionIds'].addValidators(commonRangesValidator());
    this.candidateWorkCommitmentForm.controls['regionIds'].updateValueAndValidity();
  }

  private removeValidators(): void {
    this.candidateWorkCommitmentForm.controls['locationIds'].removeValidators(commonRangesValidator());
    this.candidateWorkCommitmentForm.controls['locationIds'].updateValueAndValidity();
    this.candidateWorkCommitmentForm.controls['regionIds'].removeValidators(commonRangesValidator());
    this.candidateWorkCommitmentForm.controls['regionIds'].updateValueAndValidity();
    this.showCommonRangesError = false;
  }

  private generateGeneralCommitmentModel(workCommitmentIds: number[]): WorkCommitmentDetails {
    const selectedCommitments = this.workCommitmentGroup.items.filter(item => {
      return workCommitmentIds.includes(item.workCommitmentId)
    });
    const commonRange = this.getDatesOverlap(selectedCommitments);
    if (!commonRange) {
      this.showCommonRangesError = true;
      this.addValidators();
    } else {
      this.removeValidators();
    }
    const commitment: WorkCommitmentDetails = {
      availabilityRequirement: this.isEveryValSame(selectedCommitments, 'availabilityRequirement') ? selectedCommitments[0].availabilityRequirement : 0,
      comments: this.isEveryValSame(selectedCommitments, 'comments') ? selectedCommitments[0].comments : '',
      criticalOrder: this.isEveryValSame(selectedCommitments, 'criticalOrder') ? selectedCommitments[0].criticalOrder : 0,
      endDate: commonRange ? commonRange[1].toString() : null,
      holiday: this.isEveryValSame(selectedCommitments, 'holiday') ? selectedCommitments[0].holiday : 0,
      jobCode: this.isEveryValSame(selectedCommitments, 'jobCode') ? selectedCommitments[0].jobCode : '',
      masterWorkCommitmentId: 0,
      masterWorkCommitmentName: '',
      minimumWorkExperience: this.isEveryValSame(selectedCommitments, 'minimumWorkExperience') ? selectedCommitments[0].minimumWorkExperience : 0,
      schedulePeriod: this.isEveryValSame(selectedCommitments, 'schedulePeriod') ? selectedCommitments[0].schedulePeriod : 0,
      skills: [],
      startDate: commonRange ? commonRange[0].toString() : '',
      workCommitmentId: 0,
      workCommitmentOrgHierarchies: [],
      departmentId: 0,
      departmentName: ''
    }
    return commitment;
  }

  
  private setDatesValidation(commitment: WorkCommitmentDetails): void {
    const commitmentEndDate = DateTimeHelper.convertDateToUtc(commitment.endDate as string);
    this.selectWorkCommitmentStartDate = DateTimeHelper.convertDateToUtc(commitment.startDate as string);
    this.minimumDate = this.setMinimumDate();
    this.maximumDate = DateTimeHelper.isDateBefore(this.minimumDate, commitmentEndDate) ? commitmentEndDate : undefined;

    this.setWCStartDate();
  }

  private commitmentGroupHandler(selectedSettings: WorkCommitmentOrgHierarchies[]): void {
    if (selectedSettings.length > 1) {
      // multiple commitments are selected
      const workCommitmentIds = selectedSettings.map(item => item.workCommitmentId);
      this.candidateWorkCommitmentForm.controls['workCommitmentIds'].setValue(workCommitmentIds);
      const commitment = this.generateGeneralCommitmentModel(workCommitmentIds);
      this.setDatesValidation(commitment);
      this.populateFormWithMasterCommitment(commitment);
    } else if (selectedSettings.length === 1) {
      // single commitment is selected
      this.removeValidators();
      const commitment = this.workCommitmentGroup.items.find(item => item.workCommitmentId === selectedSettings[0].workCommitmentId)!;
      this.setDatesValidation(commitment);
      this.populateFormWithMasterCommitment(commitment);
      this.candidateWorkCommitmentForm.controls['workCommitmentIds'].setValue([commitment.workCommitmentId]);
    }
  }

  private populateWorkCommitment(): void {
    if (this.selectedRegions?.length && this.workCommitmentGroup) {
      const workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[] = [];
      this.workCommitmentGroup.items.forEach(item => {
        workCommitmentOrgHierarchies.push(...item.workCommitmentOrgHierarchies);
      });
      
      const selectedHierarchies: WorkCommitmentOrgHierarchies[] = [];
      this.selectedRegionLocations.forEach(location => {
        selectedHierarchies.push(...workCommitmentOrgHierarchies.filter((item => item.locationId === location.id)));
      });
      const selectedSettings = distinctByKey(selectedHierarchies, 'workCommitmentId');
      this.commitmentGroupHandler(selectedSettings);
    }
  }

  private resetForm(): void {
    this.removeValidators();
    this.candidateWorkCommitmentForm.controls['jobCode'].setValue(null);
    this.candidateWorkCommitmentForm.controls['availRequirement'].setValue(null);
    this.candidateWorkCommitmentForm.controls['schedulePeriod'].setValue(null);
    this.candidateWorkCommitmentForm.controls['minWorkExperience'].setValue(null);
    this.candidateWorkCommitmentForm.controls['criticalOrder'].setValue(null);
    this.candidateWorkCommitmentForm.controls['holiday'].setValue(null);
    this.candidateWorkCommitmentForm.controls['comment'].setValue(null);
    this.candidateWorkCommitmentForm.controls['startDate'].setValue(null);
    this.candidateWorkCommitmentForm.controls['startDate'].updateValueAndValidity({ onlySelf: true });
  }

  private populateFormWithMasterCommitment(commitment: WorkCommitmentDetails): void {
    this.candidateWorkCommitmentForm.controls['jobCode'].setValue(commitment.jobCode);
    this.candidateWorkCommitmentForm.controls['availRequirement'].setValue(commitment.availabilityRequirement);
    this.candidateWorkCommitmentForm.controls['schedulePeriod'].setValue(commitment.schedulePeriod);
    this.candidateWorkCommitmentForm.controls['minWorkExperience'].setValue(commitment.minimumWorkExperience);
    this.candidateWorkCommitmentForm.controls['criticalOrder'].setValue(commitment.criticalOrder);
    this.candidateWorkCommitmentForm.controls['holiday'].setValue(commitment.holiday);
    this.candidateWorkCommitmentForm.controls['comment'].setValue(commitment.comments);
    this.candidateWorkCommitmentForm.controls['startDate'].setValue(this.startDate || this.todayDate);
    this.candidateWorkCommitmentForm.controls['startDate'].updateValueAndValidity({ onlySelf: true });
  }

  @OutsideZone
  private refreshDatepicker(): void {
    setTimeout(() => this.startDatePicker.datepicker.refresh());
  }

  private resetFields(): void {
    this.candidateWorkCommitmentForm.controls['regionIds'].setValue([]);
    this.candidateWorkCommitmentForm.controls['locationIds'].setValue([]);
  }

  private getWorkCommitmentById(
    id: number, // group id (master commitment id)
    candidateCommitment: CandidateWorkCommitment | null = null,
    populateForm = true
  ): void {
    this.resetFields();
    this.workCommitmentGroup = this.workCommitments.find(group => +group.id === +id)!;
    const workCommitmentOrgHierarchies: WorkCommitmentOrgHierarchies[] = [];
    this.workCommitmentGroup.items.forEach(item => {
      workCommitmentOrgHierarchies.push(...item.workCommitmentOrgHierarchies);
    });
    this.selectedLocations = this.getCommitmentLocationsFromHierarchy(workCommitmentOrgHierarchies);

    this.populateRegionsLocations(this.workCommitmentGroup);
    if (!populateForm) {
      if (candidateCommitment) {
        this.candidateWorkCommitmentForm.patchValue(candidateCommitment as {}, { emitEvent: false });
        this.candidateWorkCommitmentForm.controls['regionIds'].setValue(candidateCommitment.regionIds);
        this.candidateWorkCommitmentForm.controls['locationIds'].setValue(candidateCommitment.locationIds);
        this.candidateWorkCommitmentForm.controls['masterWorkCommitmentId'].setValue('' + id, { emitEvent: false });
        this.candidateWorkCommitmentForm.controls['startDate'].updateValueAndValidity({ onlySelf: true });
      }
      this.refreshDatepicker();
      this.cd.detectChanges();
    }
  }

  private subscribeOnCommitmentDropdownChange(): void {
    this.candidateWorkCommitmentForm.controls['masterWorkCommitmentId'].valueChanges
      .pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((value) => {
        if (value && this.title !== DialogMode.Edit) {
          this.resetForm();
          this.resetStartDateField();
          this.enableRegionLocation();
          this.getWorkCommitmentById(value);
        }
      });
  }

  private resetStartDateField(): void {
    this.candidateWorkCommitmentForm.get('startDate')?.reset();
    this.maximumDate = undefined;
    this.minimumDate = undefined;
    this.cd.markForCheck();
  }

  private getActiveWorkCommitment(): void {
    if (this.employeeId) {
      this.candidateWorkCommitmentService.getActiveCandidateWorkCommitment(this.employeeId).subscribe((activeCommitment) => {
        if (activeCommitment) {
          this.lastActiveDate = DateTimeHelper.convertDateToUtc(activeCommitment.startDate as string);
          this.lastActiveDate = addDays(this.lastActiveDate, 1) as Date;
        } else {
          this.minimumDate = undefined;
        }
      });
    } else {
      this.minimumDate = undefined;
    }
  }

  private controlsStateHandler(disable: boolean): void {
    for (const control in this.candidateWorkCommitmentForm.controls) {
      if (control !== 'workCommitmentIds' && control !== 'masterWorkCommitmentId' && control !== 'regionIds' && control !== 'locationIds') {
        disable
          ? this.candidateWorkCommitmentForm.controls[control].disable()
          : this.candidateWorkCommitmentForm.controls[control].enable();
      }
    }
  }

  private enableRegionLocation(): void {
    this.candidateWorkCommitmentForm.controls['regionIds'].enable();
    this.candidateWorkCommitmentForm.controls['locationIds'].enable();
  }

  private disableRegionLocation(): void {
    this.candidateWorkCommitmentForm.controls['regionIds'].disable();
    this.candidateWorkCommitmentForm.controls['locationIds'].disable();
  }

  private disableControls(): void {
    this.controlsStateHandler(true);
  }

  private enableControls(): void {
    this.controlsStateHandler(false);
  }

  private getCandidateWorkCommitmentById(commitment: CandidateWorkCommitment): void {
    this.candidateWorkCommitmentService.getCandidateWorkCommitmentById(commitment.id as number)
      .subscribe((commitment: CandidateWorkCommitment) => {
        if (commitment.workCommitmentIds) {
          const masterId = this.allWorkCommitments.find(item => item.workCommitmentId === commitment.workCommitmentIds[0])
          masterId && this.getWorkCommitmentById(masterId.masterWorkCommitmentId, commitment, false);
        }
        commitment.startDate = commitment.startDate && DateTimeHelper.convertDateToUtc(commitment.startDate as string);
      });
  }

  private subscribeOnDialog(): void {
    this.dialogSubject$.pipe(takeUntil(this.destroy$))
      .subscribe((value: { isOpen: boolean, isEdit: boolean, commitment?: CandidateWorkCommitment }) => {
        if (value.isOpen) {
          !value.isEdit && this.setWorkCommitmentDataSource();
          !value.isEdit && this.getActiveWorkCommitment();
          this.sideDialog.show();
        } else {
          this.sideDialog.hide();
        }
        this.title = value.isEdit ? DialogMode.Edit : DialogMode.Add;
        if (value.isEdit) {
          this.candidateWorkCommitmentForm.controls['masterWorkCommitmentId'].disable({ emitEvent: false });
          this.enableRegionLocation();
          this.enableControls();
          this.setWorkCommitmentDataSource(value.commitment);
        } else {
          this.candidateWorkCommitmentForm.controls['masterWorkCommitmentId'].enable({ emitEvent: false });
          this.disableRegionLocation();
          this.disableControls();
        }
        this.cd.markForCheck();
      });
  }

  private setRegionsLocationsDataSource(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.allRegions = structure.regions;
      });
    this.candidateWorkCommitmentForm.controls['regionIds'].valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((val: number[]) => {
        this.resetForm();
        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = [];
          const locations: OrganizationLocation[] = [];

          val.forEach((id) =>
            selectedRegions.push(this.allRegions.find((region) => region.id === id) as OrganizationRegion)
          );
          this.locations = [];
          selectedRegions.forEach((region) => {
            locations.push(...region.locations as []);
          });
          this.locations.push(...sortByField(locations, 'name'));
          this.setLocationsDataSource(this.locations);
          this.selectedRegions = selectedRegions;
        } else {
          this.locations = [];
          this.selectedRegions = [];
          this.resetForm();
        }
        this.candidateWorkCommitmentForm.controls['locationIds'].setValue([]);
        this.cd.markForCheck();
      });

      this.candidateWorkCommitmentForm.controls['locationIds'].valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((val: number[]) => {
        if (val?.length) {
          this.selectedRegionLocations = [];
          val.forEach((id) =>
            this.selectedRegionLocations.push(this.locations.find((location) => location.id === id) as OrganizationLocation)
          );
          this.populateWorkCommitment();
          this.enableControls();
        } else {
          this.resetForm();
          this.selectedRegionLocations = [];
          this.disableControls();
        }

        this.cd.markForCheck();
      });
  }

  private setHolidayDataSource(): void {
    this.candidateWorkCommitmentService.getHolidays().subscribe((holidays) => {
      this.holidays = convertHolidaysToDataSource(holidays);
      this.cd.detectChanges();
    });
  }

  private setWorkCommitmentDataSource(commitment?: CandidateWorkCommitment): void {
    this.candidateWorkCommitmentService.getAvailableWorkCommitments(this.employeeId)
      .subscribe((commitments: WorkCommitmentDetails[]) => {
        const commitmentGroups = groupBy(commitments, ['masterWorkCommitmentId'], ['masterWorkCommitmentName']);
        this.workCommitments = Object.keys(commitmentGroups).map(key => commitmentGroups[key]);
        this.allWorkCommitments = commitments;
        if (commitment) {
          this.getCandidateWorkCommitmentById(commitment);
        }
        this.cd.detectChanges();
      });
  }

  public closeDialog(): void {
    if (this.candidateWorkCommitmentForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.sideDialog.hide();
          this.candidateWorkCommitmentForm.reset();
          this.lastActiveDate = null;
        });
    } else {
      this.sideDialog.hide();
      this.candidateWorkCommitmentForm.reset();
      this.lastActiveDate = null;
    }
  }

  public saveCommitment(): void {
    if (this.candidateWorkCommitmentForm.valid) {
      const candidateWorkCommitment: CandidateWorkCommitment = this.candidateWorkCommitmentForm.getRawValue();
      candidateWorkCommitment.startDate =
        candidateWorkCommitment.startDate &&
        DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(this.startDate));
      candidateWorkCommitment.employeeId = this.employeeId;
      this.candidateWorkCommitmentService.saveCandidateWorkCommitment(candidateWorkCommitment).pipe(
        tap(() => {
          this.sideDialog.hide();
          this.candidateWorkCommitmentForm.reset();
          this.lastActiveDate = null;
          this.store.dispatch(
            new ShowToast(
              MessageTypes.Success,
              !candidateWorkCommitment.id ? RECORD_ADDED : RECORD_MODIFIED
            )
          );
          this.refreshSubject$.next();
        }),
        catchError((error: HttpErrorResponse) => {
          return this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        })
      ).subscribe();
    } else {
      this.candidateWorkCommitmentForm.markAllAsTouched();
    }
  }

  private setWCStartDate(): void {
    if (!this.lastActiveDate) {
      const employeeHireDate = this.candidateService.getEmployeeHireDate();
      const startDate = DateTimeHelper.convertDateToUtc(employeeHireDate);
      const isHireDateLessWCStartDate = DateTimeHelper.isDateBefore(
        startDate,
        this.selectWorkCommitmentStartDate
      );

      this.startDate = isHireDateLessWCStartDate ? this.todayDate : startDate;
    }
  }

  private setMinimumDate(): Date {
    let minimumDate = this.selectWorkCommitmentStartDate;
    if (this.lastActiveDate) {
      minimumDate =
        DateTimeHelper.isDateBefore(this.lastActiveDate, this.selectWorkCommitmentStartDate)
          ? this.selectWorkCommitmentStartDate
          : this.lastActiveDate;
    }
    return minimumDate;
  }
}
