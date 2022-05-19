import { CandidateAgencyComponent } from "@agency/candidates/add-edit-candidate/candidate-agency/candidate-agency.component";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { CreatedCandidateStatus } from "@shared/enums/status";
import { SelectEventArgs, TabComponent } from "@syncfusion/ej2-angular-navigations";
import { filter, Observable, Subject, takeUntil } from "rxjs";

import { CandidateGeneralInfoComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-general-info/candidate-general-info.component";
import { CandidateProfessionalSummaryComponent } from "src/app/agency/candidates/add-edit-candidate/candidate-professional-summary/candidate-professional-summary.component";
import { CandidateState } from "src/app/agency/store/candidate.state";
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from "src/app/shared/constants/messages";
import { ConfirmService } from "src/app/shared/services/confirm.service";
import { CandidateContactDetailsComponent } from "./candidate-contact-details/candidate-contact-details.component";
import { SetHeaderState } from "src/app/store/app.actions";
import {
  GetCandidateById,
  GetCandidateByIdSucceeded,
  GetCandidatePhoto,
  GetCandidatePhotoSucceeded,
  RemoveCandidateFromStore,
  SaveCandidate,
  SaveCandidateSucceeded,
  UploadCandidatePhoto
} from '../../store/candidate.actions';
import { Candidate } from 'src/app/shared/models/candidate.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-candidate',
  templateUrl: './add-edit-candidate.component.html',
  styleUrls: ['./add-edit-candidate.component.scss']
})
export class AddEditCandidateComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') tab: TabComponent;

  public showSaveProfileButtons = true;
  public candidateForm: FormGroup;
  public title = 'Add';
  public photo: Blob | null = null;

  private filesDetails : Blob[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  private fetchedCandidate: Candidate;

  @Select(CandidateState.isCandidateCreated)
  public isCandidateCreated$: Observable<boolean>;

  constructor(private store: Store,
              private fb: FormBuilder,
              private actions$: Actions,
              private router: Router,
              private route: ActivatedRoute,
              private confirmService: ConfirmService) {
    store.dispatch(new SetHeaderState({ title: 'Candidates', iconName: 'clock' }));
  }

  ngOnInit(): void {
    this.generateCandidateForm();

    this.actions$.pipe(ofActionSuccessful(SaveCandidateSucceeded)).subscribe((candidate: { payload: Candidate }) => {
      this.fetchedCandidate = candidate.payload;
      this.uploadImages(this.fetchedCandidate.id as number);
      this.candidateForm.markAsPristine();
    });
    this.actions$.pipe(ofActionSuccessful(GetCandidateByIdSucceeded)).subscribe((candidate: { payload: Candidate }) => {
      this.fetchedCandidate = candidate.payload;
      this.patchAgencyFormValue(this.fetchedCandidate);
    })
    this.actions$.pipe(ofActionSuccessful(GetCandidatePhotoSucceeded)).subscribe((photo: { payload: Blob }) => {
      this.photo = photo.payload;
    });

    if (this.route.snapshot.paramMap.get('id')) {
      this.title = 'Edit';
      this.store.dispatch(new GetCandidateById(parseInt(this.route.snapshot.paramMap.get('id') as string)));
      this.store.dispatch(new GetCandidatePhoto(parseInt(this.route.snapshot.paramMap.get('id') as string)));
    }

  }

  ngOnDestroy(): void {
    this.store.dispatch(new RemoveCandidateFromStore());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public clearForm(): void {
    this.candidateForm.reset();
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
      const candidate = this.getCandidateRequestObj(this.candidateForm.getRawValue());

      if (!candidate.id) {
        candidate.candidateAgencyStatus = CreatedCandidateStatus.Active;
        candidate.profileStatus = CreatedCandidateStatus.Active;
        this.candidateForm.get('generalInfo')?.patchValue({
          profileStatus: CreatedCandidateStatus.Active,
          candidateAgencyStatus: CreatedCandidateStatus.Active
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
    } else {
      this.filesDetails = [];
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

    this.isCandidateCreated$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      if (res) {
        this.tab.enableTab(experienceTabIndex, true);
        this.tab.enableTab(educationTabIndex, true);
        this.tab.enableTab(credentialTabIndex, true);
      } else {
        this.tab.enableTab(experienceTabIndex, false);
        this.tab.enableTab(educationTabIndex, false);
        this.tab.enableTab(credentialTabIndex, false);
      }
    });

    this.tab.selected.pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: SelectEventArgs) => {
        this.showSaveProfileButtons = event.selectedIndex === profileTabIndex;

        if (
          (event.selectedIndex === experienceTabIndex || event.selectedIndex === educationTabIndex)
          && event.previousIndex !== profileTabIndex
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
    }
  }

  private patchAgencyFormValue({ agencyId, firstName, middleName, lastName, email, dob, classification, profileStatus,
                                 candidateAgencyStatus, ssn, candidateProfileContactDetail, professionalSummary, candidateProfileSkills }: Candidate) {
    this.candidateForm.get('generalInfo')?.patchValue({
      firstName, middleName, lastName, dob,
      classification, profileStatus, candidateAgencyStatus, ssn,
      candidateProfileSkills: candidateProfileSkills.map(skill => skill.id),
    });
    this.candidateForm.get('contactDetails')?.patchValue({
      country: candidateProfileContactDetail.country,
      state: candidateProfileContactDetail.state,
      city: candidateProfileContactDetail.city,
      zip: candidateProfileContactDetail.zip,
      address1: candidateProfileContactDetail.address1,
      address2: candidateProfileContactDetail.address2,
      phone1: candidateProfileContactDetail.phone1,
      phone2: candidateProfileContactDetail.phone2,
      email
    });
    this.candidateForm.get('profSummary')?.patchValue({ professionalSummary });
    this.candidateForm.get('agency')?.patchValue({ agencyId });
  }

  private getCandidateRequestObj(formValue: any): Candidate {
    return {
      id: this.fetchedCandidate?.id,
      ...formValue.generalInfo,
      agencyId: formValue.agency.agencyId,
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
        phone2: formValue.contactDetails.phone2
      }
    };
  }

  private navigateToCandidates(): void {
    this.router.navigate(['/agency/candidates']);
  }
}
