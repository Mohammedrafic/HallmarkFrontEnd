import { positionIdStatuses } from "@agency/candidates/add-edit-candidate/add-edit-candidate.constants";
import { CandidateAgencyComponent } from '@agency/candidates/add-edit-candidate/candidate-agency/candidate-agency.component';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { SelectNavigation } from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { getCandidatePositionId, getOrderPublicId } from
  "@shared/components/order-candidate-list/order-candidate-list.utils";
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { ApplicantStatus } from "@shared/enums/applicant-status.enum";
import { CreatedCandidateStatus } from '@shared/enums/status';
import { CredentialStorageFacadeService } from "@agency/services/credential-storage-facade.service";
import { CandidateCredentialResponse } from "@shared/models/candidate-credential.model";
import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { distinctUntilChanged, filter, Observable, takeUntil, switchMap, take, map, Subject, delay } from 'rxjs';
import { CandidateGeneralInfoComponent } from
  'src/app/agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component';
import { CandidateProfessionalSummaryComponent } from
  'src/app/agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { Candidate, OrderManagementPagerState } from 'src/app/shared/models/candidate.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
  GetAllSkills,
  GetCandidateById,
  GetCandidateByIdSucceeded,
  GetCandidatePhoto,
  GetCandidatePhotoSucceeded,
  RemoveCandidateFromStore,
  RemoveCandidatePhoto,
  SaveCandidate,
  SaveCandidateSucceeded,
  UploadCandidatePhoto,
} from '../../store/candidate.actions';
import { CandidateContactDetailsComponent } from './candidate-contact-details/candidate-contact-details.component';
import { AbstractPermission } from '@shared/helpers/permissions';
import { AgencySettingsService } from '@agency/services/agency-settings.service';
import { DateTimeHelper } from '@core/helpers';
import { GlobalWindow } from "@core/tokens";
import { Country } from "@shared/enums/states";
import { GetRegionList } from "@shared/components/candidate-list/store/candidate-list.actions";
import { JobDistributionMasterSkills } from '@shared/models/associate-organizations.model';
import { AppState } from 'src/app/store/app.state';
import { AlertIdEnum } from "@admin/alerts/alerts.enum";
import { SetLastSelectedOrganizationAgencyId } from "src/app/store/user.actions";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { User } from "@shared/models/user.model";
import { CandidateService } from "@agency/services/candidates.service";
import { SettingsViewService } from "@shared/services/settings-view.service";
import { DialogMode } from "@shared/enums/dialog-mode.enum";

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditCandidateComponent extends AbstractPermission implements OnInit, OnDestroy {

  @ViewChild('stepper') tab: TabComponent;

  public showSaveProfileButtons = true;
  public candidateForm: FormGroup;
  public title = 'Add';
  public photo: Blob | null = null;
  // Used for disabling form and remove creation actions
  public readonlyMode = false;
  public isCredentialStep = false;
  public fetchedCandidate: Candidate;
  public isNavigatedFromOrganizationArea: boolean;
  public orderId: number | null = null;
  public agencyActionsAllowed = true;
  public candidateStatus: ApplicantStatus;
  public candidateJob: string;
  public orderOrPositionTitle: string;
  public orderOrPositionId: string;
  public candidateName: string | null;
  public isMobileLoginOn: boolean;

  private isRemoveLogo: boolean = false;
  public customMaskChar : string = '';
  public maskSSNPattern: string = '000-00-0000';
  public maskedSSN: string = '';
  public clearToStartValue: boolean | null = null;
  private filesDetails: Blob[] = [];
  private isInitialUpload = false;
  reloadCredentials$:Subject<boolean> = new Subject<boolean>();
  public get isCandidateAssigned(): boolean {
    return !!this.orderId && !!this.candidateStatus;
  }

  public isEnableClearedToStartForAcceptedCandidates$:Subject<boolean> = new Subject<boolean>();
  public isClearedToStartEnable:boolean = true;
  public clearedToStart:boolean = false;
  public organizationId:number;
  public candidateJobId:number;

  @Select(CandidateState.isCandidateCreated)
  public isCandidateCreated$: Observable<boolean>;

  @Select(AppState.isMobileScreen)
  public isMobile$: Observable<boolean>;

  @Select(CandidateState.candidateCredential)
  private candidateCredentialResponse$: Observable<CandidateCredentialResponse>;

  @Select(CandidateState.candidateProfile)
  private candidateProfile$: Observable<Candidate>;
  
  @Select(UserState.lastSelectedAgencyId)
  lastSelectedAgencyId$: Observable<number>;

  public disableNonlinkedagency:boolean;

  private unsubscribe$: Subject<void> = new Subject();

  get isAddMode(): boolean {
    return this.title === DialogMode.Add;
  }
  
  constructor(
    protected override store: Store,
    private fb: FormBuilder,
    private actions$: Actions,
    private router: Router,
    private route: ActivatedRoute,
    private confirmService: ConfirmService,
    private credentialStorage: CredentialStorageFacadeService,
    private location: Location,
    private agencySettingsService: AgencySettingsService,
    private cd: ChangeDetectorRef,
    private candidate: CandidateService,
    private settingService: SettingsViewService,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
  ) {
    super(store);
    store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
    this.route.queryParams.subscribe( paramMap => {
      if (paramMap['agId']) {
        this.store.dispatch(
          new SetLastSelectedOrganizationAgencyId({
            lastSelectedAgencyId: Number(paramMap['agId']),
            lastSelectedOrganizationId: null
          })
        );
      }
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch([new GetAllSkills(), new GetRegionList()]);
    this.generateCandidateForm();
    this.checkForAgencyStatus();
    this.setCredentialParams();

    this.actions$
      .pipe(takeUntil(this.componentDestroy()), ofActionSuccessful(SaveCandidateSucceeded))
      .subscribe((candidate: { payload: Candidate }) => {
        this.fetchedCandidate = candidate.payload;
        this.candidateName = this.getCandidateName(this.fetchedCandidate);
        this.uploadImages(this.fetchedCandidate.id as number);
        this.candidateForm.markAsPristine();
        this.cd.detectChanges();
      });
    this.actions$
      .pipe(delay(500), takeUntil(this.componentDestroy()), ofActionSuccessful(GetCandidateByIdSucceeded))
      .subscribe((candidate: { payload: Candidate }) => {
        this.fetchedCandidate = candidate.payload;
        !this.isNavigatedFromOrganizationArea && this.getCandidateLoginSetting(candidate.payload.id as number);
        this.candidateName = this.getCandidateName(this.fetchedCandidate);
        this.patchAgencyFormValue(this.fetchedCandidate);
        if (this.isCandidateAssigned) {
          this.selectCredentialsTab();
        }
      });
    this.actions$
      .pipe(takeUntil(this.componentDestroy()), ofActionSuccessful(GetCandidatePhotoSucceeded))
      .subscribe((photo: { payload: Blob }) => {
        this.photo = photo.payload;
        this.cd.detectChanges();
      });

    if (this.route.snapshot.paramMap.get('id')) {
      this.title = 'Edit';
    }else{
      this.customMaskChar = '00000';
    }
    this.pagePermissions();
    this.subscribeOnCandidateCredentialResponse();
    this.getNonlinkedagency();
  }

  getNonlinkedagency()
  {
    this.lastSelectedAgencyId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
    
      const user = this.store.selectSnapshot(UserState.user) as User;
        if(user.businessUnitType=== BusinessUnitType.MSP)
        {
        this.candidate.getIsmsp().subscribe(data=>{
          this.disableNonlinkedagency=data;    
          if(this.disableNonlinkedagency==true)
          {
            this.candidateForm.disable();
            this.readonlyMode = true;
          }    
        }) 
        }  
      
    });
      
  }


  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new RemoveCandidateFromStore());
    this.credentialStorage.removeCredentialParams();
    this.isRemoveLogo = false;
  }

  private getCandidateLoginSetting(id: number): void {
    this.agencySettingsService.isCandidateUserCreated(id)
    .pipe(
      takeUntil(this.componentDestroy())
    )
    .subscribe(setting => {
      this.isMobileLoginOn = !setting;
      this.isMobileLoginOn && this.handleMobileLoginRestriction();
      this.cd.detectChanges();
    });
  }

  private getCandidateName(candidate: Candidate): string {
    return `${candidate.lastName}, ${candidate.firstName}`;
  }

  private handleMobileLoginRestriction(): void {
    const generalInfoControl = this.candidateForm.get('generalInfo') as FormGroup;
    for (const control in generalInfoControl.controls) {
      if (control !== 'profileStatus') {
        generalInfoControl.get(control)?.disable();
      }
    }
    this.candidateForm.get('contactDetails')?.disable();
    this.candidateForm.get('profSummary')?.disable();
    this.cd.detectChanges();
  }

  public clearForm(): void {
    const {
      generalInfo: { profileStatus, candidateAgencyStatus },
    } = this.candidateForm.getRawValue();
    this.candidateForm.reset();
    const generalInfoControl = this.candidateForm.get('generalInfo');
    generalInfoControl?.patchValue({ profileStatus, candidateAgencyStatus });
  }

  public navigateBack(): void {
    if (this.candidateForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          takeUntil(this.componentDestroy())
        ).subscribe(() => {
          this.navigateToCandidates();
        });
    } else {
      this.navigateToCandidates();
    }
  }

  public save(): void {
    if (this.candidateForm.valid) {
      let candidate = this.getCandidateRequestObj(this.candidateForm.getRawValue());
      candidate = {
        ...candidate,
        dob: DateTimeHelper.setInitHours(DateTimeHelper.setUtcTimeZone(candidate.dob)),
        ssn: candidate.ssn ? +candidate.ssn : null,
      };

      if (!candidate.id) {
        candidate.candidateAgencyStatus = CreatedCandidateStatus.Active;
        candidate.profileStatus = CreatedCandidateStatus.Active;
        this.candidateForm.get('generalInfo')?.patchValue({
          profileStatus: CreatedCandidateStatus.Active,
          candidateAgencyStatus: CreatedCandidateStatus.Active,
        });
      }
      if(this.maskedSSN != ""){
        candidate.ssn = parseInt(this.maskedSSN);
      }
      this.saveCandidateProfile(candidate);

    } else {
      this.candidateForm.markAllAsTouched();
      this.cd.detectChanges();   
    }
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

  public onStepperCreated(): void {
    const profileTabIndex = 0;
    const experienceTabIndex = 1;
    const educationTabIndex = 2;
    const credentialTabIndex = 3;

    this.tab.enableTab(experienceTabIndex, false);
    this.tab.enableTab(educationTabIndex, false);
    this.tab.enableTab(credentialTabIndex, false);

    this.isCandidateCreated$
    .pipe(
      takeUntil(this.componentDestroy())
      )
    .subscribe((res) => {
      this.tab.enableTab(experienceTabIndex, !!res);
      this.tab.enableTab(educationTabIndex, !!res);      
      let alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
      if(((AlertIdEnum[AlertIdEnum['Candidate Credential Rejected']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
          || (AlertIdEnum[AlertIdEnum['Candidate Credential Reviewed']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase())
          && JSON.parse((localStorage.getItem('OrderId') || '0')) as number){
            setTimeout(() => {
              this.tab.enableTab(profileTabIndex, !!res);
              this.tab.select(credentialTabIndex);
            });
          }else{
            this.tab.enableTab(credentialTabIndex, !!res);
          }
    });

    this.tab.selected
    .pipe(
      takeUntil(this.componentDestroy())
      )
    .subscribe((event: SelectEventArgs) => {
      this.showSaveProfileButtons = event.selectedIndex === profileTabIndex;

      if (
        (event.selectedIndex === experienceTabIndex || event.selectedIndex === educationTabIndex) &&
        event.previousIndex !== profileTabIndex
      ) {
        this.tab.refresh();
      }
      let alertTitle = JSON.parse(localStorage.getItem('alertTitle') || '""') as string;
      if(event.previousIndex === credentialTabIndex
          && ((AlertIdEnum[AlertIdEnum['Candidate Credential Rejected']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
            || (AlertIdEnum[AlertIdEnum['Candidate Credential Reviewed']].trim()).toLowerCase() == (alertTitle.trim()).toLowerCase()
            )
          && JSON.parse((localStorage.getItem('OrderId') || '0')) as number){
            window.localStorage.setItem("OrderId", JSON.stringify(""));
            window.localStorage.setItem("alertTitle", JSON.stringify(""));
            window.localStorage.setItem("BussinessUnitID", JSON.stringify(""));
            this.reloadCredentials$.next(true);
      }
      this.cd.detectChanges();
    });

    if (this.route.snapshot.paramMap.get('id')) {
      this.store.dispatch(new GetCandidateById(parseInt(this.route.snapshot.paramMap.get('id') as string)));
      this.store.dispatch(new GetCandidatePhoto(parseInt(this.route.snapshot.paramMap.get('id') as string)));
    }
  }

  private generateCandidateForm(): void {
    this.candidateForm = this.fb.group({
      agency: CandidateAgencyComponent.createFormGroup(),
      generalInfo: CandidateGeneralInfoComponent.createFormGroup(),
      contactDetails: CandidateContactDetailsComponent.createFormGroup(),
      profSummary: CandidateProfessionalSummaryComponent.createFormGroup(),
    });
    this.candidateForm.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => this.cd.markForCheck());
  }

  private uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadCandidatePhoto(this.filesDetails[0] as Blob, businessUnitId, this.isInitialUpload));
    } else if (this.photo && this.isRemoveLogo) {
      this.store.dispatch(new RemoveCandidatePhoto(businessUnitId));
    }
  }

  //TODO: refactoring needed
  private patchAgencyFormValue({
    agencyId,
    firstName,
    middleName,
    lastName,
    email,
    dob,
    classification,
    profileStatus,
    candidateAgencyStatus,
    ssn,
    candidateProfileContactDetail,
    professionalSummary,
    candidateProfileSkills,
    candidateProfileRegions,
  }: Candidate) {
    this.candidateForm.get('generalInfo')?.patchValue({
      firstName,
      middleName,
      lastName,
      dob: DateTimeHelper.setCurrentTimeZone(dob),
      classification,
      profileStatus,
      candidateAgencyStatus,
      candidateProfileRegions,
      ssn: ssn ? this.getStringSsn(ssn) : null,
      candidateProfileSkills: candidateProfileSkills.map((skill) => skill.id),
    });
    if(candidateProfileContactDetail?.country === Country.Canada){
      this.customMaskChar = '>L0L >0L0';
    }else{
      this.customMaskChar = '00000';
    }
    this.candidateForm.get('contactDetails')?.patchValue({
      country: candidateProfileContactDetail?.country,
      state: candidateProfileContactDetail?.state,
      city: candidateProfileContactDetail?.city,
      zip: candidateProfileContactDetail?.zip,
      address1: candidateProfileContactDetail?.address1,
      address2: candidateProfileContactDetail?.address2,
      phone1: candidateProfileContactDetail?.phone1,
      phone2: candidateProfileContactDetail?.phone2,
      email,
    });
    this.candidateForm.get('profSummary')?.patchValue({ professionalSummary });
    this.candidateForm.get('agency')?.patchValue({ agencyId });
    this.cd.detectChanges();
  }

  //TODO: remove any
  private getCandidateRequestObj(formValue: any): Candidate {
    const agencyId = this.store.selectSnapshot(UserState.lastSelectedAgencyId);

    return {
      id: this.fetchedCandidate?.id,
      ...formValue.generalInfo,
      agencyId,
      email: formValue.contactDetails.email,
      professionalSummary: formValue.profSummary.professionalSummary,
      candidateProfileContactDetail: {
        candidateProfileId: this.fetchedCandidate && this.fetchedCandidate?.candidateProfileContactDetail? this.fetchedCandidate?.candidateProfileContactDetail?.candidateProfileId:this.fetchedCandidate?.id,
        phoneType1: this.fetchedCandidate?.candidateProfileContactDetail.phoneType1,
        phoneType2: this.fetchedCandidate?.candidateProfileContactDetail.phoneType2,
        country: formValue.contactDetails.country,
        state: formValue.contactDetails.state,
        city: formValue.contactDetails.city,
        zip: formValue.contactDetails.zip,
        address1: formValue.contactDetails.address1,
        address2: formValue.contactDetails.address2,
        phone1: formValue.contactDetails.phone1,
        phone2: formValue.contactDetails.phone2,
      },
    };
  }

  private pagePermissions(): void {
    const location = this.location.getState() as { readonly: boolean; isRedirectFromOrder: boolean };

    this.route.data
    .pipe(
      filter((data) => data['readonly']),
      takeUntil(this.componentDestroy())
    )
    .subscribe(() => {
      this.readonlyMode = true;
      this.isCredentialStep = true;
      this.candidateForm.disable();
    });

    if (location.readonly) {
      this.candidateForm.disable();
      this.readonlyMode = true;
      this.isCredentialStep = location.isRedirectFromOrder ?? false;
    }
  }

  private navigateToCandidates(): void {
    const locationState = this.location.getState() as {
      orderId: number;
      pageToBack: string;
      isNavigateFromCandidateDetails: boolean;
      orderManagementPagerState?: OrderManagementPagerState | null;
    };
    const navigationStateString = this.globalWindow.localStorage.getItem('navigationState');
    const navigationState = navigationStateString ? JSON.parse(navigationStateString) : null;
    const location = navigationState ? Object.assign(locationState, navigationState) : locationState;
    this.globalWindow.localStorage.removeItem('navigationState');

    const selectedTab = this.store.selectSnapshot(CandidateDetailsState.navigationTab);
    switch (true) {
      case location.orderId && !location.isNavigateFromCandidateDetails:
        this.router.navigate([location.pageToBack], { state: { orderId: location.orderId, orderManagementPagerState: location.orderManagementPagerState,candidateJobId:this.candidateJobId, organizationId:this.organizationId,clearToStartValue:this.clearToStartValue } });
        const selectedNavigation = this.store.selectSnapshot(OrderManagementContentState.navigationTab);
        this.store.dispatch(new SelectNavigationTab(selectedNavigation?.current));
        break;
      case location.orderId && location.isNavigateFromCandidateDetails:
        this.router.navigate([location.pageToBack]);
        this.store.dispatch(new SelectNavigation(selectedTab.active, null, true));
        break;
      case location.orderId && location.isNavigatedFromOrganizationArea:
          this.router.navigate([location.pageToBack]);
          this.store.dispatch(new SelectNavigation(selectedTab.active, null, true));
          break;
      default:
        this.router.navigate(['/agency/candidates']);
    }
  }

  private getStringSsn(ssn: any): string {
    const stringSsn = String(ssn);
    if (stringSsn.length >= 9) {
      this.maskSSNPattern = "AAA-AA-0000";;
      this.maskedSSN= stringSsn;
      return "XXX-XX-" + stringSsn.slice(-4);
    } else {
      return this.getStringSsn(`0${ssn}`);
    }
  }

  private setCredentialParams(): void {
    const { isNavigatedFromOrganizationArea, candidateStatus, orderId } = this.credentialStorage.getCredentialParams();

    this.isNavigatedFromOrganizationArea = isNavigatedFromOrganizationArea as boolean;
    this.candidateStatus = candidateStatus as ApplicantStatus;
    this.orderId = orderId as number;
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(distinctUntilChanged(), takeUntil(this.componentDestroy()))
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }

  private selectCredentialsTab(): void {
    const credentialTabIndex = 3;
    setTimeout(() => this.tab.select(credentialTabIndex));
  }

  private subscribeOnCandidateCredentialResponse(): void {
    this.candidateCredentialResponse$
      .pipe(
        filter(response => !!response && this.isCandidateAssigned),
        takeUntil(this.componentDestroy())
      )
      .subscribe((response: CandidateCredentialResponse) => {
        this.candidateJob = response.jobTitle;

        if (positionIdStatuses.includes(this.candidateStatus)) {
          this.orderOrPositionId = getCandidatePositionId(response.organizationPrefix, response.publicId, response.positionId);
          this.orderOrPositionTitle = 'Position';
          const navigationStateString = this.globalWindow.localStorage.getItem('navigationState');
          const navigationState = navigationStateString ? JSON.parse(navigationStateString) : null;
          this.organizationId = navigationState.organizationId;
          this.candidateJobId = navigationState.candidateJobId;
          if(navigationState){
            this.isEnableClearedToStartForAcceptedCandidates$.next(false);
            this.isClearedToStartEnable =  this.candidateStatus == ApplicantStatus.Accepted && navigationState.readonly? false : true;
            this.clearedToStart = navigationState.clearedToStart;
            this.settingService
              .getViewSettingKey(
                OrganizationSettingKeys.EnableClearedToStartForAcceptedCandidates,
                OrganizationalHierarchy.Organization,
                navigationState.organizationId,
                navigationState.organizationId,
                false,
                navigationState.candidateJobId
              ).pipe(takeUntil(this.componentDestroy()))
              .subscribe(({ EnableClearedToStartForAcceptedCandidates }) => {
                this.isEnableClearedToStartForAcceptedCandidates$.next(JSON.parse(EnableClearedToStartForAcceptedCandidates));
              });
          }
        } else {
          this.orderOrPositionId = getOrderPublicId(response.organizationPrefix, response.publicId);
          this.orderOrPositionTitle = 'Order';
        }
      });
  }

  updatedSSNValue(val:string): void {
    this.maskedSSN = val;
  }

  onClearToStartValueChange(event:boolean): void{
    this.clearToStartValue = event;
  }

  private saveCandidateProfile(candidate: Candidate): void {
    this.isInitialUpload = !candidate.id;
    this.store.dispatch(new SaveCandidate(candidate))
    .pipe(
        filter(() => !candidate.id),
        switchMap(() => this.candidateProfile$),
        filter((candidateProfile) => !!candidateProfile?.id),
        take(1),
        map((candidateProfile) => {
          return ({
            ...candidateProfile,
            candidateProfileSkills: candidateProfile.candidateProfileSkills.map(
              (id) => ({ id } as unknown as JobDistributionMasterSkills)
            ),
          });
        }),
      )
      .subscribe((candidateProfile) => {
        this.patchAgencyFormValue(candidateProfile);
        this.getCandidateLoginSetting(candidateProfile.id as number);
        this.cd.detectChanges();
      });
  }
}
