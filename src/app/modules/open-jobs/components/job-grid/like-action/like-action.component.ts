import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { OpenJob } from '../../../interfaces';
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

  private currentEmployeeJob: OpenJob;

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    return false;
  }

  public applyJob(): void {
    this.componentParent.applyEmployeeJob(this.currentEmployeeJob);
  }

  private setData(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.currentEmployeeJob= params.data;
    this.isApplyEnabled = !params.data.isApplyEnabled;
  }
}
