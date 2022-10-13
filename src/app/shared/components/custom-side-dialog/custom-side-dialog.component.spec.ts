import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSideDialogComponent } from './custom-side-dialog.component';

describe('CustomSideDialogComponent', () => {
  let component: CustomSideDialogComponent;
  let fixture: ComponentFixture<CustomSideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomSideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
