import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCandidatesComponent } from './import-candidates.component';

describe('ImportCandidatesComponent', () => {
  let component: ImportCandidatesComponent;
  let fixture: ComponentFixture<ImportCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportCandidatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
