import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, takeUntil } from 'rxjs';
import { ListBox, ListBoxChangeEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { MenuSettings } from '@shared/models';
import { SideMenuService } from '@shared/components/side-menu/services';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends Destroyable implements AfterViewInit, OnInit {
  @Input() config: MenuSettings[];
  selectionSettings: SelectionSettingsModel = { mode: 'Single' };

  @ViewChild('listBox')
  public listBox: ListBox;

  private currentItem: MenuSettings;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sideMenuService: SideMenuService
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForMenuItems();
  }

  ngAfterViewInit(): void {
    if (this.config.length > 0) {
      const menuItem = this.config[0];
      this.listBox.selectItems([menuItem['text'] as string]);
      this.router.navigate([(menuItem as any).route], { relativeTo: this.route });
    }
  }

  public selectMenuItem(event: ListBoxChangeEventArgs | null, mnuItem?: MenuSettings): void {
    const menuItem = mnuItem ?? event?.items[0];
    if (this.currentItem !== menuItem) {
      this.currentItem = menuItem as MenuSettings;
      this.router.navigate([(menuItem as any).route], { relativeTo: this.route });
    }
  }

  private watchForMenuItems(): void {
    this.sideMenuService.selectedMenuItem$.pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy())
    ).subscribe((menuItem: MenuSettings) => {
      this.listBox.selectItems([this.currentItem.text], false);
      this.selectMenuItem(null, menuItem);
      this.listBox.selectItems([menuItem.text], true);
    });
  }
}
