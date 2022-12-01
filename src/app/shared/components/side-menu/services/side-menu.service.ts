import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { MenuSettings } from '@shared/models';

@Injectable()
export class SideMenuService  {
  public selectedMenuItem$: Subject<MenuSettings> = new Subject<MenuSettings>();
}
