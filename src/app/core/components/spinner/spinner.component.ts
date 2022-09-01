import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';
import { ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';

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
