import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { SelectEventArgs, TabComponent } from "@syncfusion/ej2-angular-navigations";
import { Observable, Subject, takeUntil } from "rxjs";

import { CandidateGeneralInfoComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component";
import { CandidateProfessionalSummaryComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component";
import { CandidateState } from "src/app/agency/store/candidate.state";
import { CandidateContactDetailsComponent } from "./candidate-contact-details/candidate-contact-details.component";
import { SetHeaderState } from "src/app/store/app.actions";
import { SaveCandidate, SaveCandidateSucceeded, UploadCandidatePhoto } from '../../store/candidate.actions';
import { Candidate } from 'src/app/shared/models/candidate.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss']
})
export class AddEditCandidateComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') tab: TabComponent;

  public showSaveProfileButtons = true;
  public candidateForm: FormGroup;

  private filesDetails : Blob[] = [];
  private candidateId: number;
  private unsubscribe$: Subject<void> = new Subject();

  @Select(CandidateState.isCandidateCreated)
  private isCandidateCreated$: Observable<boolean>;

  constructor(private store: Store,
              private fb: FormBuilder,
              private actions$: Actions,
              private router: Router) {
    store.dispatch(new SetHeaderState({ title: 'Agency', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.generateCandidateForm();
    this.actions$.pipe(ofActionSuccessful(SaveCandidateSucceeded)).subscribe((candidate: { payload: Candidate }) => {
      this.candidateId = candidate.payload.id as number;
      this.uploadImages(this.candidateId);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public clearForm(): void {
    this.candidateForm.reset();
  }

  public navigateBack(): void {
    this.router.navigate(['/agency/candidates']);
  }

  public save(): void {
    if (this.candidateForm.valid) {
      this.store.dispatch(new SaveCandidate(new Candidate(this.candidateForm.getRawValue())));
    } else {
      this.candidateForm.markAllAsTouched();
    }
  }

  public onImageSelect(event: Blob | null) {
    if (event) {
      this.filesDetails = [event as Blob];
    } else {
      this.filesDetails = [];
    }
  }

  public onStepperCreated(): void {
    const profileTabIndex = 0;
    const experienceTabIndex = 1;
    const educationTabIndex = 2;

    this.tab.enableTab(experienceTabIndex, false);
    this.tab.enableTab(educationTabIndex, false);

    this.isCandidateCreated$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res) {
        this.tab.enableTab(experienceTabIndex, true);
        this.tab.enableTab(educationTabIndex, true);
      } else {
        this.tab.enableTab(experienceTabIndex, false);
        this.tab.enableTab(educationTabIndex, false);
      }
    });

    this.tab.selected.pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: SelectEventArgs) => {
        this.showSaveProfileButtons = event.selectedIndex === profileTabIndex;

        if (
          (event.selectedIndex === experienceTabIndex || event.selectedIndex === educationTabIndex)
          && event.previousIndex !== profileTabIndex
        ) {
          this.tab.refresh();
        }
      });
  }

  private generateCandidateForm(): void {
    this.candidateForm = this.fb.group({
      generalInfo: CandidateGeneralInfoComponent.createFormGroup(),
      contactDetails: CandidateContactDetailsComponent.createFormGroup(),
      profSummary: CandidateProfessionalSummaryComponent.createFormGroup(),
    });
  }

  private uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadCandidatePhoto(this.filesDetails[0] as Blob, businessUnitId));
    }
  }
}
