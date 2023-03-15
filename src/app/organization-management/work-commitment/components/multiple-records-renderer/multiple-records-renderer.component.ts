import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GridCellRenderer } from '@shared/components/grid/models';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-multiple-records-renderer',
  templateUrl: './multiple-records-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleRecordsRendererComponent extends GridCellRenderer<ICellRendererParams & { field: string }> implements OnInit {
  public items: string[] = [];
  public text: string = '';
  public label: string = '';

  public constructor() {
    super();
  }

  public ngOnInit(): void {
    debugger;
    if (this.params.field === 'skillNames') {
      this.skillsHandler();
    }
    if (this.params.field === 'locationName') {
      this.locationHandler();
    }
    if (this.params.field === 'regionName') {
      this.regionHandler();
    }
  }

  private skillsHandler(): void {
    if (this.params.data.skillNames && this.params.data.skillNames[0] !== null) {
      this.items = this.params.data.skillNames;
      this.text = this.items.join(', ');
      this.generateLabel();
    } else {
      this.label = 'All';
    }
  }

  private locationHandler(): void {
    if (this.params.data.locationName && this.params.data.locationName[0] !== null) {
      this.items = this.params.data.locationName.filter((item: string) => item);
      this.text = this.items.join(', ');
      this.generateLabel();
    } else {
      this.label = 'All';
    }
  }

  private regionHandler(): void {
    if (this.params.data.regionName && this.params.data.regionName[0] !== null) {
      this.items = this.params.data.regionName.filter((item: string) => item);
      this.text = this.items.join(', ');
      this.generateLabel();
    } else {
      this.label = 'All';
    }
  }

  private generateLabel(): void {
    if (this.items.length > 1) {
      this.label = 'Multiple';
    } else if (this.items.length === 1) {
      this.label = this.items[0];
    }
  }
}
