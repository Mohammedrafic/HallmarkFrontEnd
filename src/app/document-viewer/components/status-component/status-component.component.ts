import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { Statuses } from '../../store/document-viewer.state.model';
import { DocumentViewerService } from '../../services/document-viewer.service';
// import { ShowToast } from 'src/app/store/app.actions';
// import { MessageTypes } from '@shared/enums/message-types';
// import { NO_RECORD } from '@shared/constants/messages';

@Component({
  selector: 'app-status-component',
  templateUrl: './status-component.component.html',
  styleUrls: ['./status-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponentComponent implements OnInit {
  cssClass: string;
  statusForm = new FormGroup({});
  public orderId: number;
  public statusText: string;
  public jobId: number;
  private unsubscribe$: Subject<void> = new Subject();
  public UserId: string;
  public ordId: any;
  protected componentDestroy: () => Observable<unknown>;

  constructor(
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private documentViewerService: DocumentViewerService
  ) {}

  ngOnInit(): void {
    this.subscribeEvent();
    this.statusForm = this.fb.group({
      orderId: ['', Validators.required],
    });
  }

  @ViewChild('toastObj') toastObj: ToastComponent;

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
          this.saveData({
            orderId: this.orderId as number,
            jobId: this.jobId as number,
            nextApplicantStatus: {
              applicantStatus: CandidatStatus.Shortlisted,
              statusText: this.statusText,
            },
            UserId: this.UserId,
          });
        } else if (this.statusText === 'offered') {
          this.saveData({
            orderId: this.orderId as number,
            jobId: this.jobId as number,
            nextApplicantStatus: {
              applicantStatus: CandidatStatus.Offered,
              statusText: this.statusText,
            },
            UserId: this.UserId,
          });
        } else {
          this.saveData({
            orderId: this.orderId as number,
            jobId: this.jobId as number,
            nextApplicantStatus: {
              applicantStatus: CandidatStatus.Rejected,
              statusText: this.statusText,
            },
            UserId: this.UserId,
          });
        }
      } else {
        this.cssClass = 'warning-toast';
        this.toastObj.content = '<div>' + 'Entered OrderID was not correct' + '</div',
        this.toastObj.show();
      }
    }
  }

  private saveData(data: Statuses):void{
    this.documentViewerService.saveStatus(data).pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        this.cssClass = 'success-toast';
        this.toastObj.content = '<div>' + 'Candidate has been updated' + '</div',
        this.toastObj.show();
      },
      error: (error) => {
        this.cssClass = 'error-toast';
        const errorMessage = error.error.errors.AlreadyUpdated ? error.error.errors.AlreadyUpdated[0] : error.error.errors.TimeLimitExceeded[0];
        this.toastObj.content = '<div>' + errorMessage +'</div',
        this.toastObj.show();
      },
    });
  }
}
