// Importación del decorador Component y la interfaz OnInit de Angular
import { Component, OnInit } from '@angular/core';

// Importaciones necesarias para construir formularios reactivos
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// Importación del módulo común de Angular (para *ngIf, *ngFor, etc.)
import { CommonModule } from '@angular/common';

// Servicio personalizado para la gestión de productos
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-admin-listarproducto', // Nombre del selector del componente
  standalone: true, // Uso de componente autónomo (standalone)
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // Módulos importados para que el HTML funcione correctamente
  templateUrl: './admin-listarproducto.component.html', // Ruta del archivo HTML del componente
  styleUrls: ['./admin-listarproducto.component.css'] // Ruta del archivo CSS del componente
})
export class AdminListarproductoComponent implements OnInit {

  // 🧭 Sección activa en la interfaz (productos, colores, tallas, etc.)
  seccion: string = 'productos';

  // 📦 Lista de productos cargados desde la API
  productos: any[] = [];

  // 🔁 Control de vista activa (no se está usando directamente aquí)
  vista: string = 'productos';

  // 🎨 Formulario para crear nuevos colores
  formColor!: FormGroup;

  // 📏 Formulario para crear nuevas tallas
  formTalla!: FormGroup;

  // 🏷️ Formulario para crear nuevos tipos de productos
  formTipo!: FormGroup;

  // 🗂️ Formulario para crear nuevas categorías
  formCategoria!: FormGroup;

  // ➕ Mostrar u ocultar el formulario de creación de producto
  showCreateForm = false;

  // 📋 Formulario de creación de producto
  formCrear!: FormGroup;

  // 🖼️ Vista previa de la imagen cargada al crear producto
  previewCrear: string | ArrayBuffer | null = null;

  // ✏️ ID del producto que se está editando
  editId: number | null = null;

  // 📋 Formulario de edición de producto
  formEditar!: FormGroup;

  // 🖼️ Vista previa de imagen al editar producto
  previewEditar: string | null = null;

  // 🧠 Constructor del componente: inyecta el servicio de productos y el constructor de formularios
  constructor(
    private productoService: ProductoService,
    private fb: FormBuilder
  ) {}

  // ⚙️ Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.cargarProductos(); // Carga los productos desde el backend

