import { Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Subject } from 'rxjs';
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
  public exportSkills$ = new Subject<ExportedFileType>();
  public exportCategories$ = new Subject<ExportedFileType>();

  constructor(private store: Store) {
    super();
  }

  ngOnInit() {
    this.store.dispatch(new GetAllSkillsCategories());
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    if (this.isSkillsActive) {
      this.exportSkills$.next(fileType);
    } else {
      this.exportCategories$.next(fileType);
    }
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
