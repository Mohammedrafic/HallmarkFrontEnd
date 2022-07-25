import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-widget-wrapper-column',
  templateUrl: './widget-wrapper-column.component.html',
  styleUrls: ['./widget-wrapper-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetWrapperColumnComponent {
  @Input() public isLoading: boolean;
  @Input() public title: string;

  @ContentChild('chart') public readonly chart: TemplateRef<HTMLElement>;
  @ContentChild('legend') public readonly legend: TemplateRef<HTMLElement>;
}
