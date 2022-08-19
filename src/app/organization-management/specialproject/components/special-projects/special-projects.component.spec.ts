import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialProjectsComponent } from './special-projects.component';

describe('SpecialProjectsComponent', () => {
  let component: SpecialProjectsComponent;
  let fixture: ComponentFixture<SpecialProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecialProjectsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
