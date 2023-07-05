import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ChangedEventArgs, DatePickerComponent, MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { delay, filter, Observable, takeUntil } from 'rxjs';

import {
  GetExperienceByCandidateId,
  RemoveExperience,
  RemoveExperienceSucceeded,
  SaveExperience,
  SaveExperienceSucceeded,
} from 'src/app/agency/store/candidate.actions';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from 'src/app/shared/constants/messages';
import { Experience } from 'src/app/shared/models/experience.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
import { DateTimeHelper } from '@core/helpers';
import { TakeUntilDestroy } from '@core/decorators';

@Component({
  selector: 'app-experience-grid',
  templateUrl: './experience-grid.component.html',
  styleUrls: ['./experience-grid.component.scss'],
  providers: [MaskedDateTimeService],
})
@TakeUntilDestroy
export class ExperienceGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() readonlyMode = false;
  @Input() areAgencyActionsAllowed: boolean;
  @Input() userPermission: Permission;

  @ViewChild('grid') grid: GridComponent;
  @ViewChild('endDate') endDate: DatePickerComponent;
  @ViewChild('startDate') startDate: DatePickerComponent;

  @Select(CandidateState.experiences)
  experiences$: Observable<Experience[]>;

  public title = '';
  public experienceForm: FormGroup;
  public readonly userPermissions = UserPermissions;

  private today = new Date();
  protected componentDestroy: () => Observable<unknown>;

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private actions$: Actions,
    private confirmService: ConfirmService
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetExperienceByCandidateId());
    this.createExperienceForm();

    this.actions$.pipe(
      ofActionSuccessful(SaveExperienceSucceeded),
      takeUntil(this.componentDestroy()),
      ).subscribe(() => {
      this.store.dispatch(new GetExperienceByCandidateId());
      this.experienceForm.markAsPristine();
      this.closeDialog();
    });
    this.actions$.pipe(
      ofActionSuccessful(RemoveExperienceSucceeded),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.store.dispatch(new GetExperienceByCandidateId());
    });
  }

  ngOnDestroy(): void {}

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onStartDateChange(event: ChangedEventArgs): void {
    this.endDate.min = event.value || this.today;
  }

  public onEndDateChange(event: ChangedEventArgs): void {
    this.startDate.max = event.value || this.today;
  }

  public onEdit(experience: Experience) {
    this.title = 'Edit';
    this.experienceForm.setValue({
      id: experience.id,
      candidateProfileId: experience.candidateProfileId,
      employer: experience.employer,
      jobTitle: experience.jobTitle,
      startDate: DateTimeHelper.setCurrentTimeZone(experience.startDate),
      endDate: DateTimeHelper.setCurrentTimeZone(experience.endDate),
      comments: experience.comments,
    });
    if (this.readonlyMode) {
      this.experienceForm.disable();
    }
    this.setDateRanges(new Date(experience.endDate), new Date(experience.startDate));
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove(data: Experience) {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((confirm) => !!confirm),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.store.dispatch(new RemoveExperience(data));
      });
  }

  public addNew(): void {
    this.title = 'Add';
    this.setDateRanges();
    this.store.dispatch(new ShowSideDialog(true));
  }


  public closeDialog(): void {
    if (this.experienceForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          takeUntil(this.componentDestroy())
        ).subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  public saveExperience(): void {
    if (this.experienceForm.valid) {
      const experience: Experience = this.experienceForm.getRawValue();
      experience.startDate = experience.startDate ? DateTimeHelper.setUtcTimeZone(experience.startDate) : experience.startDate;
      experience.endDate = experience.endDate ? DateTimeHelper.setUtcTimeZone(experience.endDate) : experience.endDate;
      this.store.dispatch(new SaveExperience(experience));
    } else {
      this.experienceForm.markAllAsTouched();
    }
  }

  private createExperienceForm(): void {
    this.experienceForm = this.fb.group({
      id: new FormControl(null),
      candidateProfileId: new FormControl(null),
      employer: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      jobTitle: new FormControl(null, [Validators.required, Validators.maxLength(20)]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      comments: new FormControl(null, [Validators.maxLength(500)]),
    });
  }

  private closeSideDialog(): void {
    this.store
      .dispatch(new ShowSideDialog(false))
      .pipe(
        delay(500),
        takeUntil(this.componentDestroy()))
      .subscribe(() => {
        this.experienceForm.reset();
        this.experienceForm.enable();
      });
  }

  private setDateRanges(start: Date = this.today, end: Date = this.today): void {
    this.startDate.max = start;
    this.endDate.min = end;
  }
}
