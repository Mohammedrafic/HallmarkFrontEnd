import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ListBox, ListBoxChangeEventArgs, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit, AfterViewInit {
  @Input() config: { [key: string]: Object }[];
  selectionSettings: SelectionSettingsModel = { mode: 'Single' };

  @ViewChild('listBox')
  public listBox: ListBox;

  constructor(private store: Store,
              private router: Router,
              private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    const menuItem = this.config[0];
    this.listBox.selectItems([menuItem['text'] as string]);
    this.router.navigate([(menuItem as any).route]);
  }

  goToSection(event: ListBoxChangeEventArgs): void {
    const menuItem = event.items[0];
    this.router.navigate([(menuItem as any).route]);
  }
}
