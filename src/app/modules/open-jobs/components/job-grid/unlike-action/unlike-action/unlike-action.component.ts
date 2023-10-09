import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobGridComponent } from '../../job-grid.component';
import { ICellRendererParams } from '@ag-grid-community/core';
import { OpenJob } from '@shared/models';

@Component({
  selector: 'app-unlike-action',
  templateUrl: './unlike-action.component.html',
  styleUrls: ['./unlike-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnlikeActionComponent implements ICellRendererAngularComp {

  public componentParent: JobGridComponent;

  public isApplyEnabled = false;
  public isApplySelected = false;

  private currentEmployeeJob: OpenJob;

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  public withdrawJob(): void {
    this.componentParent.withdrawEmployeeJob(this.currentEmployeeJob);
  }

  private setData(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.currentEmployeeJob = params.data;
    this.isApplyEnabled = !params.data.isApplyEnabled;
    this.isApplySelected = params.data.isApplySelected;
  }
}