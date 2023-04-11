import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';

import { Store } from '@ngxs/store';
import { Subject, takeUntil, take, switchMap, tap, filter } from 'rxjs';

import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { AbstractPermission } from '@shared/helpers/permissions';
import { AvailabilityRestriction } from '../../interfaces';
import { AvailabilityApiService } from '../../services/availability-api.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { AvailabilityRestrictionColumnDef, PagerConfig } from '../../constants';
import { PageOfCollections } from '@shared/models/page.model';

@Component({
  selector: 'app-availability-restriction',
  templateUrl: './availability-restriction.component.html',
  styleUrls: ['./availability-restriction.component.scss'],
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
  public pageNumber = 1;
  public pageSize = 5;
  public gridTitle = 'Availability Restriction';
  public customRowsPerPageDropDownObject = PagerConfig;
  public employeeId: number;
  public availabilityRestrictions: AvailabilityRestriction[] = [];
  public totalCount = 0;
  public readonly dialogSubject$: Subject<{ isOpen: boolean, data?: AvailabilityRestriction }> = new Subject();

  constructor(
    protected override store: Store,
    private readonly availabilityApiService: AvailabilityApiService,
    private readonly confirmService: ConfirmService,
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
    if (pageNumber && this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      this.getAvailabilityRestrictions();
    }
  }

  public saveAvailabilityRestriction(event: AvailabilityRestriction): void {
    this.availabilityApiService.saveAvailabilityRestriction(event)
      .pipe(
        switchMap(() => {
          return this.availabilityApiService.getAvailabilityRestrictions(this.employeeId, this.pageNumber);
        }),
        tap((data) => {
          this.dataSampling(data);
        }),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.dialogSubject$.next({ isOpen: false });
        this.cdr.markForCheck();
      });
  }

  private getAvailabilityRestrictions(): void {
    this.availabilityApiService.getAvailabilityRestrictions(this.employeeId, this.pageNumber)
      .pipe(take(1))
      .subscribe((data) => {
        this.dataSampling(data);
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

  public dataSampling(data: PageOfCollections<AvailabilityRestriction>): void {
    this.availabilityRestrictions = data.items;
    this.totalCount = data.totalCount;
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
        switchMap(() => this.availabilityApiService.getAvailabilityRestrictions(this.employeeId, this.pageNumber)),
        tap((data) => {
          this.dataSampling(data);
        }),
        take(1)
      )
      .subscribe(() => {
        this.dialogSubject$.next({ isOpen: false });
        this.cdr.markForCheck();
      });
  }
}
