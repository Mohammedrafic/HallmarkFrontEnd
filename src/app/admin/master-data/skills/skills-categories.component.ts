import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ShowExportDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { GetAllSkillsCategories } from '../../store/admin.actions';

enum Tabs {
  'Skills',
  'Categories'
}

@Component({
  selector: 'app-skills-categories',
  templateUrl: './skills-categories.component.html',
  styleUrls: ['./skills-categories.component.scss']
})
export class SkillsCategoriesComponent extends AbstractGridConfigurationComponent implements OnInit {
  public currentTab: Tabs = 0;
  public tabs = Tabs;
  public isSkillsActive = true;
  public isCategoriesActive = false;

  constructor(private store: Store) {
    super();
  }

  ngOnInit() {

  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public addSkill(): void {
    this.store.dispatch(new ShowSideDialog(true));
    this.isSkillsActive && this.store.dispatch(new GetAllSkillsCategories());
  }

  public tabSelected(data: any): void {
    this.isSkillsActive = this.tabs['Skills'] === data.selectedIndex;
    this.isCategoriesActive = this.tabs['Categories'] === data.selectedIndex;
    this.currentTab = data.selectedIndex;
  }
}
