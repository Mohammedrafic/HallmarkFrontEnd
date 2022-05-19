import { Component, OnInit } from '@angular/core';
import { ShowSideDialog } from '../../../../store/app.actions';
import { Store } from '@ngxs/store';
import { ActivatedRoute, Router } from '@angular/router';

export enum GroupNavigationTabs {
  GroupSetupTab,
  GroupMappingTab
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  public isGroupSetupTabActive = true;
  public isGroupMappingTabActive = false;

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
  }

  onTabSelected(selectedTab: any): void {
    this.isGroupSetupTabActive = GroupNavigationTabs['GroupSetupTab'] === selectedTab.selectedIndex;
    this.isGroupMappingTabActive = GroupNavigationTabs['GroupMappingTab'] === selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));
  }

  onBackButtonClick(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onOpenFormButtonClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }
}
