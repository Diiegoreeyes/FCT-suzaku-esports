import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { RouterModule } from '@angular/router';  // ✅ añade esto
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.component.html',
  imports: [CommonModule, FormsModule,RouterModule],
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {
  /*IA*/ 
  productosRecomendados: any[] = [];

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
  valoraciones: any[] = [];
  usuarioActual: any = null;
  nombrePersonalizado: string = '';

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
    private carritoService: CarritoService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      
        // Scroll al principio de la página con animación suave
        if (typeof window !== 'undefined') {
          window.scrollTo(0, 0); // o lo que sea que estás usando
        }
        this.productoService.obtenerProductoDetalle(id).subscribe((data: any) => {
        this.producto = data;
        this.stock = data.stock_items || [];
        this.imagenesPorColor = data.imagenes_por_color || {};
        console.log('🖼️ Mapa imagenes_por_color:', this.imagenesPorColor);

        this.coloresDisponibles = [...new Set(this.stock.map((s: any) => s.color.nombre))];
        this.tallasDisponibles = [...new Set(this.stock.map((s: any) => s.talla.nombre))];
  
        this.colorSeleccionado = this.coloresDisponibles[0]
          || Object.keys(this.imagenesPorColor)[0]
          || '';
        this.tallaSeleccionada = this.tallasDisponibles[0] || '';
  
        this.actualizarGaleria();
        this.actualizarStock();
        this.cargarValoraciones();
      });
  
      this.productoService.obtenerRecomendaciones(id).subscribe((res) => {
        this.productosRecomendados = res;
      });

      this.usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

      this.productoService.obtenerValoraciones(id).subscribe((res) => {
        this.valoraciones = res;
      });

    });
  }
  nuevaValoracion = {
    puntuacion: 0,
    comentario: '',
  };
  valoracionImagen: File | null = null;
  previewUrl: string | null = null;
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.valoracionImagen = file;
  
      // Vista previa
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }
  
  cargarValoraciones(): void {
    this.http.get<any[]>(`http://127.0.0.1:8000/api/valoraciones/?producto=${this.producto.id}`)
      .subscribe(res => {
        this.valoraciones = res;
      });
  }
  
  enviarValoracion(): void {
    const formData = new FormData();
    formData.append('producto', this.producto.id.toString());
    formData.append('usuario', this.usuarioActual.id.toString());
    formData.append('puntuacion', this.nuevaValoracion.puntuacion.toString());
    formData.append('comentario', this.nuevaValoracion.comentario);
  
    if (this.valoracionImagen) {
      formData.append('imagen', this.valoracionImagen);
    }
  
    this.http.post('http://127.0.0.1:8000/api/valoraciones/', formData).subscribe(() => {
      alert('¡Gracias por tu valoración!');
      this.nuevaValoracion = { puntuacion: 0, comentario: '' };
      this.valoracionImagen = null;
      this.previewUrl = null;
      this.cargarValoraciones(); // Recarga
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
    // Si no hay combinación válida, no hacemos nada
    if (!this.stockSeleccionado) { return; }

    /* ───── 1. Localizar objetos completos de color y talla ───── */
    const colorObj = this.producto.colores
      ?.find((c: any) => c.nombre === this.colorSeleccionado);
    const tallaObj = this.producto.tallas
      ?.find((t: any) => t.nombre === this.tallaSeleccionada);

    /* ───── 2. Escoger la miniatura correcta según el color ───── */
    const imgColor =
      this.imagenesPorColor?.[this.colorSeleccionado]?.[0]   // primera imagen del color
      ?? this.producto.imagen_principal;                    // fallback a la foto genérica

    /* ───── 3. Construir el objeto para el carrito ───── */
    const productoCarrito = {
      id:                 this.producto.id,
      nombre:             this.producto.nombre,
      precio:             +this.producto.precio,
      imagen_principal:   imgColor,          // 👈 miniatura del color
      stockId:            this.stockSeleccionado.id,
      colorSeleccionado:  colorObj,          // { id, nombre, codigo_hex }
      tallaSeleccionada:  tallaObj,          // { id, nombre }
      cantidad:           1,
      nombrePersonalizado: this.nombrePersonalizado?.trim() || null
    };

    /* ───── 4. Guardar y navegar al carrito ───── */
    this.carritoService.agregarProducto(productoCarrito);
    this.router.navigate(['/carrito']);
  }


  cambiarImagen(img: string): void {
    this.imagenActual = img;
  }

  obtenerColorHex(nombreColor: string): string {
    const color = this.producto.colores?.find((c: any) => c.nombre === nombreColor);
    return color?.codigo_hex || '#ccc';
  }
  
}
