import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsGridComponent } from './skills-grid.component';

describe('SkillsGridComponent', () => {
  let component: SkillsGridComponent;
  let fixture: ComponentFixture<SkillsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
