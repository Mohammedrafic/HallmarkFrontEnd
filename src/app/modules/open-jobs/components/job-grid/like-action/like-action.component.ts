import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { OpenJob } from '@shared/models';
import { JobGridComponent } from '../job-grid.component';

@Component({
  selector: 'app-like-action',
  templateUrl: './like-action.component.html',
  styleUrls: ['./like-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LikeActionComponent implements ICellRendererAngularComp {
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

  public callJobAction(): void {
    this.isApplySelected ? this.withdrawJob() : this.applyJob();
  }

  public applyJob(): void {
    this.componentParent.applyEmployeeJob(this.currentEmployeeJob);
  }

  public withdrawJob(): void {
    this.componentParent.withdrawEmployeeJob(this.currentEmployeeJob);
  }

  private setData(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.currentEmployeeJob= params.data;
    this.isApplyEnabled = !params.data.isApplyEnabled;
    this.isApplySelected = params.data.isApplySelected;
  }
}
