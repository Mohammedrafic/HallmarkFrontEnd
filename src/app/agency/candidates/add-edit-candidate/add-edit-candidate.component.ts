import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

import { Store } from "@ngxs/store";

import { CandidateGeneralInfoComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component";
import { CandidateProfessionalSummaryComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component";
import { CandidateContactDetailsComponent } from "./candidate-contact-details/candidate-contact-details.component";
import { SetHeaderState } from "src/app/store/app.actions";
import { SaveCandidate } from '../../store/candidate.actions';
import { Candidate } from 'src/app/shared/models/candidate.model';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss']
})
export class AddEditCandidateComponent implements OnInit {
  public candidateForm: FormGroup;

  private candidatePhoto: Blob | null;

  constructor(private store: Store, private fb: FormBuilder) {
    store.dispatch(new SetHeaderState({ title: 'Agency', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.generateCandidateForm();
  }

  public setCandidatePhoto(file: Blob | null) {
    this.candidatePhoto = file;
    console.log(this.candidatePhoto);
  }

  private generateCandidateForm(): void {
    this.candidateForm = this.fb.group({
      generalInfo: CandidateGeneralInfoComponent.createFormGroup(),
      contactDetails: CandidateContactDetailsComponent.createFormGroup(),
      profSummary: CandidateProfessionalSummaryComponent.createFormGroup(),
    });
  }

  public save(): void {
    if (this.candidateForm.valid) {
      this.store.dispatch(new SaveCandidate(new Candidate(this.candidateForm.getRawValue())));
    } else {
      this.candidateForm.markAllAsTouched();
    }
  }
}
