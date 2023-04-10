import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UserPermissions } from '@core/enums';
import { Permission } from '@core/interface';
import { Select, Store } from '@ngxs/store';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, RECORD_DELETE } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { MessageTypes } from '@shared/enums/message-types';
import { ConfirmService } from '@shared/services/confirm.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { catchError, filter, Observable, Subject, takeUntil, tap } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { CandidateWorkCommitment, CandidateWorkCommitmentsPage } from '../../models/candidate-work-commitment.model';
import { CandidateWorkCommitmentService } from '../../services/candidate-work-commitment.service';
import { CandidateWorkCommitmentColumnDef } from './candidate-work-commitment-grid.constants';

@Component({
  selector: 'app-candidate-work-commitment-grid',
  templateUrl: './candidate-work-commitment-grid.component.html',
  styleUrls: ['./candidate-work-commitment-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateWorkCommitmentGridComponent extends DestroyableDirective implements OnInit {
  @Input() public dialogSubject$: Subject<{ isOpen: boolean, isEdit: boolean, commitment?: CandidateWorkCommitment }>;
  @Input() public refreshSubject$: Subject<void>;
  @Input() set employeeIdVal(value: number | null) {
    if (value) {
      this.employeeId = value;
      this.dispatchNewPage();
    }
  }
  
  @Select(UserState.userPermission)
  currentUserPermissions$: Observable<Permission>;

  public employeeId: number;
  public columnDef: ColumnDefinitionModel[];
  public rowSelection = undefined;
  public customRowsPerPageDropDownObject = [ { text: '5 Rows', value: 5 } ];
  public pageNumber: number = 1;
  public pageSize: number = 5;
  public candidateWorkCommitmentsPage: CandidateWorkCommitmentsPage;

  public readonly userPermissions = UserPermissions;

  constructor(
    private cd: ChangeDetectorRef,
    private candidateWorkCommitmentService: CandidateWorkCommitmentService,
    private store: Store,
    private confirmService: ConfirmService,
  ) {
    super();
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    this.columnDef = CandidateWorkCommitmentColumnDef(this.editCommitment.bind(this), this.deleteCommitment.bind(this), todayDate);
  }

  public ngOnInit(): void {
    this.subscribeOnPageRefreshing();
  }

  private dispatchNewPage(): void {
    this.candidateWorkCommitmentService.getCandidateWorkCommitmentByPage(this.pageNumber, this.pageSize, this.employeeId).subscribe((page) => {
      this.candidateWorkCommitmentsPage = page;
      this.cd.markForCheck();
    });
  }

  private subscribeOnPageRefreshing(): void {
    this.refreshSubject$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dispatchNewPage();
    });
  }

  public addCommitment(): void {
    this.dialogSubject$.next({ isOpen: true, isEdit: false });
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      this.dispatchNewPage();
    }
  }

  public editCommitment(commitment: CandidateWorkCommitment): void {
    this.dialogSubject$.next({ isOpen: true, isEdit: true, commitment: commitment });
  }

  private deleteCommitmentHandler(commitment: CandidateWorkCommitment): void {
    this.candidateWorkCommitmentService.deleteCandidateWorkCommitmentById(commitment.id as number).pipe(
      tap(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        this.refreshSubject$.next();
      }),
      catchError((error: HttpErrorResponse) => {
        return this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    ).subscribe();
  }

  public deleteCommitment(commitment: CandidateWorkCommitment): void {
    this.confirmService
    .confirm(DELETE_RECORD_TEXT, {
      title: DELETE_RECORD_TITLE,
      okButtonLabel: 'Delete',
      okButtonClass: 'delete-button',
    }).pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    )
    .subscribe(() => {
      this.deleteCommitmentHandler(commitment);
    });
  }
}
