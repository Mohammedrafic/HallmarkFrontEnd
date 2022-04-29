import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillCategoriesGridComponent } from './skill-categories-grid.component';

describe('SkillCategoriesGridComponent', () => {
  let component: SkillCategoriesGridComponent;
  let fixture: ComponentFixture<SkillCategoriesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillCategoriesGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillCategoriesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
