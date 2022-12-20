import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { Router } from '@angular/router';

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
    private candidateProfileService: CandidateProfileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private navigationWrapperService: NavigationWrapperService) {

  }

  public ngOnInit(): void {
    this.candidateForm = this.candidateProfileService.candidateForm;
    this.navigationWrapperService.areUnsavedChanges = this.hasUnsavedChanges.bind(this);

    this.candidateProfileService.saveEvent$.subscribe(() => {
      if (this.candidateProfileService.candidateForm.invalid) {
        this.candidateProfileService.markCandidateFormAsTouched();
      } else {
        this.candidateProfileService.saveCandidate(this.filesDetails[0])
          .subscribe(() => {
            this.candidateProfileService.candidateForm.markAsPristine();
          });
      }
    });
  }

  public ngOnDestroy(): void {
    this.candidateProfileService.resetCandidateForm();
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
