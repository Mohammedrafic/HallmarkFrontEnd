import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GridComponent, RowDataBoundEventArgs } from "@syncfusion/ej2-angular-grids";
import { FormGroup } from "@angular/forms";
import { Role } from "@shared/models/roles.model";
import { GRID_CONFIG } from "@shared/constants";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { Select, Store } from "@ngxs/store";
import { SecurityState } from "../../store/security.state";
import { Observable, takeWhile } from "rxjs";
import { GetUsersPage } from "../../store/security.actions";
import { CreateUserStatus, STATUS_COLOR_GROUP } from "@shared/enums/status";
import { User, UsersPage } from "@shared/models/user-managment-page.model";

enum Visibility {
  Unassigned,
  Assigned
}

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss']
})
export class UserGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() filterForm: FormGroup;
  @Output() editUserEvent = new EventEmitter();

  @ViewChild('usersGrid') grid: GridComponent;

  @Select(SecurityState.userGridData)
  public userGridData$: Observable<User[]>;

  @Select(SecurityState.usersPage)
  public usersPage$: Observable<UsersPage>;

  public hasVisibility = (_: string, { assigned }: User) => {
    return Visibility[Number(assigned)]
  };

  public readonly statusEnum = CreateUserStatus;
  private isAlive = true;

  constructor(
    private store: Store,
    ) {
    super();
  }

  ngOnInit(): void {
    this.dispatchNewPage();
    this.subscribeForFilterFormChange();
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onEdit(data: unknown): void {
    this.editUserEvent.emit(data);
  }

  public rowDataBound(args: RowDataBoundEventArgs): void {
    const data = args.data as Role;
    if (data.isDefault) {
      args.row?.classList.add('default-role');
    }
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
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

  private subscribeForFilterFormChange() {
    this.filterForm.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => this.dispatchNewPage());
  }

  private dispatchNewPage(): void {
    const { businessUnit, business } = this.filterForm.getRawValue();
    this.store.dispatch(new GetUsersPage(businessUnit, business || '', this.currentPage, this.pageSize));
  }
}
