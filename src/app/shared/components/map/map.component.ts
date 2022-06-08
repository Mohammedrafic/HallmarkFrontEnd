import { Component, Input, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import type { LegendSettingsModel, LayerSettingsModel, MapsComponent } from '@syncfusion/ej2-angular-maps';
import { ResizeObserverService, ResizeObserverModel } from '@shared/services/resize-observer.service';
import { takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent extends DestroyableDirective implements AfterViewInit, OnDestroy {
  @Input() public layers: LayerSettingsModel[] | undefined;
  @Input() public legendSettings: LegendSettingsModel;

  @ViewChild('maps', { static: true }) public maps: MapsComponent;

  private mapResizeObserver: ResizeObserverModel;

  public ngAfterViewInit(): void {
    this.initMapWrapperResizeObserver();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.mapResizeObserver.detach();
  }

  private initMapWrapperResizeObserver(): void {
    this.mapResizeObserver = ResizeObserverService.init(this.maps.getRootElement());
    this.mapResizeObserver.resize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => requestAnimationFrame(() => this.maps.refresh()));
  }
}
