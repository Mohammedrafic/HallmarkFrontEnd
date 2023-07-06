import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { filter, takeUntil } from 'rxjs';
import { ListBox, ListBoxChangeEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { MenuSettings } from '@shared/models';
import { SideMenuService } from '@shared/components/side-menu/services';
import { Destroyable } from '@core/helpers';
import { Tooltip, TooltipEventArgs } from '@syncfusion/ej2-angular-popups';
import { charLength } from '@core/enums';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent extends Destroyable implements AfterViewInit, OnInit {
  @Input() config: MenuSettings[];
  // If the menu is loaded with a default selection (selecting a specific sub-menu item on load)
  @Input() navigateTo: string;
  selectionSettings: SelectionSettingsModel = { mode: 'Single' };
  public tooltip ?: Tooltip| any;

  @ViewChild('listBox')
  public listBox: ListBox;
  isAnalytics: boolean;
  private currentItem: MenuSettings;
  tooltipData: string | undefined;
  content: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sideMenuService: SideMenuService
  ) {
    super();
    this.isAnalytics = this.router.url.includes('analytics');
  }

  ngOnInit(): void {
    this.watchForMenuItems();
  }

  ngAfterViewInit(): void {
    if (this.config.length > 0) {
      let selection = this.config[0];
      if (this.navigateTo) {
        const navigateToSubMenu = this.config.find((item) => item.route === this.navigateTo);
        if (navigateToSubMenu) {
          selection = navigateToSubMenu;
        } 
      }
      this.listBox.selectItems([selection['text'] as string]);
      this.router.navigate([(selection as any).route], { relativeTo: this.route });
    }
    if(this.isAnalytics === true){
      this.tooltip = new Tooltip({
        target: '.list-box .e-list-item',
        position: 'RightCenter',
        content: this.content,
        beforeRender: this.onBeforeRender
    });  
    this.tooltip.appendTo('body');   
    }  
  }

    onBeforeRender(args: TooltipEventArgs): void {
      if(args.target.dataset["value"]?.length){
        if(args.target.dataset["value"].length > charLength.SideMenuTooltipSize){
          this.content = args.target.dataset['value'];
        } else {
          args.cancel = true;
        }
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
