import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextboxFormComponent } from './textbox-form.component';

describe('TextboxFormComponent', () => {
  let component: TextboxFormComponent;
  let fixture: ComponentFixture<TextboxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextboxFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
