import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { Router } from '@angular/router';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';

@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateProfileComponent extends DestroyableDirective implements OnInit, OnDestroy {
  public photo: Blob | null = null;
  public readonlyMode = false;
  public candidateForm: FormGroup;

  private filesDetails: Blob[] = [];
  private isRemoveLogo: boolean;

  constructor(
    private candidateProfileFormService: CandidateProfileFormService,
    private candidateProfileService: CandidateProfileService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private navigationWrapperService: NavigationWrapperService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.candidateForm = this.candidateProfileFormService.candidateForm;
    this.navigationWrapperService.areUnsavedChanges = this.hasUnsavedChanges.bind(this);
    this.listenSaveEvent();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.candidateProfileFormService.resetCandidateForm();
  }

  public saveCandidateProfile(): Observable<void | CandidateModel> {
    if (this.candidateProfileFormService.candidateForm.invalid) {
      this.candidateProfileFormService.markCandidateFormAsTouched();
      return EMPTY;
    } else {
      return this.candidateProfileService.saveCandidate(this.filesDetails[0]).pipe(takeUntil(this.destroy$));
    }
  }

  public listenSaveEvent(): void {
    this.candidateProfileFormService.saveEvent$
      .pipe(
        switchMap(() => this.saveCandidateProfile()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.candidateProfileFormService.candidateForm.markAsPristine();
        this.navigationWrapperService.areUnsavedChanges = () => false;
      });
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
