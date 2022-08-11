import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialProjectCategoryComponent } from './special-project-categories.component';

describe('SpecialProjectCategoryComponent', () => {
  let component: SpecialProjectCategoryComponent;
  let fixture: ComponentFixture<SpecialProjectCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecialProjectCategoryComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialProjectCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
