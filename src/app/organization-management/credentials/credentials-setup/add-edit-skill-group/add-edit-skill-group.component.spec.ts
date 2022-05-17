import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSkillGroupComponent } from './add-edit-skill-group.component';

describe('AddEditSkillGroupComponent', () => {
  let component: AddEditSkillGroupComponent;
  let fixture: ComponentFixture<AddEditSkillGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditSkillGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditSkillGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
