import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TrackByFunction } from '@angular/core';

import { ButtonModel } from '@shared/models/buttons-group.model';

@Component({
  selector: 'app-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  @Input() buttonOptions: ButtonModel[] = [];

  @Output() buttonChange: EventEmitter<ButtonModel> = new EventEmitter<ButtonModel>();

  public trackByFn: TrackByFunction<ButtonModel> = (_: number, btn: ButtonModel) => btn.id;

  btnClick(btn: ButtonModel): void {
    this.buttonOptions = this.buttonOptions.map(el => ({ ...el, active: btn.id === el.id }));
    this.buttonChange.emit(btn);
  }
}
