import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';

import { Store } from '@ngxs/store';
import { Subject, take, switchMap, tap, filter } from 'rxjs';

import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { AbstractPermission } from '@shared/helpers/permissions';
import { AvailRestrictDialogData, AvailabilityRestriction } from '../../interfaces';
import { AvailabilityApiService } from '../../services/availability-api.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from '@shared/constants';
import { AvailabilityRestrictionColumnDef, PagerConfig } from '../../constants';
import { PageOfCollections } from '@shared/models/page.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { CandidatesService } from '@client/candidates/services/candidates.service';

@Component({
  selector: 'app-availability-restriction',
  templateUrl: './availability-restriction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityRestrictionComponent extends AbstractPermission implements OnInit {

  @Input() set employeeIdVal(value: number | null) {
    if (value) {
      this.employeeId = value;
      this.getAvailabilityRestrictions();
    }
  }

  public columnDef: ColumnDefinitionModel[];
  public rowSelection = undefined;
  public gridTitle = 'Availability Restriction';
  public customRowsPerPageDropDownObject = PagerConfig;
  public employeeId: number;
  public availabilityRestrictions: AvailabilityRestriction[] = [];
  public pagingData = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
  };
  public readonly dialogSubject$: Subject<AvailRestrictDialogData> = new Subject();

  constructor(
    protected override store: Store,
    private readonly availabilityApiService: AvailabilityApiService,
    private readonly confirmService: ConfirmService,
    private readonly candidateService: CandidatesService,
    private readonly cdr: ChangeDetectorRef,
  ) { super(store); }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.initColumnsDefinition();
  }

  public addRestriction(): void {
    this.dialogSubject$.next({ isOpen: true });
  }

  public handleChangePage(pageNumber: number): void {
    if (pageNumber && this.pagingData.pageNumber !== pageNumber) {
      this.pagingData.pageNumber = pageNumber;
      this.getAvailabilityRestrictions();
    }
  }

  public saveAvailabilityRestriction(event: AvailabilityRestriction): void {
    this.availabilityApiService.saveAvailabilityRestriction(event)
      .pipe(
        switchMap(() => {
          return this.availabilityApiService.getAvailabilityRestrictions(this.employeeId, this.pagingData.pageNumber);
        }),
        tap((data) => {
          this.extractData(data);
        }),
        take(1)
      )
      .subscribe(() => {
        const toastMessage = event.id ? RECORD_MODIFIED : RECORD_ADDED;

        this.store.dispatch(new ShowToast(MessageTypes.Success, toastMessage));
        this.dialogSubject$.next({ isOpen: false });
        this.cdr.markForCheck();
      });
  }

  private getAvailabilityRestrictions(): void {
    this.availabilityApiService.getAvailabilityRestrictions(this.employeeId, this.pagingData.pageNumber)
      .pipe(take(1))
      .subscribe((data) => {
        this.extractData(data);
        this.cdr.markForCheck();
      });
  }

  private initColumnsDefinition(): void {
    this.columnDef = AvailabilityRestrictionColumnDef(
      this.editRestriction.bind(this),
      this.deleteRestriction.bind(this)
    );
  }

  private editRestriction(availabilityRestriction: AvailabilityRestriction): void {
    this.dialogSubject$.next({ isOpen: true, data: availabilityRestriction });
  }

  public extractData(data: PageOfCollections<AvailabilityRestriction>): void {
    this.availabilityRestrictions = data.items;
    this.pagingData.totalCount = data.totalCount;
  }

  private deleteRestriction(id: number): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: DELETE_RECORD_TITLE,
      }).pipe(
        filter((confirm) => !!confirm),
        switchMap(() => this.availabilityApiService.deleteAvailabilityRestriction(id)),
        switchMap(() => {
          this.pagingData.pageNumber = this.candidateService.getGridPageNumber(
            this.availabilityRestrictions.length,
            this.pagingData.pageNumber,
          );

          return this.availabilityApiService.getAvailabilityRestrictions(this.employeeId, this.pagingData.pageNumber);
        }),
        take(1)
      )
      .subscribe((data) => {
        this.extractData(data);
        this.dialogSubject$.next({ isOpen: false });
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        this.cdr.markForCheck();
      });
  }
}
