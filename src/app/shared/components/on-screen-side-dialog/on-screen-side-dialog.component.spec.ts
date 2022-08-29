import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnScreenSideDialogComponent } from './on-screen-side-dialog.component';

describe('OnScreenSideDialogComponent', () => {
  let component: OnScreenSideDialogComponent;
  let fixture: ComponentFixture<OnScreenSideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnScreenSideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnScreenSideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
