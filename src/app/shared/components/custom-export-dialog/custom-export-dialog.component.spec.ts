import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomExportDialogComponent } from './custom-export-dialog.component';

describe('CustomExportDialogComponent', () => {
  let component: CustomExportDialogComponent;
  let fixture: ComponentFixture<CustomExportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomExportDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
