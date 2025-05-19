import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,FormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-admin-listarproducto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './admin-listarproducto.component.html',
  styleUrls: ['./admin-listarproducto.component.css']
})
export class AdminListarproductoComponent implements OnInit {

  seccion: string = 'productos';  // Valor inicial por defecto
  productos: any[] = [];
  vista: string = 'productos';
  // Colores
  formColor!: FormGroup;

  // Tallas
  formTalla!: FormGroup;

  // Tipos
  formTipo!: FormGroup;

  // Categorías
  formCategoria!: FormGroup;

  // Estado crear inline
  showCreateForm = false;
  formCrear!: FormGroup;
  previewCrear: string | ArrayBuffer | null = null;

  // Estado editar inline
  editId: number | null = null;
  formEditar!: FormGroup;
  previewEditar: string | null = null;

  constructor(
    private productoService: ProductoService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  
    // Formularios auxiliares para las secciones
    this.formColor = this.fb.group({ nombre: [''], codigo_hex: [''] });
    this.formTalla = this.fb.group({ nombre: [''] });
    this.formTipo = this.fb.group({ nombre: [''] });
    this.formCategoria = this.fb.group({ nombre: [''] });
  
    // Carga de datos auxiliares
    this.cargarColores();
    this.cargarTallas();
    this.cargarTipos();
    this.cargarCategorias();
  
    // Inicializa formularios principales de productos (crear y editar)
    this.initForms();
  }
  
  
  
// ------------------ COLORES ------------------
colores: any[] = [];
nuevoColor: any = { nombre: '', codigo_hex: '' };
cambiarSeccion(nombre: string): void {
  this.seccion = nombre;
}
cargarColores(): void {
  this.productoService.getColores().subscribe({
    next: data => this.colores = data,
    error: err => console.error('Error al cargar colores:', err)
  });
}

crearColor(): void {
  if (!this.nuevoColor.nombre) return;
  this.productoService.crearColor(this.nuevoColor).subscribe({
    next: color => {
      this.colores.push(color);
      this.nuevoColor = { nombre: '', codigo_hex: '' };
    },
    error: err => console.error('Error al crear color:', err)
  });
}

eliminarColor(id: number): void {
  if (!confirm('¿Eliminar este color?')) return;
  this.productoService.eliminarColor(id).subscribe({
    next: () => this.colores = this.colores.filter(c => c.id !== id),
    error: err => console.error('Error al eliminar color:', err)
  });
}

// ------------------ TALLAS ------------------
tallas: any[] = [];
nuevaTalla: any = { nombre: '' };

cargarTallas(): void {
  this.productoService.getTallas().subscribe({
    next: data => this.tallas = data,
    error: err => console.error('Error al cargar tallas:', err)
  });
}

crearTalla(): void {
  if (!this.nuevaTalla.nombre) return;
  this.productoService.crearTalla(this.nuevaTalla).subscribe({
    next: talla => {
      this.tallas.push(talla);
      this.nuevaTalla = { nombre: '' };
    },
    error: err => console.error('Error al crear talla:', err)
  });
}

eliminarTalla(id: number): void {
  if (!confirm('¿Eliminar esta talla?')) return;
  this.productoService.eliminarTalla(id).subscribe({
    next: () => this.tallas = this.tallas.filter(t => t.id !== id),
    error: err => console.error('Error al eliminar talla:', err)
  });
}

// ------------------ TIPOS ------------------
tipos: any[] = [];
nuevoTipo: any = { nombre: '' };

cargarTipos(): void {
  this.productoService.getTipos().subscribe({
    next: data => this.tipos = data,
    error: err => console.error('Error al cargar tipos:', err)
  });
}

crearTipo(): void {
  if (!this.nuevoTipo.nombre) return;
  this.productoService.crearTipo(this.nuevoTipo).subscribe({
    next: tipo => {
      this.tipos.push(tipo);
      this.nuevoTipo = { nombre: '' };
    },
    error: err => console.error('Error al crear tipo:', err)
  });
}

eliminarTipo(id: number): void {
  if (!confirm('¿Eliminar este tipo?')) return;
  this.productoService.eliminarTipo(id).subscribe({
    next: () => this.tipos = this.tipos.filter(t => t.id !== id),
    error: err => console.error('Error al eliminar tipo:', err)
  });
}

// ------------------ CATEGORÍAS ------------------
categorias: any[] = [];
nuevaCategoria: any = { nombre: '' };

cargarCategorias(): void {
  this.productoService.getCategorias().subscribe({
    next: data => this.categorias = data,
    error: err => console.error('Error al cargar categorías:', err)
  });
}

crearCategoria(): void {
  if (!this.nuevaCategoria.nombre) return;
  this.productoService.crearCategoria(this.nuevaCategoria).subscribe({
    next: cat => {
      this.categorias.push(cat);
      this.nuevaCategoria = { nombre: '' };
    },
    error: err => console.error('Error al crear categoría:', err)
  });
}

eliminarCategoria(id: number): void {
  if (!confirm('¿Eliminar esta categoría?')) return;
  this.productoService.eliminarCategoria(id).subscribe({
    next: () => this.categorias = this.categorias.filter(c => c.id !== id),
    error: err => console.error('Error al eliminar categoría:', err)
  });
}

  
stockList: { color: any, talla: any, cantidad: number }[] = [];

agregarStock(color: any, talla: any, cantidad: number) {
  this.stockList.push({ color, talla, cantidad });
}

imagenesGaleria: File[] = [];
onGaleriaChange(event: any) {
  this.imagenesGaleria = Array.from(event.target.files);
}

  
  
