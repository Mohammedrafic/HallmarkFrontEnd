import { Component, OnDestroy, OnInit } from '@angular/core';
import { TakeUntilDestroy } from '@core/decorators';
import { Store } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';

@Component({
  selector: 'app-orientation-exception',
  styleUrls: ['./orientation-exception.component.scss'],
  templateUrl: './orientation-exception.component.html',
})
@TakeUntilDestroy
export class OrientationExceptionsComponent extends AbstractPermissionGrid implements OnInit {

  constructor(
    protected override store: Store,
  ) {
    super(store);
  }

}
