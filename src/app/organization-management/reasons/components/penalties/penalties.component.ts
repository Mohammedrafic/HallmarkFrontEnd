import { Component, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetPenaltiesByPage,
  RemovePenalty,
  SavePenaltyError,
  SavePenaltySuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GridOptions } from '@ag-grid-community/core';
import { PenaltiesGridActionsRendererComponent,
} from './penalties-grid-actions-renderer/penalties-grid-actions-renderer.component';
import { Penalty, PenaltyPage } from '@shared/models/penalty.model';
import { CancellationReasonsMap,
} from '@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants';

@Component({
  selector: 'app-penalties',
  templateUrl: './penalties.component.html',
  styleUrls: ['./penalties.component.scss'],
})
export class PenaltiesComponent extends ReasonsComponent implements OnInit, OnDestroy {
  @Select(RejectReasonState.penalties)
  public reasons$: Observable<PenaltyPage>;

  public gridOptions: GridOptions = {
    onGridReady: (event) => event.api.sizeColumnsToFit(),
  };

  public readonly columnDefinitions: ColumnDefinitionModel[] = [
    {
      field: 'candidateCancellationSettingId',
      headerName: '',
      cellRenderer: PenaltiesGridActionsRendererComponent,
      maxWidth: 140,
      valueGetter: (params: { data: Penalty }) => { return params.data; },
      cellRendererParams: {
        onEdit: (data: Penalty) => {
          this.editReason.emit(data);
        },
        onDelete: (data: Penalty) => {
          this.onRemove(data.candidateCancellationSettingId);
        },
      },
    },
    {
      field: 'reason',
      headerName: 'Reason',
      valueGetter: (params: { data: Penalty }) => { return CancellationReasonsMap[params.data.reason]; },
    },
    {
      field: 'regionName',
      headerName: 'Region',
      valueGetter: (params: { data: Penalty }) => { return params.data.regionId === null ? 'All' : params.data.regionName; },
    },
    {
      field: 'locationName',
      headerName: 'Location',
      valueGetter: (params: { data: Penalty }) => {
        return params.data.locationId === null ? 'All' : params.data.locationName; },
    },
    {
      field: 'flatRate',
      headerName: 'Flat Rate',
      valueGetter: (params: { data: Penalty }) => { return '$' + params.data.flatRate.toFixed(2); },
    },
    {
      field: 'rateOfHours',
      headerName: 'Bill Rate Of X Hours',
      valueGetter: (params: { data: Penalty }) => { return params.data.rateOfHours + 'hrs'; },
    },
    {
      field: 'flatRateOfHoursPercentage',
      headerName: '% Rate Of X Hours',
      valueGetter: (params: { data: Penalty }) => {
        return `${params.data.flatRateOfHoursPercentage.toFixed(2)}% x ${params.data.flatRateOfHours}hrs`; },
    },
  ];

  protected getData(): void {
    this.store.dispatch(new GetPenaltiesByPage(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemovePenalty(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SavePenaltyError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setPenaltyControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(SavePenaltySuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.getData());
  }

  protected setPenaltyControlError(): void {
    this.form.controls['reason'].setErrors({ incorrect: true });
  }
}
