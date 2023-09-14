import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationWrapperService } from '@shared/services/navigation-wrapper.service';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';
import { ActivatedRoute } from '@angular/router';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { EMPTY, filter, Observable, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateModel } from '@client/candidates/candidate-profile/candidate.model';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { CandidatesService } from '../services/candidates.service';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { Store } from '@ngxs/store';
import { SystemType } from '@shared/enums/system-type.enum';
import { EMPLOYEE_SKILL_CHANGE_WARNING, EMPLOYEE_TERMINATED_WARNING } from '@shared/constants/messages';
import { ProfileStatusesEnum } from './candidate-profile.constants';
import { UserState } from 'src/app/store/user.state';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';

@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateProfileComponent extends DestroyableDirective implements OnInit, OnDestroy {
  public photo$: Observable<Blob>;
  public readonlyMode = false;
  public $skillsConfirmDialog = new Subject<boolean>();
  public $statusConfirmDialog = new Subject<boolean>();
  public showSkillConfirmDialog = false;
  public showStatusConfirmDialog = false;
  public replaceOrder = false;
  public employeeTerminatedWaring = EMPLOYEE_TERMINATED_WARNING;
  public employeeSkillChangeWarning = EMPLOYEE_SKILL_CHANGE_WARNING;

  private filesDetails: Blob | null;
  private isRemoveLogo: boolean;
  private candidateId: number;
  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;

  constructor(
    private candidateProfileFormService: CandidateProfileFormService,
    private candidateProfileService: CandidateProfileService,
    private candidateService: CandidatesService,
    private generalNotesService: GeneralNotesService,
    private route: ActivatedRoute,
    private navigationWrapperService: NavigationWrapperService,
    private store: Store,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.employeeIdHandler();
  }

  public ngOnInit(): void {
    this.navigationWrapperService.areUnsavedChanges = this.hasUnsavedChanges.bind(this);
    this.listenSaveEvent();
    this.handleEditingCandidate();
    this.initSelectedTab();
    this.getPermission();
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
    return !!(this.candidateService.employeeId && (
      this.candidateProfileFormService.candidateForm.get('primarySkillId')?.dirty ||
      this.candidateProfileFormService.candidateForm.get('secondarySkills')?.dirty
    ));
  }

  private isEmployeeTerminated(): boolean {
    const profileStatusControl = this.candidateProfileFormService.candidateForm.get('profileStatus');
    return !!(this.candidateService.employeeId &&
      (profileStatusControl?.dirty && profileStatusControl?.value === ProfileStatusesEnum.Terminated ||profileStatusControl?.value === ProfileStatusesEnum.FallOffOnboarding));
  }

  private profileStatusTerminatedConfirmation(): Observable<void | CandidateModel> {
    this.showStatusConfirmDialog = true;
    this.cd.markForCheck();
    return this.$statusConfirmDialog.pipe(
      tap(() => this.showStatusConfirmDialog = false),
      filter(Boolean),
      switchMap(() => this.saveCandidate()),
      take(1)
    );
  }

  private skillChangeConfirmation(): Observable<void | CandidateModel> {
    this.showSkillConfirmDialog = true;
    this.cd.markForCheck();
    return this.$skillsConfirmDialog.pipe(
      tap(() => this.showSkillConfirmDialog = false),
      filter(Boolean),
      switchMap(() => this.employeeTerminationHandler()),
      take(1)
    );
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
      .saveCandidate(this.filesDetails, this.candidateId ?? this.candidateService.employeeId, this.replaceOrder)
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
    this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } }))
      .pipe(
        filter(() => !!this.candidateId),
        tap(() => { this.photo$ = this.candidateProfileService.getCandidatePhotoById(this.candidateId); }),
        switchMap(() => this.candidateProfileService.getCandidateById(this.candidateId)),
        takeUntil(this.destroy$))
      .subscribe((candidate) => {
        this.candidateProfileFormService.populateCandidateForm(candidate);
        this.candidateService.setCandidateName(`${candidate.lastName}, ${candidate.firstName}`);
        this.candidateService.setProfileData(candidate);
        this.generalNotesService.notes$.next(candidate.generalNotes);
      });
  }

  private initSelectedTab(): void {
    this.candidateService.changeTab(CandidateTabsEnum.CandidateProfile);
  }
  private getPermission(): void {
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length),
      take(1)
    ).subscribe((permissions: Permission) => {
      this.userPermission = permissions;
    });
  }
}
