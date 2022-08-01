import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { filter, Observable, Subject, takeWhile } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from '@shared/constants/grid-config';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants/messages';
import { Role, RolesFilters, RolesPage } from '@shared/models/roles.model';
import { FilteredItem } from "@shared/models/filter.model";
import { FilterService } from "@shared/services/filter.service";
import { PermissionsTree } from "@shared/models/permission.model";
import { rolesFilterColumns } from "src/app/security/roles-and-permissions/roles-and-permissions.constants";

import { ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { GetRolesPage, RemoveRole } from '../../store/security.actions';
import { SecurityState } from '../../store/security.state';

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-roles-grid',
  templateUrl: './roles-grid.component.html',
  styleUrls: ['./roles-grid.component.scss']
})
export class RolesGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() filterForm: FormGroup;
  @Input() filteredItems$: Subject<number>;

  @Output() editRoleEvent = new EventEmitter();

  @ViewChild('rolesGrid') grid: GridComponent;

  @Select(SecurityState.roleGirdData)
  public roleGirdData$: Observable<Role[]>;

  @Select(SecurityState.rolesPage)
  public rolesPage$: Observable<RolesPage>;

  @Select(SecurityState.permissionsTree)
  public permissionsTree$: Observable<PermissionsTree>;

  public activeValueAccess = (_: string, { isActive }: Role) => {
    return Active[Number(isActive)];
  };
  public businessValueAccess = (_: string, { businessUnitName }: Role) => {
    return businessUnitName || "All";
  };
  public selIndex: number[] = [];
  public sortOptions = { columns: [{ field: 'businessUnitName', direction: 'Descending' }] };
  public filterColumns = rolesFilterColumns;
  public rolesFilterFormGroup: FormGroup;

  private filters: RolesFilters = {};
  private isAlive = true;

  constructor(private actions$: Actions,
              private store: Store,
              private confirmService: ConfirmService,
              private filterService: FilterService,
              private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.initRolesFilterFormGroup();
    this.onDialogClose();
    this.dispatchNewPage();
    this.onPermissionsTreeChanged();

    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => this.dispatchNewPage());
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public rowDataBound(args: RowDataBoundEventArgs): void {
    const data = args.data as Role;
    if (data.isDefault) {
      args.row?.classList.add('default-role');
    }
  }

  dataBound() {
    const a = this.grid.getRows();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: unknown): void {
    this.editRoleEvent.emit(data);
  }

  public onRemove(data: Role): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm) => {
        this.grid.clearRowSelection();
        if (confirm && data.id) {
         this.store.dispatch(new RemoveRole(data.id))
        }
      });
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  public onFilterApply(): void {
    this.filters = this.rolesFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.rolesFilterFormGroup, this.filterColumns);
    this.dispatchNewPage();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterClose(): void {
    this.rolesFilterFormGroup.setValue({
      permissionsIds: this.filters.permissionsIds || [],
    });
    this.filteredItems = this.filterService.generateChips(this.rolesFilterFormGroup, this.filterColumns);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.rolesFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.dispatchNewPage();
  }

  private clearFilters(): void {
    this.rolesFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.filteredItems$.next(this.filteredItems.length);
  }

  private dispatchNewPage(): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(new GetRolesPage(businessUnit, business || null, this.currentPage, this.pageSize, this.filters));
  }

  private onDialogClose(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ShowSideDialog),
        takeWhile(() => this.isAlive),
        filter(({ isDialogShown }) => !!!isDialogShown)
      )
      .subscribe(() => {
        this.grid.clearRowSelection();
      });
  }

  private onPermissionsTreeChanged(): void {
    this.permissionsTree$.pipe(takeWhile(() => this.isAlive)).subscribe((permissions: PermissionsTree) => {
      this.filterColumns['permissionsIds'].dataSource = permissions;
    });
  }

  private initRolesFilterFormGroup(): void {
  this.rolesFilterFormGroup = this.formBuilder.group({
      permissionsIds: new FormControl([]),
    });
  }
}
