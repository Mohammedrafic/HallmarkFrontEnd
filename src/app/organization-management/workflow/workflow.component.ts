import { Component } from '@angular/core';
import { ShowSideDialog } from '../../store/app.actions';
import { Store } from '@ngxs/store';

export enum WorkflowNavigationTabs {
  JobOrderWorkflow,
  WorkflowMapping
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent {

  public isJobOrderWorkflowTabActive = true;
  public isWorkflowMappingTabActive = false;

  constructor(private store: Store) { }

  onTabSelected(selectedTab: any): void {
    this.isJobOrderWorkflowTabActive = WorkflowNavigationTabs['JobOrderWorkflow'] === selectedTab.selectedIndex;
    this.isWorkflowMappingTabActive = WorkflowNavigationTabs['WorkflowMapping'] === selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));
  }
}
