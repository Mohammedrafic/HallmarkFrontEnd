import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-inline-loader',
  templateUrl: './inline-loader.component.html',
  styleUrls: ['./inline-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineLoaderComponent {}
