import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Logincliente } from './logincliente';

describe('Logincliente', () => {
  let component: Logincliente;
  let fixture: ComponentFixture<Logincliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logincliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Logincliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
