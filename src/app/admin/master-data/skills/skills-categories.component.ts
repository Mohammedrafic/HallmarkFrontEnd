import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { ShowSideDialog } from 'src/app/store/app.actions';

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

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {

  }

  public addSkill(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public tabSelected(data: any): void {
    this.isSkillsActive = this.tabs['Skills'] === data.selectedIndex;
    this.isCategoriesActive = this.tabs['Categories'] === data.selectedIndex;
    this.currentTab = data.selectedIndex;
  }

}
