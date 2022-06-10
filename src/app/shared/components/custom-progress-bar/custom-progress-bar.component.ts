import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-custom-progress-bar',
  templateUrl: './custom-progress-bar.component.html',
  styleUrls: ['./custom-progress-bar.component.scss']
})
export class CustomProgressBarComponent implements AfterViewInit {
  @Input() value: number;
  @ViewChild('progress') progress: ElementRef;

  constructor() { }

  ngAfterViewInit() {
    this.progress.nativeElement.style.width = this.value + "%";
  }
}
