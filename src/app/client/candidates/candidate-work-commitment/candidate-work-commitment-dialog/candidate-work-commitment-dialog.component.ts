import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateTimeHelper } from '@core/helpers';
import { Select, Store } from '@ngxs/store';
import { WorkCommitmentDetails } from '@organization-management/work-commitment/interfaces';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { MessageTypes } from '@shared/enums/message-types';
import { convertHolidaysToDataSource } from '@shared/helpers/dropdown-options.helper';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { addDays } from '@shared/utils/date-time.utils';
import { getAllErrors } from '@shared/utils/error.utils';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { uniq } from 'lodash';
import { catchError, filter, Observable, Subject, takeUntil, tap } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { CandidateWorkCommitment, WorkCommitmentDataSource } from '../models/candidate-work-commitment.model';
import { CandidateWorkCommitmentService } from '../services/candidate-work-commitment.service';

@Component({
  selector: 'app-candidate-work-commitment-dialog',
  templateUrl: './candidate-work-commitment-dialog.component.html',
  styleUrls: ['./candidate-work-commitment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

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
  public workCommitments: WorkCommitmentDataSource[] = [];
  public holidays: { id: number, name: number }[] = [];
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public candidateWorkCommitmentForm: FormGroup;
  public employeeId: number;
  public readonly commitmentFields = {
    text: 'name',
    value: 'id',
  };

  public readonly numericInputAttributes = { maxLength: '10' };
  public format = '#';

  public todayDate = new Date();
  public lastActiveDate: Date;

  public useMinimumDate: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private candidateWorkCommitmentService: CandidateWorkCommitmentService,
    private store: Store,
    private confirmService: ConfirmService,
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

  private createForm(): void {
    this.candidateWorkCommitmentForm = this.fb.group({
      id: [0],
      employeeId: [this.employeeId],
      workCommitmentId: [null, Validators.required],
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

  private getWorkCommitmentById(id: number): void {
    this.candidateWorkCommitmentService.getWorkCommitmentById(id).subscribe((commitment: WorkCommitmentDetails) => {
      let regions = commitment.workCommitmentOrgHierarchies.map((val) => val.regionId);
      regions = uniq(regions);
      let locations = commitment.workCommitmentOrgHierarchies.map((val) => val.locationId);
      locations = uniq(locations);
      this.candidateWorkCommitmentForm.controls['regionIds'].setValue(regions);
      this.candidateWorkCommitmentForm.controls['locationIds'].setValue(locations);
      this.candidateWorkCommitmentForm.controls['jobCode'].setValue(commitment.jobCode);
      this.candidateWorkCommitmentForm.controls['availRequirement'].setValue(commitment.availabilityRequirement);
      this.candidateWorkCommitmentForm.controls['schedulePeriod'].setValue(commitment.schedulePeriod);
      this.candidateWorkCommitmentForm.controls['minWorkExperience'].setValue(commitment.minimumWorkExperience);
      this.candidateWorkCommitmentForm.controls['criticalOrder'].setValue(commitment.criticalOrder);
      this.candidateWorkCommitmentForm.controls['holiday'].setValue(commitment.holiday);
      this.candidateWorkCommitmentForm.controls['comment'].setValue(commitment.comments);
      this.candidateWorkCommitmentForm.controls['startDate'].setValue(this.lastActiveDate);
    });
  }

  private subscribeOnCommitmentDropdownChange(): void {
    this.candidateWorkCommitmentForm.controls['workCommitmentId'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value) {
        this.enableControls();
        this.getWorkCommitmentById(value);
      }
    });
  }

  private getActiveWorkCommitment(): void {
    if (this.employeeId) {
      this.candidateWorkCommitmentService.getActiveCandidateWorkCommitment(this.employeeId).subscribe((activeCommitment) => {
        if (activeCommitment) {
          this.lastActiveDate = DateTimeHelper.convertDateToUtc(activeCommitment.startDate as string);
          this.lastActiveDate = addDays(this.lastActiveDate, 1) as Date;
          this.useMinimumDate = true;
        } else {
          this.lastActiveDate = this.todayDate;
          this.useMinimumDate = false;
        }
      });
    } else {
      this.lastActiveDate = this.todayDate;
      this.useMinimumDate = false;
    }
  }

  private controlsStateHandler(disable: boolean): void {
    for (const control in this.candidateWorkCommitmentForm.controls) {
      if (control !== 'workCommitmentId') {
        disable ? this.candidateWorkCommitmentForm.controls[control].disable() : this.candidateWorkCommitmentForm.controls[control].enable();
      }
    }
  }

  private disableControls(): void {
    this.controlsStateHandler(true);
  }

  private enableControls(): void {
    this.controlsStateHandler(false);
  }

  private getCandidateWorkCommitmentById(commitment: CandidateWorkCommitment): void {
    this.candidateWorkCommitmentService.getCandidateWorkCommitmentById(commitment.id as number).subscribe((commitment: CandidateWorkCommitment) => {
      commitment.id = 0;
      commitment.startDate = commitment.startDate && DateTimeHelper.convertDateToUtc(commitment.startDate as string);
      this.candidateWorkCommitmentForm.patchValue(commitment as {}, { emitEvent: false });
      this.candidateWorkCommitmentForm.controls['regionIds'].setValue(commitment.regionIds);
      this.candidateWorkCommitmentForm.controls['locationIds'].setValue(commitment.locationIds);
      this.candidateWorkCommitmentForm.controls['startDate'].setValue(this.lastActiveDate);
    });
  }

  private subscribeOnDialog(): void {
    this.dialogSubject$.pipe(takeUntil(this.destroy$)).subscribe((value: { isOpen: boolean, isEdit: boolean, commitment?: CandidateWorkCommitment }) => {
      if (value.isOpen) {
        this.setWorkCommitmentDataSource();
        this.getActiveWorkCommitment();
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
      this.title = value.isEdit ? 'Edit' : 'Add';
      if (value.isEdit) {
        this.enableControls();
        this.getCandidateWorkCommitmentById(value.commitment as CandidateWorkCommitment);
      } else {
        this.disableControls();
      }
      this.cd.markForCheck();
    });
  }

  private setRegionsLocationsDataSource(): void {
    this.organizationStructure$
    .pipe(takeUntil(this.destroy$), filter(Boolean))
    .subscribe((structure: OrganizationStructure) => {
      this.regions = structure.regions;
    });
    this.candidateWorkCommitmentForm.controls['regionIds'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        const locations: OrganizationLocation[] = [];

        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.locations = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          locations.push(...region.locations as []);
        });
        this.locations.push(...sortByField(locations, 'name'));
      } else {
        this.locations = [];
        this.candidateWorkCommitmentForm.controls['locationIds'].setValue([]);
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

  private setWorkCommitmentDataSource(): void {
    this.candidateWorkCommitmentService.getAvailableWorkCommitments(this.employeeId).subscribe((commitments: WorkCommitmentDataSource[]) => {
      this.workCommitments = commitments;
      this.cd.detectChanges();
    });
  }

  public closeDialog(): void {
    if (this.candidateWorkCommitmentForm.dirty) {
      this.confirmService
      .confirm(CANCEL_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.sideDialog.hide();
        this.candidateWorkCommitmentForm.reset();
      });
    } else {
      this.sideDialog.hide();
      this.candidateWorkCommitmentForm.reset();
    }
  }

  public saveCommitment(): void {
    if (this.candidateWorkCommitmentForm.valid) {
      const candidateWorkCommitment: CandidateWorkCommitment = this.candidateWorkCommitmentForm.getRawValue();
      candidateWorkCommitment.startDate = candidateWorkCommitment.startDate && DateTimeHelper.toUtcFormat(candidateWorkCommitment.startDate);
      candidateWorkCommitment.employeeId = this.employeeId;
      this.candidateWorkCommitmentService.saveCandidateWorkCommitment(candidateWorkCommitment).pipe(
        tap(() => {
          this.sideDialog.hide();
          this.candidateWorkCommitmentForm.reset();
          this.store.dispatch(new ShowToast(MessageTypes.Success, !candidateWorkCommitment.id ? RECORD_ADDED : RECORD_MODIFIED));
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
}
