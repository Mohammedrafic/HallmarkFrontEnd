import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SaveStatus } from '../../store/document-viewer.actions';
import { Store } from '@ngxs/store';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { NO_RECORD } from '@shared/constants/messages';

@Component({
  selector: 'app-status-component',
  templateUrl: './status-component.component.html',
  styleUrls: ['./status-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponentComponent implements OnInit {
  statusForm = new FormGroup({});
  public orderId: number;
  public statusText: string;
  public jobId: number;
  private unsubscribe$: Subject<void> = new Subject();
  public UserId: string;
  public ordId: any;

  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private store: Store) {}

  ngOnInit(): void {
    this.subscribeEvent();
    this.statusForm = this.fb.group({
      orderId: ['', Validators.required],
    });
  }

  private subscribeEvent(): void {
    this.activeRoute.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      if (params['orderId'] && params['statusText']) {
        this.orderId = params['orderId'];
        this.statusText = params['statusText'];
        this.UserId = params['userid'];
        this.jobId = params['jobid'];
        this.ordId = params['OrdId'];
      }
    });
  }

  onSubmit() {
    if (this.statusForm.valid) {
      if (this.statusForm.value.orderId === this.ordId) {
        if (this.statusText === 'shortlisted') {
          this.store.dispatch(
            new SaveStatus({
              orderId: this.orderId as number,
              jobId: this.jobId as number,
              nextApplicantStatus: {
                applicantStatus: CandidatStatus.Shortlisted,
                statusText: this.statusText,
              },
              UserId: this.UserId,
            })
          );
        } else if (this.statusText === 'offered') {
          this.store.dispatch(
            new SaveStatus({
              orderId: this.orderId as number,
              jobId: this.jobId as number,
              nextApplicantStatus: {
                applicantStatus: CandidatStatus.Offered,
                statusText: this.statusText,
              },
              UserId: this.UserId,
            })
          );
        } else {
          this.store.dispatch(
            new SaveStatus({
              orderId: this.orderId as number,
              jobId: this.jobId as number,
              nextApplicantStatus: {
                applicantStatus: CandidatStatus.Rejected,
                statusText: this.statusText,
              },
              UserId: this.UserId,
            })
          );
        }
      }else{
        this.store.dispatch(new ShowToast(MessageTypes.Warning, NO_RECORD))
      }
    }
  }
}
