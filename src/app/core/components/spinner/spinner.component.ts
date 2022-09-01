import { ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';

import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent implements AfterViewInit {
  @ViewChild('spinner') readonly spinner: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    createSpinner({
      target: this.spinner.nativeElement,
    });

    showSpinner(this.spinner.nativeElement);
  }
}
