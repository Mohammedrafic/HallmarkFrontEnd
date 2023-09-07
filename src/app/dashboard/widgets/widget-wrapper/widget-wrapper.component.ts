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
  @Input() public description: string;
  @Input() public isDarkTheme: boolean |false;
  @Input() public isLTAOrderEnding: boolean = false;
  @Input() public isCandidateApplied: boolean = false;

  @ContentChild('header') public readonly header: TemplateRef<HTMLElement>;
  @ContentChild('chart') public readonly chart: TemplateRef<HTMLElement>;
  @ContentChild('lineChart') public readonly lineChart: TemplateRef<HTMLElement>;
  @ContentChild('mapChart') public readonly mapChart: TemplateRef<HTMLElement>;
  @ContentChild('positionChat') public readonly positionChart: TemplateRef<HTMLElement>;
  @ContentChild('legend') public readonly legend: TemplateRef<HTMLElement>;
  @ContentChild("OrgChart") public readonly OrgChart: TemplateRef<HTMLElement>;
  @ContentChild("agency_count") public readonly agency_count: TemplateRef<HTMLElement>;
  @ContentChild("RNUtilizationChart") public readonly RNUtilizationChart: TemplateRef<HTMLElement>;
  @ContentChild("already_expired_credentials") public readonly already_expired_credentials: TemplateRef<HTMLElement>;
  @ContentChild("upcoming_exp_creds") public readonly upcoming_exp_creds: TemplateRef<HTMLElement>;
  @ContentChild("available_employee") public readonly available_employee: TemplateRef<HTMLElement>;
  @ContentChild("positions_count_day_range") public readonly positions_count_day_range: TemplateRef<HTMLElement>;
  @ContentChild("orders_pending_custom_status") public readonly orders_pending_custom_status: TemplateRef<HTMLElement>;
}
