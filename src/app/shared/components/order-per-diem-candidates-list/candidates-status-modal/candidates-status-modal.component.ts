import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';
import { GetRejectReasonsForOrganisation } from '@client/store/order-managment-content.actions';
import { Select, Store } from '@ngxs/store';
import { RejectReason } from '@shared/models/reject-reason.model';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';

@Component({
  selector: 'app-candidates-status-modal',
  templateUrl: './candidates-status-modal.component.html',
  styleUrls: ['./candidates-status-modal.component.scss'],
})
export class CandidatesStatusModalComponent implements OnInit, OnDestroy {
  @Select(OrderManagementContentState.rejectionReasonsList)
  rejectionReasonsList$: Observable<RejectReason[]>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accordionElement') accordionComponent: AccordionComponent;

  @Input() candidate: OrderCandidatesList;
  @Input() openEvent: Subject<boolean>;
  @Input() isAgency: boolean = false;

  @Input() set candidateJob(value: OrderCandidateJob) {
    this.candidateJobList = value;
    this.patchForm(value);
  }

  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public form: FormGroup;
  public openRejectDialog = new Subject<boolean>();
  public rejectReasons: RejectReason[] = [];

  private unsubscribe$: Subject<void> = new Subject();
  private candidateJobList: OrderCandidateJob;

  constructor(private fb: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.createForm();
    this.subscribeOnReasonsList();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public closeDialog(): void {
    this.sideDialog.hide();
    this.openEvent.next(false);
  }

  public onReject(): void {
    this.store.dispatch(new GetRejectReasonsForOrganisation());
    this.openRejectDialog.next(true);
  }

  public onOnboard(): void {
    if (this.form.valid && this.candidateJobList) {
      const value = this.form.getRawValue();
      //TODO: uncomment code, whe be is done
      /*this.store.dispatch(new UpdateOrganisationCandidateJob({})).subscribe(() => {
        //add action to update list and grid
      });*/
    }
  }

  public onRejectCandidate(event: { rejectReason: number }): void {
    if (this.candidateJobList) {
      const payload = {
        organizationId: this.candidateJobList.organizationId,
        jobId: this.candidateJobList.jobId,
        rejectReasonId: event.rejectReason,
      };

      //TODO: uncomment code, whe be is done
      //this.store.dispatch(new RejectCandidateJob(payload));
      this.closeDialog();
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((isOpen: boolean) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      jobId: new FormControl(''),
      locationName: new FormControl(''),
      department: new FormControl(''),
      skill: new FormControl(''),
      clockId: new FormControl('', [Validators.maxLength(50)]),
      allow: new FormControl(false),
    });
  }

  private subscribeOnReasonsList(): void {
    this.rejectionReasonsList$.pipe(takeUntil(this.unsubscribe$)).subscribe((reasons: RejectReason[]) => {
      this.rejectReasons = reasons;
    });
  }

  private patchForm(value: OrderCandidateJob): void {
    this.form?.patchValue({
      jobId: value.orderId,
      locationName: value.order.locationName,
      department: value.order.departmentName,
      skill: value.order.skillName,
      clockId: value.clockId,
      allow: value.allowDeployCredentials,
    });
  }
}
