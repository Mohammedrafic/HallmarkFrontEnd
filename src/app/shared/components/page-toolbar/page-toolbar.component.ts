import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-page-toolbar',
  templateUrl: './page-toolbar.component.html',
  styleUrls: ['./page-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PageToolbarComponent {
  @Input() rightPanelButtonsOnly = false;
}
