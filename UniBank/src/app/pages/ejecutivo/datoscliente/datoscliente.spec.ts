import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datoscliente } from './datoscliente';

describe('Datoscliente', () => {
  let component: Datoscliente;
  let fixture: ComponentFixture<Datoscliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datoscliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datoscliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
