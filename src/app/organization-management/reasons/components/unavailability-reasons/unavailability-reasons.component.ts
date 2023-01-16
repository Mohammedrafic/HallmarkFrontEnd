import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Module } from '@ag-grid-community/core';
import { ofActionSuccessful, Select } from '@ngxs/store';
import { Observable, takeWhile } from 'rxjs';

import { Permission } from '@core/interface';
import { UnavaliabilityGridConfig } from '@organization-management/reasons/constants';
import { UnavailabilityValue } from '@organization-management/reasons/interfaces';
import { ReasonsComponent } from '@organization-management/reasons/models';
import {
  GetUnavailabilityReasons, RemoveUnavailabilityReason,
  SaveUnavailabilityReason,
} from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { PageOfCollections } from '@shared/models/page.model';
import { UnavailabilityReasons } from '@shared/models/reject-reason.model';
import { UnavailabilityPaging } from './unavailability-reasons.interface';
import { UserPermissions } from '@core/enums';
import { GRID_EMPTY_MESSAGE } from '@shared/components/grid/constants/grid.constants';

@Component({
  selector: 'app-unavailability-reasons',
  templateUrl: './unavailability-reasons.component.html',
  styleUrls: ['./unavailability-reasons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnavailabilityReasonsComponent extends ReasonsComponent {
  @Input() userPermission: Permission;

  @Select(RejectReasonState.getUnavailabilityReasons)
  reasons$: Observable<PageOfCollections<UnavailabilityReasons>>;

  gridDefs = UnavaliabilityGridConfig;

  readonly modules: Module[] = [ClientSideRowModelModule];

  readonly userPermissions = UserPermissions;

  readonly gridEmptyMessage = GRID_EMPTY_MESSAGE;

  tableContext: { componentParent: UnavailabilityReasonsComponent } = {
    componentParent: this,
  };

  pagingData: UnavailabilityPaging = {
    currentPage: 1,
    pageSize: 100,
  };

  deleteReason(reasonId: number): void {
    this.remove(reasonId);
  }

  editReasonRecord(data: UnavailabilityValue): void {
    this.onEdit(data);
  }

  changePage(pageNumber: number): void {
    if (pageNumber === this.currentPage ) {
      return;
    }
    this.currentPage = pageNumber;
    this.getData();
  }

  changePageSize(pageSize: number): void {
    if (pageSize === this.pageSize ) {
      return;
    }
    this.pageSize = pageSize;
    this.getData();
  }

  protected getData(): void {
    this.store.dispatch(new GetUnavailabilityReasons(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveUnavailabilityReason(id));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected subscribeOnSaveReasonError(): void {}

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$
    .pipe(
      ofActionSuccessful(
        SaveUnavailabilityReason,
        RemoveUnavailabilityReason,
      ),
      takeWhile(() => this.isAlive)
    )
    .subscribe(() => {
      this.getData();
    });
  }
}
