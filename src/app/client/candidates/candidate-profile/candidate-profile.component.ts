import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { ActivatedRoute } from '@angular/router';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { CandidatesService } from '../services/candidates.service';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { Store } from '@ngxs/store';
import { SystemType } from '@shared/enums/system-type.enum';

@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateProfileComponent extends DestroyableDirective implements OnInit, OnDestroy {
  public photo$: Observable<Blob>;
  public readonlyMode = false;

  private filesDetails: Blob | null;
  private isRemoveLogo: boolean;
  private candidateId: number;

  constructor(
    private candidateProfileFormService: CandidateProfileFormService,
    private candidateProfileService: CandidateProfileService,
    private candidateService: CandidatesService,
    private generalNotesService: GeneralNotesService,
    private route: ActivatedRoute,
    private navigationWrapperService: NavigationWrapperService,
    private store: Store,
  ) {
    super();
    this.employeeIdHandler();
  }

  public ngOnInit(): void {
    this.navigationWrapperService.areUnsavedChanges = this.hasUnsavedChanges.bind(this);
    this.listenSaveEvent();
    this.handleEditingCandidate();
    this.initSelectedTab();
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
      return this.candidateProfileService
        .saveCandidate(this.filesDetails, this.candidateId ?? this.candidateService.employeeId)
        .pipe(takeUntil(this.destroy$));
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
    return this.candidateProfileFormService.candidateForm.dirty;
  }

  public onImageSelect(event: Blob | null) {
    if (event) {
      this.filesDetails = event as Blob;
      this.isRemoveLogo = false;
    } else {
      this.filesDetails = null;
      this.isRemoveLogo = true;
    }
  }

  private employeeIdHandler(): void {
    if (this.route.snapshot.paramMap.get('id')) {
      this.candidateId = this.candidateService.employeeId = parseInt(this.route.snapshot.paramMap.get('id') as string);
    } else {
      this.candidateService.employeeId = null;
    }
  }

  private handleEditingCandidate(): void {
    this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } })).subscribe(() => {
      if (this.candidateId) {
        this.candidateProfileService
          .getCandidateById(this.candidateId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((candidate) => {
            this.candidateProfileFormService.populateCandidateForm(candidate);
            this.candidateService.setCandidateName(`${candidate.lastName}, ${candidate.firstName}`);
            this.generalNotesService.notes$.next(candidate.generalNotes);
          });
  
        this.photo$ = this.candidateProfileService.getCandidatePhotoById(this.candidateId);
      }
    });
  }

  private initSelectedTab(): void {
    this.candidateService.changeTab(CandidateTabsEnum.CandidateProfile);
  }
}
