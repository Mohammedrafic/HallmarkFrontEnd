import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-user-visibility',
  templateUrl: './user-visibility.component.html',
  styleUrls: ['./user-visibility.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserVisibilityComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
