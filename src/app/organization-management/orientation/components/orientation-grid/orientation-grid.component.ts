import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TakeUntilDestroy } from '@core/decorators';
import { Store } from '@ngxs/store';
import { OrientationColumnDef } from '@organization-management/orientation/constants/orientation.constant';
import { OrientationConfiguration, OrientationConfigurationPage } from '@organization-management/orientation/models/orientation.model';
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
  @Input() public gridTitle: string;
  @Input() public dataSource: OrientationConfigurationPage;
  @Output() public pageChange = new EventEmitter();
  @Output() public openDialog = new EventEmitter();
  @Output() public onEdit = new EventEmitter();
  @Output() public onDelete = new EventEmitter();

  public columnDef: ColumnDefinitionModel[];
  public pageNumber: number = 1;
  protected componentDestroy: () => Observable<unknown>;


  constructor(
    private cd: ChangeDetectorRef,
    protected override store: Store,
    private confirmService: ConfirmService,
  ) {
    super(store);
    this.columnDef = OrientationColumnDef(this.edit.bind(this), this.delete.bind(this));;
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  private dispatchNewPage(): void {
    this.pageChange.emit({ pageNumber: this.pageNumber, pageSize: this.pageSize }); // TODO: add filters
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      this.dispatchNewPage();
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if(pageSize) {
      this.pageSize = pageSize;
      this.dispatchNewPage();
    }
  }

  public addRecord(): void {
    this.openDialog.emit();
  }

  public edit(data: OrientationConfiguration): void {
    this.onEdit.emit(data);
  }

  public delete(data: OrientationConfiguration): void {
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
      this.onDelete.emit(data);
    });
  }
}
