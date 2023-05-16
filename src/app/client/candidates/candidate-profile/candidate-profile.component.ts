import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { ActivatedRoute } from '@angular/router';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { EMPTY, filter, Observable, switchMap, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { CandidatesService } from '../services/candidates.service';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { Store } from '@ngxs/store';
import { SystemType } from '@shared/enums/system-type.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { EMPLOYEE_SKILL_CHANGE_WARNING, EMPLOYEE_TERMINATED_WARNING, WARNING_TITLE } from '@shared/constants/messages';
import { ProfileStatusesEnum } from './candidate-profile.constants';

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
    private confirmService: ConfirmService
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
      return this.skillsChangeHandler();
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

  private isSkillChanged(): boolean {
    return !!(this.candidateService.employeeId && 
      (this.candidateProfileFormService.candidateForm.get('primarySkillId')?.dirty || this.candidateProfileFormService.candidateForm.get('secondarySkills')?.dirty));
  }

  private isEmployeeTerminated(): boolean {
    const profileStatusControl = this.candidateProfileFormService.candidateForm.get('profileStatus');
    return !!(this.candidateService.employeeId && 
      (profileStatusControl?.dirty && profileStatusControl?.value === ProfileStatusesEnum.Terminated));
  }

  private profileStatusTerminatedConfirmation(): Observable<void | CandidateModel> {
    return this.confirmService
      .confirm(EMPLOYEE_TERMINATED_WARNING, {
        title: WARNING_TITLE,
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(Boolean),
        switchMap(() => this.saveCandidate()),
        takeUntil(this.destroy$));
  }

  private skillChangeConfirmation(): Observable<void | CandidateModel> {
    return this.confirmService
      .confirm(EMPLOYEE_SKILL_CHANGE_WARNING, {
        title: WARNING_TITLE,
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(Boolean),
        switchMap(() => this.employeeTerminationHandler()),
        takeUntil(this.destroy$));
  }

  private employeeTerminationHandler(): Observable<void | CandidateModel> {
    if (this.isEmployeeTerminated()) {
      return this.profileStatusTerminatedConfirmation();
    }
    return this.saveCandidate();
  }

  private skillsChangeHandler(): Observable<void | CandidateModel> {
    if (this.isSkillChanged()) {
      return this.skillChangeConfirmation();
    }
    return this.employeeTerminationHandler();
  }

  private saveCandidate(): Observable<void | CandidateModel> {
    return this.candidateProfileService
        .saveCandidate(this.filesDetails, this.candidateId ?? this.candidateService.employeeId)
        .pipe(takeUntil(this.destroy$));
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
    this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } })).pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.candidateId) {
        this.candidateProfileService
          .getCandidateById(this.candidateId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((candidate) => {
            this.candidateProfileFormService.populateCandidateForm(candidate);
            this.candidateService.setCandidateName(`${candidate.lastName}, ${candidate.firstName}`);
            this.candidateService.setEmployeeHireDate(candidate.hireDate);
            this.candidateService.setTerminationDate(candidate.terminationDate);
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
