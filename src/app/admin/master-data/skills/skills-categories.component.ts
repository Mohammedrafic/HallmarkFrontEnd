import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Subject, take } from 'rxjs';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { GetAllSkillsCategories } from '../../store/admin.actions';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';

enum Tabs {
  'Skills',
  'Categories'
}

@Component({
  selector: 'app-skills-categories',
  templateUrl: './skills-categories.component.html',
  styleUrls: ['./skills-categories.component.scss'],
})
export class SkillsCategoriesComponent extends AbstractPermissionGrid implements OnInit {
  public currentTab: Tabs = 0;
  public tabs = Tabs;
  public isSkillsActive = true;
  public isCategoriesActive = false;
  public exportSkills$ = new Subject<ExportedFileType>();
  public exportCategories$ = new Subject<ExportedFileType>();
  public filteredItems$ = new Subject<number>();
  public canAddSkillOrCategories = true;

  constructor(protected override store: Store, private cd: ChangeDetectorRef) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.getAllSkillsCategories();
    this.getPermissionSkillCategories();
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
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

  public tabSelected(data: SelectEventArgs): void {
    this.isSkillsActive = this.tabs['Skills'] === data.selectedIndex;
    this.isCategoriesActive = this.tabs['Categories'] === data.selectedIndex;
    this.currentTab = data.selectedIndex;
    this.getPermissionSkillCategories();
  }

  private getPermissionSkillCategories(): void {
    this.canAddSkillOrCategories = this.currentTab === 0 ?
      this.userPermission[this.userPermissions.CanEditMasterSkills] :
      this.userPermission[this.userPermissions.CanEditSkillCategories];
    this.cd.detectChanges();
  }

  private getAllSkillsCategories(): void {
    this.store.dispatch(new GetAllSkillsCategories()).pipe(take(1)).subscribe(() => {
      this.cd.detectChanges();
    });
  }
}