    // Inicializa el formulario de creación de producto con todos sus campos
    this.formCrear = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0)]],
      tipo: [null],
      categoria: [null],
      peso_kg: [null],
      alto_cm: [null],
      ancho_cm: [null],
      largo_cm: [null],
      imagen_principal: [null],
      colores: [[]], // array de IDs de colores
      tallas: [[]], // array de IDs de tallas
      productos_relacionados: [[]] // array de IDs de productos relacionados
    });

    // Inicializa los formularios auxiliares (para secciones de gestión de colores, tallas, etc.)
    this.formColor = this.fb.group({ nombre: [''], codigo_hex: [''] });
    this.formTalla = this.fb.group({ nombre: [''] });
    this.formTipo = this.fb.group({ nombre: [''] });
    this.formCategoria = this.fb.group({ nombre: [''] });

    // Carga todos los datos auxiliares necesarios para los selects y checkbox
    this.cargarColores();
    this.cargarTallas();
    this.cargarTipos();
    this.cargarCategorias();

    // Inicializa los formularios principales (crear/editar) de forma segura
    this.initForms();

    this.cargarStock();

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
      tipo: [null],
      categoria: [null],
      peso_kg: [null],
      alto_cm: [null],
      ancho_cm: [null],
      largo_cm: [null],
      imagen_principal: [null],
      colores: [[]],
      tallas: [[]],
      productos_relacionados: [[]]
    });
  
    this.formEditar = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0)]],
      tipo: [null],
      categoria: [null],
      peso_kg: [null],
      alto_cm: [null],
      ancho_cm: [null],
      largo_cm: [null],
      imagen_principal: [null],
      colores: [[]],
      tallas: [[]],
      productos_relacionados: [[]]
    });
  }

  /* ── Crear inline ── */
  toggleCreate(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.formCrear.reset({
        nombre: '',
        descripcion: '',
        precio: null,
        tipo: null,
        categoria: null,
        peso_kg: null,
        alto_cm: null,
        ancho_cm: null,
        largo_cm: null,
        imagen_principal: null,
        colores: [],
        tallas: [],
        productos_relacionados: []
      });
      this.previewCrear = null;
      this.editId = null;
    }
  }

  onFileCreate(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formCrear.patchValue({ imagen_principal: file });
      const reader = new FileReader();
      reader.onload = () => this.previewCrear = reader.result;
      reader.readAsDataURL(file);
    }
  }
  
  crear(): void {
    if (this.formCrear.invalid) return;
  
    const fd = new FormData();
    fd.append('nombre', this.formCrear.value.nombre);
    fd.append('descripcion', this.formCrear.value.descripcion);
    fd.append('precio', this.formCrear.value.precio);
  
    // Solo añadir si tienen valor
    if (this.formCrear.value.tipo) {
      fd.append('tipo', this.formCrear.value.tipo);
    }
    if (this.formCrear.value.categoria) {
      fd.append('categoria', this.formCrear.value.categoria);
    }
  
    fd.append('peso_kg', this.formCrear.value.peso_kg);
    fd.append('alto_cm', this.formCrear.value.alto_cm);
    fd.append('ancho_cm', this.formCrear.value.ancho_cm);
    fd.append('largo_cm', this.formCrear.value.largo_cm);
  
    const file = this.formCrear.get('imagen_principal')?.value;
    if (file) {
      fd.append('imagen_principal', file);
    }
  
    for (const id of this.formCrear.value.colores || []) {
      fd.append('colores', id);
    }
  
    for (const id of this.formCrear.value.tallas || []) {
      fd.append('tallas', id);
    }
  
    for (const id of this.formCrear.value.productos_relacionados || []) {
      fd.append('productos_relacionados', id);
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
    const selected: number[] = this.formCrear.get(controlName)?.value || [];
  
    const id = +event.target.value;
    if (event.target.checked) {
      if (!selected.includes(id)) selected.push(id);
    } else {
      const idx = selected.indexOf(id);
      if (idx > -1) selected.splice(idx, 1);
    }
  
    this.formCrear.get(controlName)?.setValue(selected);
  }
  onCheckboxChangeEditar(event: any, controlName: string): void {
    const selected: number[] = this.formEditar.get(controlName)?.value || [];
    const id = +event.target.value;
  
    if (event.target.checked) {
      if (!selected.includes(id)) selected.push(id);
    } else {
      const idx = selected.indexOf(id);
      if (idx > -1) selected.splice(idx, 1);
    }
  
    this.formEditar.get(controlName)?.setValue(selected);
  }
  
  /* ── Editar inline ── */
  startEdit(p: any): void {
    this.editId = p.id;
    this.showCreateForm = false;
  
    this.formEditar.patchValue({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      tipo: p.tipo?.id || null,
      categoria: p.categoria?.id || null,
      peso_kg: p.peso_kg,
      alto_cm: p.alto_cm,
      ancho_cm: p.ancho_cm,
      largo_cm: p.largo_cm,
      colores: p.colores?.map((c: any) => c.id) || [],
      tallas: p.tallas?.map((t: any) => t.id) || [],
      productos_relacionados: p.productos_relacionados || []
    });
  
    this.previewEditar = p.imagen_principal || null;
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
    fd.append('peso_kg', this.formEditar.value.peso_kg);
    fd.append('alto_cm', this.formEditar.value.alto_cm);
    fd.append('ancho_cm', this.formEditar.value.ancho_cm);
    fd.append('largo_cm', this.formEditar.value.largo_cm);
  
    if (this.formEditar.value.tipo) {
      fd.append('tipo_id', this.formEditar.value.tipo);
    }
    if (this.formEditar.value.categoria) {
      fd.append('categoria_id', this.formEditar.value.categoria);
    }
  
    for (const id of this.formEditar.value.colores || []) {
      fd.append('colores_id', id);
    }
    for (const id of this.formEditar.value.tallas || []) {
      fd.append('tallas_id', id);
    }
    for (const id of this.formEditar.value.productos_relacionados || []) {
      fd.append('productos_relacionados', id);
    }
  
    const file = this.formEditar.get('imagen_principal')?.value;
    if (file) {
      fd.append('imagen_principal', file);
    }
  
    this.productoService.actualizarProducto(this.editId, fd).subscribe({
      next: updated => {
        const idx = this.productos.findIndex(x => x.id === this.editId);
        if (idx > -1) this.productos[idx] = updated;
        this.cancelEdit();
      },
      error: err => console.error('Error al editar producto:', err)
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

 // Lista completa de stock
stock: any[] = [];

// Formulario temporal
stockForm: any = {
  producto_id: null,
  talla_id: null,
  color_id: null,
  cantidad: null
};

// Almacena qué combinación se está editando
producto_id: number | null = null;
talla_id: number | null = null;
color_id: number | null = null;

// Cargar el stock desde la API
cargarStock(): void {
  this.productoService.getStock().subscribe({
    next: data => {
      this.stock = data;
      console.log('📦 Stock cargado:', this.stock);
    },
    error: err => console.error('Error al cargar stock:', err)
  });
}


// Devuelve la cantidad de una combinación (o null si no existe)
getStockCantidad(prodId: number, tallaId: number, colorId: number): number | null {
  const entry = this.stock.find(s =>
    (s.producto.id ?? s.producto) === prodId &&
    (s.talla.id ?? s.talla) === tallaId &&
    (s.color.id ?? s.color) === colorId
  );
  return entry ? entry.cantidad : null;
}



// Iniciar edición
abrirStockForm(prodId: number, tallaId: number, colorId: number): void {
  const entry = this.stock.find(s =>
    s.producto === prodId &&
    s.talla.id === tallaId &&
    s.color.id === colorId
  );
  
 
  this.producto_id = prodId;
  this.talla_id = tallaId;
  this.color_id = colorId;

  this.stockForm = {
    id: entry?.id || null,
    producto_id: prodId,
    talla_id: tallaId,
    color_id: colorId,
    cantidad: entry && entry.cantidad !== undefined ? entry.cantidad : ''
  };
  
}

editandoStock(p: number | null, t: number | null, c: number | null, idp: number, idt: number, idc: number): boolean {
  return p === idp && t === idt && c === idc;
}

// Guardar stock (nuevo o actualizado)
guardarStock(productoId: number, tallaId: number, colorId: number, cantidad: number): void {
  const fd = new FormData();
  fd.append('producto', productoId.toString());
  fd.append('talla_id', tallaId.toString());
  fd.append('color_id', colorId.toString());
  fd.append('cantidad', cantidad.toString());

  // Ver si ya existe ese registro de stock
  const existente = this.stock.find(s =>
    (s.producto.id || s.producto) === productoId &&
    (s.talla.id || s.talla) === tallaId &&
    (s.color.id || s.color) === colorId
  );
  

  if (existente) {
    // 🔁 Ya existe → ACTUALIZAR (PUT)
    this.productoService.actualizarStock(existente.id, fd).subscribe({
      next: (res) => {
        console.log('✅ Stock actualizado:', res);
        this.cancelarEdicionStock();
        this.cargarStock();
      },
      error: (err) => {
        console.error('❌ Error al actualizar stock:', err);
        alert('Hubo un error al actualizar el stock');
      }
    });
  } else {
    // ➕ No existe → CREAR (POST)
    this.productoService.crearStock(fd).subscribe({
      next: (res) => {
        console.log('✅ Stock creado:', res);
        this.cancelarEdicionStock();
        this.cargarStock();
      },
      error: (err) => {
        console.error('❌ Error al crear stock:', err);
        alert('Hubo un error al crear el stock');
      }
    });
  }
}



cancelarEdicionStock(): void {
  this.producto_id = null;
  this.talla_id = null;
  this.color_id = null;
  this.stockForm = {
    producto_id: null,
    talla_id: null,
    color_id: null,
    cantidad: null
  };
}

}