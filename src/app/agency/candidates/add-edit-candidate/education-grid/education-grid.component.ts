import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { GridComponent, ValueAccessor } from '@syncfusion/ej2-angular-grids';
import { delay, filter, Observable } from 'rxjs';

import {
  GetEducationByCandidateId,
  RemoveEducation,
  RemoveEducationSucceeded,
  SaveEducation,
  SaveEducationSucceeded,
} from 'src/app/agency/store/candidate.actions';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from 'src/app/shared/constants/messages';
import { Degree } from 'src/app/shared/enums/degree-types';
import { Education } from 'src/app/shared/models/education.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { valuesOnly } from 'src/app/shared/utils/enum.utils';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-education-grid',
  templateUrl: './education-grid.component.html',
  styleUrls: ['./education-grid.component.scss'],
  providers: [MaskedDateTimeService],
})
export class EducationGridComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Input() readonlyMode = false;
  @Input() areAgencyActionsAllowed: boolean;

  @ViewChild('grid') grid: GridComponent;

  @Select(CandidateState.educations)
  educations$: Observable<Education[]>;

  public today = new Date();
  public title = '';
  public educationForm: FormGroup;
  public optionFields = {
    text: 'text',
    value: 'id',
  };
  public degreeAccessor: ValueAccessor = (_, data: any) => Degree[data['degree']];
  public degreeTypes = Object.values(Degree)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private actions$: Actions,
    private confirmService: ConfirmService
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetEducationByCandidateId());
    this.createEducationForm();

    this.actions$.pipe(ofActionSuccessful(SaveEducationSucceeded)).subscribe(() => {
      this.store.dispatch(new GetEducationByCandidateId());
      this.educationForm.markAsPristine();
      this.closeDialog();
    });
    this.actions$.pipe(ofActionSuccessful(RemoveEducationSucceeded)).subscribe(() => {
      this.store.dispatch(new GetEducationByCandidateId());
    });
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onEdit(education: Education) {
    this.title = 'Edit';
    this.educationForm.setValue({
      id: education.id,
      candidateProfileId: education.candidateProfileId,
      degree: education.degree,
      schoolName: education.schoolName,
      graduationDate: education.graduationDate,
      fieldOfStudy: education.fieldOfStudy,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove(data: Education) {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new RemoveEducation(data));
      });
  }

  public addNew(): void {
    this.title = 'Add';
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onFilter(): void {}

  public closeDialog(): void {
    if (this.educationForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  public saveEducation(): void {
    this.educationForm.markAllAsTouched();
    if (this.educationForm.valid) {
      this.store.dispatch(new SaveEducation(this.educationForm.getRawValue()));
    } else {
      this.educationForm.markAllAsTouched();
    }
  }

  private createEducationForm(): void {
    this.educationForm = this.fb.group({
      id: new FormControl(null),
      candidateProfileId: new FormControl(null),
      fieldOfStudy: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      schoolName: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      degree: new FormControl(null, [Validators.required]),
      graduationDate: new FormControl(null, [Validators.required]),
    });
  }

  private closeSideDialog(): void {
    this.store
      .dispatch(new ShowSideDialog(false))
      .pipe(delay(500))
      .subscribe(() => {
        this.educationForm.reset();
      });
  }
}
