import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { delay, filter, Observable, takeUntil } from 'rxjs';
import { ColDef } from '@ag-grid-community/core';

import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_REJECTION_REASON, DELETE_CONFIRM_TITLE, GRID_CONFIG } from '@shared/constants';
import { ShowSideDialog } from '../../../store/app.actions';
import { MasterCommitmentState } from '@admin/store/commitment.state';
import { MasterCommitment, MasterCommitmentsPage } from '@shared/models/commitment.model';
import { GridReadyEventModel } from '@shared/components/grid/models';
import { CommitmentColumnsDefinition } from './commitment.constants';
import {
  GetCommitmentByPage,
  SaveCommitment,
  SaveCommitmentSuccess,
  UpdateCommitmentSuccess,
} from '@admin/store/commitment.actions';
import { AbstractPermission } from '@shared/helpers/permissions';

@Component({
  selector: 'app-commitment',
  templateUrl: './commitment.component.html',
  styleUrls: ['./commitment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommitmentComponent extends AbstractPermission implements OnInit {
  @Select(MasterCommitmentState.commitmentsPage)
  public commitmentsPage$: Observable<MasterCommitmentsPage>;

  public rowSelection = undefined;
  public form: FormGroup;
  public pageNumber = GRID_CONFIG.initialPage;
  public pageSize = GRID_CONFIG.initialRowsPerPage;
  public title = '';
  public columnDefinitions: ColDef[];

  constructor(private confirmService: ConfirmService, protected override store: Store, private actions$: Actions) {
    super(store);
  }

  public override ngOnInit(): void {
    this.setColumnDefinition();
    this.subscribeOnUpdates();
    this.createForm();
    this.initGrid();
    super.ngOnInit();
  }

  public subscribeOnUpdates(): void {
    this.actions$.pipe(
      ofActionDispatched(SaveCommitmentSuccess),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.closeSideDialog();
    });
    this.actions$.pipe(
      ofActionDispatched(UpdateCommitmentSuccess),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.initGrid();
      this.closeSideDialog();
    });
  }

  public addCommitment(): void {
    this.title = DialogMode.Add;
    this.form.controls['id']?.setValue(0);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEdit(data: MasterCommitment): void {
    this.title = DialogMode.Edit;
    this.form.patchValue({
      id: data.id,
      name: data.name,
    });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public setColumnDefinition(): void {
    this.columnDefinitions = CommitmentColumnsDefinition((data: MasterCommitment) => {
      this.onEdit(data);
    });
  }

  public saveCommitment(): void {
    this.form.markAllAsTouched();
    if(this.form.invalid) {
      return;
    }
    this.store.dispatch(new SaveCommitment(this.form.getRawValue()));
  }

  public closeDialog(): void {
    if (this.form.dirty) {
      this.confirmService
        .confirm(CANCEL_REJECTION_REASON, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm: boolean) => !!confirm),
          takeUntil(this.componentDestroy())
        ).subscribe(() => {
          this.closeSideDialog();
        });
    } else {
      this.closeSideDialog();
    }
  }

  private createForm(): void {
    this.form = new FormGroup({
      id: new FormControl(0),
      name: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(3)]),
    });
  }

  private initGrid(): void {
    this.store.dispatch(new GetCommitmentByPage(this.pageNumber, this.pageSize));
  }

  public gridReady(grid: GridReadyEventModel): void {
    grid.api.sizeColumnsToFit();
  }

  private closeSideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false)).pipe(
      delay(500),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.form.reset();
    });
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      this.initGrid();
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if(pageSize) {
      this.pageSize = pageSize;
      this.initGrid();
    }
  }
}
