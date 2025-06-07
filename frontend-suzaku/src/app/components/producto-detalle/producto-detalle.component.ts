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
  imagenesPorColor: { [color: string]: string[] } = {};
  actualizarGaleria(): void {
    const imagenesColor = this.imagenesPorColor[this.colorSeleccionado] || [];
    this.galeriaImagenes = imagenesColor;
  
    this.imagenActual = imagenesColor.length
      ? imagenesColor[0]
      : this.producto.imagen_principal;  // fallback
  }
  

  constructor(
    private route: ActivatedRoute,
    private productoService: ProductoService,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
  
    this.productoService.obtenerProductoDetalle(id).subscribe((data: any) => {
      this.producto = data;
      this.stock    = data.stock_items || [];
    
      this.imagenesPorColor = data.imagenes_por_color || {};
    
      this.coloresDisponibles = [...new Set(this.stock.map((s: any) => s.color.nombre))];
      this.tallasDisponibles  = [...new Set(this.stock.map((s: any) => s.talla.nombre))];
    
      this.colorSeleccionado = this.coloresDisponibles[0]
                            || Object.keys(this.imagenesPorColor)[0]
                            || '';
    
      this.tallaSeleccionada = this.tallasDisponibles[0] || '';
    
      this.actualizarGaleria();
      this.actualizarStock();
    });
    
  }
  
  
  
  hayStockPara(talla: string): boolean {
    return this.stock.some(
      s => s.color.nombre === this.colorSeleccionado &&
           s.talla.nombre === talla &&
           s.cantidad > 0
    );
  }
  
  seleccionarTalla(talla: string): void {
    this.tallaSeleccionada = talla;
    this.actualizarStock();
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
