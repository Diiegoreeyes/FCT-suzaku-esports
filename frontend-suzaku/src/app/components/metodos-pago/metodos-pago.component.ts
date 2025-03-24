// metodos-pago.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metodos-pago.component.html',
  styleUrls: ['./metodos-pago.component.css']
})
export class MetodosPagoComponent implements OnInit {
  metodos: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // Cargar métodos de pago (puede venir de un servicio)
    this.metodos = [
      { id: 1, tipo: 'Tarjeta de Crédito', detalles: '**** **** **** 1234' },
      { id: 2, tipo: 'PayPal', detalles: 'usuario@ejemplo.com' }
    ];
  }
}
