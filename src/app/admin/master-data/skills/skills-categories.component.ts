import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { ShowSideDialog } from 'src/app/store/app.actions';
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
export class SkillsCategoriesComponent implements OnInit {
  public currentTab: Tabs = 0;
  public tabs = Tabs;
  public isSkillsActive = true;
  public isCategoriesActive = false;

  constructor(private store: Store) {
  }

  ngOnInit() {

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
