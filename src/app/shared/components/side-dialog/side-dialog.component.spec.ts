import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideDialogComponent } from './side-dialog.component';

describe('SideDialogComponent', () => {
  let component: SideDialogComponent;
  let fixture: ComponentFixture<SideDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
