import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DialogNextPreviousOption = {
  next: boolean,
  previous: boolean
};

@Component({
  selector: 'app-dialog-next-previous',
  templateUrl: './dialog-next-previous.component.html',
  styleUrls: ['./dialog-next-previous.component.scss'],
})
export class DialogNextPreviousComponent {
  @Input() title: string
  @Input() options: DialogNextPreviousOption;

  @Output() nextEvent = new EventEmitter<never>();
  @Output() previousEvent = new EventEmitter<never>();

  public onNext(): void {
    this.nextEvent.emit();
  }

  public onPrevious(): void {
    this.previousEvent.emit();
  }
}
