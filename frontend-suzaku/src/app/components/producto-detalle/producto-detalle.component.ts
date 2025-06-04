import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {
  producto: any;
  stock: any[] = [];
  colorSeleccionado: string = '';
  tallaSeleccionada: string = '';
  coloresDisponibles: string[] = [];
  tallasDisponibles: string[] = [];
  galeriaImagenes: string[] = [];
  imagenActual: string = '';
  stockSeleccionado: any = null;

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productoService.obtenerProducto(id).subscribe(data => {
      this.producto = data;
      this.stock = data.stock_items || [];

      this.galeriaImagenes = [this.producto.imagen_principal];
      if (this.producto.galeria && Array.isArray(this.producto.galeria)) {
        this.galeriaImagenes.push(...this.producto.galeria.map((img: any) => img.imagen));
      }
      this.imagenActual = this.galeriaImagenes[0];

      this.coloresDisponibles = [...new Set(this.stock.map(item => item.color.nombre))];
      this.tallasDisponibles = [...new Set(this.stock.map(item => item.talla.nombre))];

      this.colorSeleccionado = this.coloresDisponibles[0];
      this.tallaSeleccionada = this.tallasDisponibles[0];

      this.actualizarStock();
    });
  }

  actualizarStock(): void {
    this.stockSeleccionado = this.stock.find(
      s => s.color.nombre === this.colorSeleccionado && s.talla.nombre === this.tallaSeleccionada
    );
  }

  agregarAlCarrito(): void {
    if (!this.stockSeleccionado) return;

    const productoCarrito = {
      ...this.producto,
      colorSeleccionado: this.colorSeleccionado,
      tallaSeleccionada: this.tallaSeleccionada,
      stockId: this.stockSeleccionado.id
    };

    this.carritoService.agregarProducto(productoCarrito);
    alert('¡Producto añadido al carrito!');
  }

  cambiarImagen(img: string): void {
    this.imagenActual = img;
  }

  obtenerColorHex(nombreColor: string): string {
    const color = this.producto.colores?.find((c: any) => c.nombre === nombreColor);
    return color?.codigo_hex || '#ccc';
  }
  
}