  private cargarProductos(): void {
    this.productoService.getProductos().subscribe({
      next: data => this.productos = data,
      error: err => console.error('Error cargar productos:', err)
    });
  }

  private initForms(): void {
    this.formCrear = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0)]],
      foto: [null]
    });
    this.formEditar = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0)]],
      foto: [null]
    });
  }

  /* ── Crear inline ── */
  toggleCreate(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      // resetear solo al abrir
      this.formCrear.reset();
      this.previewCrear = null;
      this.editId = null;
    }
  }

  onFileCreate(evt: any): void {
    const file = evt.target.files[0];
    if (!file) return;
    this.formCrear.patchValue({ foto: file });
    const reader = new FileReader();
    reader.onload = () => this.previewCrear = reader.result;
    reader.readAsDataURL(file);
  }

  crear(): void {
    if (this.formCrear.invalid) return;
  
    const fd = new FormData();
    fd.append('nombre', this.formCrear.value.nombre);
    fd.append('descripcion', this.formCrear.value.descripcion);
    fd.append('precio', this.formCrear.value.precio);
    fd.append('tipo', this.formCrear.value.tipo);
    fd.append('categoria', this.formCrear.value.categoria);
    fd.append('peso_kg', this.formCrear.value.peso_kg);
    fd.append('alto_cm', this.formCrear.value.alto_cm);
    fd.append('ancho_cm', this.formCrear.value.ancho_cm);
    fd.append('largo_cm', this.formCrear.value.largo_cm);
  
    // Imagen principal
    const imagen = this.formCrear.get('imagen_principal')?.value;
    if (imagen) {
      fd.append('imagen_principal', imagen);
    }
  
    // Colores (array de IDs)
    for (const colorId of this.formCrear.value.colores) {
      fd.append('colores', colorId);
    }
  
    // Tallas (array de IDs)
    for (const tallaId of this.formCrear.value.tallas) {
      fd.append('tallas', tallaId);
    }
  
    // Productos relacionados (array de IDs)
    for (const relId of this.formCrear.value.productos_relacionados) {
      fd.append('productos_relacionados', relId);
    }
  
    this.productoService.crearProducto(fd).subscribe({
      next: prod => {
        this.productos.push(prod);
        this.toggleCreate();
      },
      error: err => {
        console.error('Error al crear producto:', err);
      }
    });
  }
  onCheckboxChange(event: any, controlName: string): void {
    const selectedValues: number[] = this.formCrear.get(controlName)?.value || [];
  
    if (event.target.checked) {
      // Añadir el valor si está marcado y no está ya incluido
      if (!selectedValues.includes(+event.target.value)) {
        selectedValues.push(+event.target.value);
      }
    } else {
      // Quitar el valor si se desmarca
      const index = selectedValues.indexOf(+event.target.value);
      if (index > -1) {
        selectedValues.splice(index, 1);
      }
    }
  
    this.formCrear.get(controlName)?.setValue(selectedValues);
  }
  

  /* ── Editar inline ── */
  startEdit(p: any): void {
    this.editId = p.id;
    this.showCreateForm = false;
    this.formEditar.patchValue({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio
    });
    this.previewEditar = p.foto || null;
  }

  onFileEdit(evt: any): void {
    const file = evt.target.files[0];
    if (!file) return;
    this.formEditar.patchValue({ foto: file });
    this.previewEditar = URL.createObjectURL(file);
  }

  saveEdit(): void {
    if (this.editId === null || this.formEditar.invalid) return;
    const fd = new FormData();
    fd.append('nombre', this.formEditar.value.nombre);
    fd.append('descripcion', this.formEditar.value.descripcion);
    fd.append('precio', this.formEditar.value.precio);
    const f = this.formEditar.get('foto')!.value;
    if (f) fd.append('foto', f);

    this.productoService.actualizarProducto(this.editId, fd).subscribe({
      next: updated => {
        const idx = this.productos.findIndex(x => x.id === this.editId);
        if (idx > -1) this.productos[idx] = updated;
        this.cancelEdit();
      }, error: e => console.error('Error editar', e)
    });
  }

  cancelEdit(): void {
    this.editId = null;
    this.previewEditar = null;
    this.formEditar.reset();
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar producto?')) return;
    this.productoService.eliminarProducto(id).subscribe({
      next: () => this.productos = this.productos.filter(p => p.id !== id),
      error: e => console.error('Error eliminar', e)
    });
  }

  getFoto(url: string): string {
    if (!url) return 'assets/default-producto.jpg';
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  }
}