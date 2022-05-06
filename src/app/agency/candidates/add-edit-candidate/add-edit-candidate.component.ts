import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

import { Actions, ofActionSuccessful, Store } from "@ngxs/store";

import { CandidateGeneralInfoComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component";
import { CandidateProfessionalSummaryComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component";
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
export class AddEditCandidateComponent implements OnInit {
  public candidateForm: FormGroup;

  private filesDetails : Blob[] = [];
  private candidateId: number;
  private candidatePhoto: Blob | null;

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
