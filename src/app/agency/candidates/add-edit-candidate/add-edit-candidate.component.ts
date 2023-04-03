import { positionIdStatuses } from "@agency/candidates/add-edit-candidate/add-edit-candidate.constants";
import { CandidateAgencyComponent } from '@agency/candidates/add-edit-candidate/candidate-agency/candidate-agency.component';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectNavigationTab } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OutsideZone } from "@core/decorators";

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { SelectNavigation } from '@shared/components/candidate-details/store/candidate.actions';
import { CandidateDetailsState } from '@shared/components/candidate-details/store/candidate.state';
import { getCandidatePositionId, getOrderPublicId } from "@shared/components/order-candidate-list/order-candidate-list.utils";
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ApplicantStatus } from "@shared/enums/applicant-status.enum";
import { CreatedCandidateStatus } from '@shared/enums/status';
import { CredentialStorageFacadeService } from "@agency/services/credential-storage-facade.service";
import { CandidateCredentialResponse } from "@shared/models/candidate-credential.model";
import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { distinctUntilChanged, filter, Observable, takeUntil } from 'rxjs';
import { CandidateGeneralInfoComponent } from 'src/app/agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component';
import { CandidateProfessionalSummaryComponent } from 'src/app/agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { Candidate, OrderManagementPagerState } from 'src/app/shared/models/candidate.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import {
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

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss'],
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

  private filesDetails: Blob[] = [];
  private isRemoveLogo: boolean = false;
  public customMaskChar : string = '';


  public get isCandidateAssigned(): boolean {
    return !!this.orderId && !!this.candidateStatus;
  }

  @Select(CandidateState.isCandidateCreated)
  public isCandidateCreated$: Observable<boolean>;

  @Select(CandidateState.candidateCredential)
  private candidateCredentialResponse$: Observable<CandidateCredentialResponse>;

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
    private ngZone: NgZone,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
  ) {
    super(store);
    store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
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
      });
    this.actions$
      .pipe(takeUntil(this.componentDestroy()), ofActionSuccessful(GetCandidateByIdSucceeded))
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
      });

    if (this.route.snapshot.paramMap.get('id')) {
      this.title = 'Edit';
      this.store.dispatch(new GetCandidateById(parseInt(this.route.snapshot.paramMap.get('id') as string)));
      this.store.dispatch(new GetCandidatePhoto(parseInt(this.route.snapshot.paramMap.get('id') as string)));
    }else{
      this.customMaskChar = '00000';
    }
    this.pagePermissions();
    this.subscribeOnCandidateCredentialResponse();
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
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
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
        dob: DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(candidate.dob)),
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

      this.store.dispatch(new SaveCandidate(candidate));
    } else {
      this.candidateForm.markAllAsTouched();
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
      this.tab.enableTab(credentialTabIndex, !!res);
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
    });
  }

  private generateCandidateForm(): void {
    this.candidateForm = this.fb.group({
      agency: CandidateAgencyComponent.createFormGroup(),
      generalInfo: CandidateGeneralInfoComponent.createFormGroup(),
      contactDetails: CandidateContactDetailsComponent.createFormGroup(),
      profSummary: CandidateProfessionalSummaryComponent.createFormGroup(),
    });
  }

  private uploadImages(businessUnitId: number): void {
    if (this.filesDetails.length) {
      this.store.dispatch(new UploadCandidatePhoto(this.filesDetails[0] as Blob, businessUnitId));
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
    candidateProfileRegions
  }: Candidate) {
    this.candidateForm.get('generalInfo')?.patchValue({
      firstName,
      middleName,
      lastName,
      dob: DateTimeHelper.convertDateToUtc(dob),
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
        candidateProfileId: this.fetchedCandidate?.candidateProfileContactDetail.candidateProfileId,
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

    switch (true) {
      case location.orderId && !location.isNavigateFromCandidateDetails:
        this.router.navigate([location.pageToBack], { state: { orderId: location.orderId, orderManagementPagerState: location.orderManagementPagerState } });
        const selectedNavigation = this.store.selectSnapshot(OrderManagementContentState.navigationTab);
        this.store.dispatch(new SelectNavigationTab(selectedNavigation?.current));
        break;
      case location.orderId && location.isNavigateFromCandidateDetails:
        this.router.navigate([location.pageToBack]);
        const selectedTab = this.store.selectSnapshot(CandidateDetailsState.navigationTab);
        this.store.dispatch(new SelectNavigation(selectedTab.active, null, true));
        break;
      default:
        this.router.navigate(['/agency/candidates']);
    }
  }

  private getStringSsn(ssn: any): string {
    const stringSsn = String(ssn);
    if (stringSsn.length >= 9) {
      return stringSsn;
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

  @OutsideZone
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
        } else {
          this.orderOrPositionId = getOrderPublicId(response.organizationPrefix, response.publicId);
          this.orderOrPositionTitle = 'Order';
        }
      });
  }
}
