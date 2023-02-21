import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TakeUntilDestroy } from '@core/decorators';
import { Store } from '@ngxs/store';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-orientation-grid',
  templateUrl: './orientation-grid.component.html',
  styleUrls: ['./orientation-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class OrientationGridComponent extends AbstractPermissionGrid implements OnInit {
  @Input() gridTitle: string;
  public columnDef: ColumnDefinitionModel[];
  public pageNumber: number = 1;
  protected componentDestroy: () => Observable<unknown>;


  constructor(
    private cd: ChangeDetectorRef,
    protected override store: Store,
    private confirmService: ConfirmService,
  ) {
    super(store);
    this.columnDef = [];
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    //TODO: subscribe on org change
  }

  private dispatchNewPage(): void {

  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      this.dispatchNewPage();
    }
  }

  public addRecord(): void {

  }

  public deleteCommitment(commitment: any): void {
    this.confirmService
    .confirm(DELETE_RECORD_TEXT, {
      title: DELETE_RECORD_TITLE,
      okButtonLabel: 'Delete',
      okButtonClass: 'delete-button',
    }).pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      // TODO: emit delete
    });
  }
}
