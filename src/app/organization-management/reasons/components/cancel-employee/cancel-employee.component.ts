import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ofActionSuccessful, Select } from '@ngxs/store';
import { Observable, takeWhile } from 'rxjs';
import { ColDef } from '@ag-grid-community/core';

import { ReasonsComponent } from '@organization-management/reasons/models';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { PageOfCollections } from '@shared/models/page.model';
import {
  CancelEmpGripConfig,
  CancelEmpPageSettings,
} from '@organization-management/reasons/components/cancel-employee/constants';
import { PageSettings } from '@organization-management/reasons/components/cancel-employee/interfaces';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';
import {
  GetCancelEmployeeReason,
  RemoveCancelEmployeeReason,
  SaveCancelEmployeeReason,
} from '@organization-management/store/reject-reason.actions';
import { CancelEmployeeReasonValue } from '@organization-management/reasons/interfaces';
import { CancelEmployeeReasons } from '@shared/models/reject-reason.model';
import { CancellationReasonType } from '@organization-management/reasons/enums';

@Component({
  selector: 'app-cancel-employee',
  templateUrl: './cancel-employee.component.html',
  styleUrls: ['./cancel-employee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancelEmployeeComponent extends ReasonsComponent {
  @Select(RejectReasonState.getCancelEmployeeReasons)
  public reasons$: Observable<PageOfCollections<CancelEmployeeReasons>>;

  public gridDefs: ColDef[] = CancelEmpGripConfig;
  public pagingData: PageSettings = CancelEmpPageSettings;

  public readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;
  public readonly context: { componentParent: CancelEmployeeComponent } = {
    componentParent: this,
  };

  public changePage(pageNumber: number): void {
    if (pageNumber === this.currentPage) {
      return;
    }

    this.currentPage = pageNumber;
    this.getData();
  }

  changePageSize(pageSize: number): void {
    if (pageSize === this.pageSize) {
      return;
    }

    this.pageSize = pageSize;
    this.getData();
  }

  protected getData(): void {
    this.store.dispatch(new GetCancelEmployeeReason(this.currentPage, this.pageSize, false, CancellationReasonType.Custom));
  }

  public editReasonRecord(data: CancelEmployeeReasonValue): void {
    this.onEdit(data);
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveCancelEmployeeReason(id));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected subscribeOnSaveReasonError(): void {
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(
          SaveCancelEmployeeReason,
          RemoveCancelEmployeeReason
        ),
        takeWhile(() => this.isAlive)
      ).subscribe(() => {
        this.getData();
    });
  }
}
