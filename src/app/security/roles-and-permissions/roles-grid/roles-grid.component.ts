import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { filter, takeWhile } from 'rxjs';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from '@shared/constants/grid-config';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants/messages';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { ShowSideDialog } from 'src/app/store/app.actions';

enum Active {
  No,
  Yes,
}

@Component({
  selector: 'app-roles-grid',
  templateUrl: './roles-grid.component.html',
  styleUrls: ['./roles-grid.component.scss'],
})
export class RolesGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {
  @Output() editRoleEvent = new EventEmitter();

  @ViewChild('rolesGrid') grid: GridComponent;

  public dataSource = [
    {
      id: 1,
      roleName: 'Some name',
      business: 'Some name',
      active: 0,
    },
    {
      id: 1,
      roleName: 'Some name',
      business: 'Some name',
      active: 1,
    },
    {
      id: 1,
      roleName: 'Some name',
      business: 'Some name',
      active: 1,
    },
  ];
  public activeValueAccess = (_: string, { active }: any) => {
    return Active[active];
  };

  private isActive = true;

  constructor(private actions$: Actions, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.onDialogClose();
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public onEdit(data: unknown): void {
    this.editRoleEvent.emit(data);
  }

  public onRemove(data: unknown): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm) => {
        this.grid.clearRowSelection();
        if (confirm) {
          // On confirm here
        }
      });
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      // Dispatch new page here
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  private onDialogClose(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ShowSideDialog),
        takeWhile(() => this.isActive),
        filter(({ isDialogShown }) => !!!isDialogShown)
      )
      .subscribe(() => {
        this.grid.clearRowSelection();
      });
  }
}
