import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SaveStatus } from '../../store/document-viewer.actions';
import { Store } from '@ngxs/store';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-status-component',
  templateUrl: './status-component.component.html',
  styleUrls: ['./status-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponentComponent implements OnInit {
  statusForm = new FormGroup({});
  orderId: number;
  statusText: string;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.subscribeEvent();
    this.statusForm = this.fb.group({
      jobId: ['', Validators.required],
    });
  }

  private subscribeEvent(): void {
    this.activeRoute.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      if (params['orderId'] && params['statusText']) {
        this.orderId = params['orderId'];
        this.statusText = params['statusText'];
      }
    });
  }

  onSubmit() {
    if (this.statusForm.valid) {
      if (this.statusText === 'shortlisted') {
        this.store.dispatch(
          new SaveStatus(this.orderId, this.statusForm.value.jobId, this.statusText, CandidatStatus.Shortlisted)
        );
      } else if (this.statusText === 'offered') {
        this.store.dispatch(
          new SaveStatus(this.orderId, this.statusForm.value.jobId, this.statusText, CandidatStatus.Offered)
        );
      } else {
        this.store.dispatch(
          new SaveStatus(this.orderId, this.statusForm.value.jobId, this.statusText, CandidatStatus.Rejected)
        );
      }
    }
  }

  // private watchForCandidateActions(): void {
  //   this.actions$
  //     .pipe(ofActionSuccessful(SaveCandidatesCredentialSucceeded), takeUntil(this.unsubscribe$))
  //     .subscribe((credential: { payload: CandidateCredential }) => {
  //       const isEdit = this.isEdit;
  //       this.credentialId = credential.payload.id as number;
  //       this.isCredentialExists = credential.payload.isCredentialExists as boolean;
  //       this.disabledCopy = false;
  //       this.selectedItems = [];

  //       if (this.removeExistingFiles) {
  //         this.store.dispatch(new UploadCredentialFiles([], this.credentialId));
  //         return;
  //       }

  //       if (this.isCredentialExists) {
  //         this.store.dispatch(new ShowToast(MessageTypes.Success, !isEdit ? RECORD_ADD : RECORD_MODIFIED));
  //       } else {
  //         this.store.dispatch(new ShowToast(MessageTypes.Warning, RECORD_UNSAVED));
  //       }

  //       this.store.dispatch(new GetCandidatesCredentialByPage(this.credentialRequestParams, this.candidateProfileId));
  //       this.addCredentialForm.markAsPristine();
  //       this.closeDialog();
  //     });

  //   this.actions$
  //     .pipe(ofActionSuccessful(SaveCandidatesCredentialFailed), takeUntil(this.unsubscribe$))
  //     .subscribe(() => {
  //       this.disabledCopy = false;
  //     });
  // }
}
