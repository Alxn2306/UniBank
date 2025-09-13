import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loginmanager } from './loginmanager';

describe('Loginmanager', () => {
  let component: Loginmanager;
  let fixture: ComponentFixture<Loginmanager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loginmanager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loginmanager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
