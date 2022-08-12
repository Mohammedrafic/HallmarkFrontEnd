import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionCandidateInfoComponent } from './extension-candidate-info.component';

describe('ExtensionCandidateInfoComponent', () => {
  let component: ExtensionCandidateInfoComponent;
  let fixture: ComponentFixture<ExtensionCandidateInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExtensionCandidateInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionCandidateInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
