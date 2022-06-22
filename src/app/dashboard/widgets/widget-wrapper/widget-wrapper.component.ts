import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-widget-wrapper',
  templateUrl: './widget-wrapper.component.html',
  styleUrls: ['./widget-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetWrapperComponent {
  @Input() public isLoading: boolean;
  @Input() public title: string;

  @ContentChild('chart') public readonly chart: TemplateRef<HTMLElement>;
  @ContentChild('legend') public readonly legend: TemplateRef<HTMLElement>;
}
