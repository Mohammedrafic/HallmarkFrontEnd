import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { Router } from '@angular/router';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateProfileComponent implements OnInit, OnDestroy {
  public photo: Blob | null = null;
  public readonlyMode = false;
  private filesDetails: Blob[] = [];
  private isRemoveLogo: boolean;

  public candidateForm: FormGroup;


  constructor(
    private candidateProfileFormService: CandidateProfileFormService,
    private candidateProfileService: CandidateProfileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private navigationWrapperService: NavigationWrapperService) {

  }

  public ngOnInit(): void {
    this.candidateForm = this.candidateProfileFormService.candidateForm;
    this.navigationWrapperService.areUnsavedChanges = this.hasUnsavedChanges.bind(this);

    this.candidateProfileFormService.saveEvent$.subscribe(() => {
      if (this.candidateProfileFormService.candidateForm.invalid) {
        this.candidateProfileFormService.markCandidateFormAsTouched();
      } else {
        this.candidateProfileService.saveCandidate(this.filesDetails[0])
          .subscribe(() => {
            this.candidateProfileFormService.candidateForm.markAsPristine();
          });
      }
    });
  }

  public ngOnDestroy(): void {
    this.candidateProfileFormService.resetCandidateForm();
  }

  private hasUnsavedChanges(): boolean {
    return this.candidateForm.dirty;
  }

  public onImageSelect(event: Blob | null) {
    if (event) {
      this.filesDetails = [event as Blob];
      this.isRemoveLogo = false;
    } else {
      this.filesDetails = [];
      this.isRemoveLogo = true;
    }
  }
}
