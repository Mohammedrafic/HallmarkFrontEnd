import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateWiseSkillsComponent } from './state-wise-skills.component';

describe('StateWiseSkillsComponent', () => {
  let component: StateWiseSkillsComponent;
  let fixture: ComponentFixture<StateWiseSkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StateWiseSkillsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateWiseSkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
