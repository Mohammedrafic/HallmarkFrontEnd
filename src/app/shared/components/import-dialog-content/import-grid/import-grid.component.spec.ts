import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportGridComponent } from './import-grid.component';

describe('ImportGridComponent', () => {
  let component: ImportGridComponent;
  let fixture: ComponentFixture<ImportGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportGridComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
