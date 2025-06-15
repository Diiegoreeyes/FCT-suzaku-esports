// Importación del decorador Component y la interfaz OnInit de Angular
import { ChangeDetectorRef,Component, OnInit } from '@angular/core';

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

  galeriaColorId: number | null = null;
  galeriaFiles: File[] = [];
  colorGaleriaSeleccionado: number | null = null;   // 👈 nueva propiedad
  imagenesPorColor: { [color: string]: string[] } = {};
  productoSeleccionado: any = null;
  coloresProducto: any[] = [];   // 👉 solo los colores asociados al producto
  coloresConStock: any[] = [];          // (opcional, para la tabla de stock)

  

  // 🧠 Constructor del componente: inyecta el servicio de productos y el constructor de formularios
  constructor(
    private productoService: ProductoService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef          // 👈 inyectamos
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
      productos_relacionados: [[]], // array de IDs de productos relacionados
      color_galeria: [null],

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

  getColoresDelProducto(p: any): any[] {
    return this.colores.filter(c => p.colores?.some((pc: any) => pc.id === c.id));
  }
  
  getTallasDelProducto(p: any): any[] {
    return this.tallas.filter(t => p.tallas?.some((pt: any) => pt.id === t.id));
  }
  
  

  onGaleriaFilesPorColor(event: any, color: any): void {
    const archivos = Array.from(event.target.files) as File[];
    this.galeriaArchivosPorColor[color.nombre] = archivos;
  }
  

  filesGaleria: File[] = [];
  galeriaArchivosPorColor: { [colorNombre: string]: File[] } = {};

  subirGaleriaPorColor(color: any): void {
    const archivos = this.galeriaArchivosPorColor[color.nombre];
    if (!archivos || !archivos.length || !this.productoSeleccionado) return;
  
    for (const archivo of archivos) {
      const fd = new FormData();
      fd.append('imagen', archivo);
      fd.append('color_id', color.id.toString());
      fd.append('producto', this.productoSeleccionado.id);
  
      this.productoService.subirImagenGaleria(fd).subscribe({
        next: () => {
          // Recargamos el producto tras subir cada imagen
          this.productoService.obtenerProductoDetalle(this.productoSeleccionado.id).subscribe((productoActualizado: any) => {
            this.startEdit(productoActualizado);
          });
        },
        error: () => {
          alert(`❌ Error al subir imagen para el color ${color.nombre}`);
        }
      });
    }
  
    // Limpiamos después de subir
    this.galeriaArchivosPorColor[color.nombre] = [];
  }
  
  borrarImagen(id: number): void {
    if (!confirm('¿Estás seguro de que quieres borrar esta imagen?')) return;
  
    this.productoService.borrarImagenPorId(id).subscribe({
      next: () => {
        this.productoService.obtenerProductoDetalle(this.productoSeleccionado.id).subscribe((productoActualizado: any) => {
          this.startEdit(productoActualizado);
        });
      },
      error: () => {
        alert('Error al borrar la imagen');
      }
    });
  }
  borrarImagenPorRuta(ruta: string): void {
    const imgEncontrada = this.productoSeleccionado?.galeria?.find((img: any) => img.imagen === ruta);
  
    if (!imgEncontrada) {
      alert('❌ Imagen no encontrada para eliminar.');
      return;
    }
  
    const id = imgEncontrada.id;
  
    if (!confirm('¿Quieres borrar esta imagen?')) return;
  
    this.productoService.borrarImagenPorId(id).subscribe({
      next: () => {
        this.productoService.obtenerProductoDetalle(this.productoSeleccionado.id).subscribe((productoActualizado: any) => {
          this.startEdit(productoActualizado);
        });
      },
      error: () => {
        alert('❌ Error al borrar imagen');
      }
    });
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
  // Si el formulario es inválido, detenemos
  if (this.formColor.invalid) return;

  // Obtenemos los valores directamente del formGroup
  const payload = this.formColor.value; 
  // payload = { nombre: '...', codigo_hex: '...' }

  this.productoService.crearColor(payload).subscribe({
    next: color => {
      this.colores.push(color);
      // Reiniciamos el formulario reactivo
      this.formColor.reset({ nombre: '', codigo_hex: '' });
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
  if (this.formTalla.invalid) return;
  const payload = this.formTalla.value; // { nombre: '...' }
  this.productoService.crearTalla(payload).subscribe({
    next: talla => {
      this.tallas.push(talla);
      this.formTalla.reset({ nombre: '' });
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
  if (this.formTipo.invalid) return;
  const payload = this.formTipo.value; // { nombre: '...' }
  this.productoService.crearTipo(payload).subscribe({
    next: tipo => {
      this.tipos.push(tipo);
      this.formTipo.reset({ nombre: '' });
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
  if (this.formCategoria.invalid) return;
  const payload = this.formCategoria.value; // { nombre: '...' }
  this.productoService.crearCategoria(payload).subscribe({
    next: cat => {
      this.categorias.push(cat);
      this.formCategoria.reset({ nombre: '' });
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
      productos_relacionados: [[]],
      personalizacion: [false]   
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
      productos_relacionados: [[]],
      color_galeria: [null],
      personalizacion: [false]
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
  
      this.cargarColores(); 
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
  
  onCheckboxChangeCrear(event: any, controlName: string): void {
    const selected = this.formCrear.value[controlName] || [];
    const value = parseInt(event.target.value, 10);
  
    if (event.target.checked) {
      if (!selected.includes(value)) selected.push(value);
    } else {
      const index = selected.indexOf(value);
      if (index > -1) selected.splice(index, 1);
    }
  
    this.formCrear.get(controlName)?.setValue([...selected]);
  }
  
  crear(): void {
    if (this.formCrear.invalid) return;
  
    const fd = new FormData();
  
    // Campos básicos
    fd.append('nombre', this.formCrear.value.nombre);
    fd.append('descripcion', this.formCrear.value.descripcion);
    fd.append('precio', this.formCrear.value.precio);
  
    // Relación Tipo → campo write-only “tipo_id”
    if (this.formCrear.value.tipo) {
      fd.append('tipo_id', this.formCrear.value.tipo.toString());
    }
  
    // Relación Categoría → campo write-only “categoria_id”
    if (this.formCrear.value.categoria) {
      fd.append('categoria_id', this.formCrear.value.categoria.toString());
    }
  
    fd.append('personalizacion', this.formCrear.value.personalizacion ? 'true' : 'false');

    // Datos físicos
    fd.append('peso_kg', this.formCrear.value.peso_kg);
    fd.append('alto_cm', this.formCrear.value.alto_cm);
    fd.append('ancho_cm', this.formCrear.value.ancho_cm);
    fd.append('largo_cm', this.formCrear.value.largo_cm);
  
    // Imagen principal
    const file = this.formCrear.get('imagen_principal')?.value;
    if (file) {
      fd.append('imagen_principal', file);
    }
  
    // ManyToMany “colores” → write-only “colores_id”
    const colores = this.formCrear.value.colores || [];
    for (const id of colores) {
      fd.append('colores_id', id.toString());
    }
    // ✅ ManyToMany “tallas” → write-only “tallas_id” (corregido)
    const tallas = this.formCrear.value.tallas || [];
    for (const id of tallas) {
      fd.append('tallas_id', id.toString());
    }
  
    // ManyToMany “productos_relacionados”
    const relacionados = this.formCrear.value.productos_relacionados || [];
    for (const id of relacionados) {
      fd.append('productos_relacionados', id.toString());
    }
 
    console.log('🎨 Valores seleccionados en colores:', this.formCrear.value.colores);

    // Enviar al backend
    this.productoService.crearProducto(fd).subscribe({
      next: prod => {
        this.productos.push(prod);
        this.toggleCreate(); // Cierra el formulario
      },
      error: err => {
        console.error('Error al crear producto:', err);
        alert('No se pudo crear el producto. Revisa consola para más detalles.');
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
    
  startEdit(p: any): void {
    // Si el producto ya trae galería (viene de /detalle), no hace falta pedirlo de nuevo
    if (p.galeria) {
      this._cargarProductoEditable(p);
    } else {
      // Si no trae galería, lo obtenemos desde el endpoint /detalle/
      this.productoService.obtenerProductoDetalle(p.id).subscribe((productoDetallado) => {
        this._cargarProductoEditable(productoDetallado);
      });
    }
  }
 
  private _cargarProductoEditable(p: any): void {
    this.editId         = p.id;
    this.showCreateForm = false;
  
    /* ─── Parcheamos el formulario ─── */
    this.formEditar.patchValue({
      nombre:      p.nombre,
      descripcion: p.descripcion,
      precio:      p.precio,
      tipo:        typeof p.tipo      === 'object' ? p.tipo?.id      : p.tipo      ?? null,
      categoria:   typeof p.categoria === 'object' ? p.categoria?.id : p.categoria ?? null,
      peso_kg:     p.peso_kg,
      alto_cm:     p.alto_cm,
      ancho_cm:    p.ancho_cm,
      largo_cm:    p.largo_cm,
      colores:     p.colores?.map((c: any) => c.id) ?? [],
      tallas:      p.tallas ?.map((t: any) => t.id) ?? [],
      productos_relacionados: p.productos_relacionados ?? [],
      personalizacion: p.personalizacion 

    });
  
    /* ─── Datos auxiliares de la vista ─── */
    this.previewEditar      = p.imagen_principal ?? null;
    this.productoSeleccionado = p;
  
    /* 🎨 1. Colores del producto (todos los que tiene asociados) */
    this.coloresProducto = p.colores ?? [];
  
    /* 🎨 2. Colores que realmente están en stock (opcional, para la tabla) */
    const idsConStock       = new Set(p.stock_items?.map((s: any) => s.color.id));
    this.coloresConStock    = p.colores?.filter((c: any) => idsConStock.has(c.id)) ?? [];
  
    /* 🖼️ 3. Imágenes principales por color */
    this.imagenesPorColor = {};
    (p.galeria || []).forEach((img: any) => {
      const nombre = img.color?.nombre;
      if (nombre) {
        this.imagenesPorColor[nombre] ??= [];
        this.imagenesPorColor[nombre].push(img.imagen);
      }
    });
  
    this.cdr.detectChanges();
  }
  
  

  
  onFileEdit(evt: any): void {
    const file = evt.target.files[0];
    if (!file) return;
    this.formEditar.patchValue({ foto: file });
    this.previewEditar = URL.createObjectURL(file);
  }

  saveEdit(): void {
    const productoId = this.productoSeleccionado?.id ?? this.editId;
    if (!productoId || this.formEditar.invalid) return;
  
    console.log('🔍 formEditar values:', this.formEditar.value); // 🧪 Útil para ver posibles "undefined"
  
    const fd = new FormData();
    fd.append('nombre', this.formEditar.value.nombre);
    fd.append('descripcion', this.formEditar.value.descripcion);
    fd.append('personalizacion',this.formEditar.value.personalizacion ? 'true' : 'false');
    fd.append('precio', this.formEditar.value.precio);
    fd.append('peso_kg', this.formEditar.value.peso_kg);
    fd.append('alto_cm', this.formEditar.value.alto_cm);
    fd.append('ancho_cm', this.formEditar.value.ancho_cm);
    fd.append('largo_cm', this.formEditar.value.largo_cm);
  
    if (this.formEditar.value.tipo) {
      fd.append('tipo_id', this.formEditar.value.tipo.toString());
    }
    if (this.formEditar.value.categoria) {
      fd.append('categoria_id', this.formEditar.value.categoria.toString());
    }
  
    // ✅ Función auxiliar para evitar valores undefined
    const appendIDs = (key: string, arr: any[]) => {
      for (const id of arr || []) {
        if (id != null) {
          fd.append(key, id.toString());
        }
      }
    };
  
    appendIDs('colores_id', this.formEditar.value.colores);
    appendIDs('tallas_id', this.formEditar.value.tallas);
    appendIDs('productos_relacionados', this.formEditar.value.productos_relacionados);
  
    const file = this.formEditar.get('imagen_principal')?.value;
    if (file) {
      fd.append('imagen_principal', file);
    }
  
    this.productoService.actualizarProducto(productoId, fd).subscribe({
      next: updated => {
        const idx = this.productos.findIndex(x => x.id === productoId);
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
get galeriaActual(): any[] {
  const producto = this.productos.find(p => p.id === this.editId);
  return producto?.galeria || [];
}

obtenerProductos(): void {
  this.productoService.listar().subscribe((data: any[]) => {
    this.productos = data;
  });
}

subirImagenPrincipalPorColor(event: any, color: any): void {
  const archivo = event.target.files[0];
  if (!archivo || !this.productoSeleccionado) return;

  const fd = new FormData();
  fd.append('imagen', archivo);
  fd.append('color_id', color.id.toString());  // ✅ esto sí lo detectará Django
  fd.append('producto', this.productoSeleccionado.id);

  this.productoService.subirImagenGaleria(fd).subscribe({
    next: () => {
      alert(`Imagen para ${color.nombre} subida correctamente`);

      // ✅ Recarga los productos y solo después vuelve a entrar en edición
      this.productoService.obtenerProductoDetalle(this.productoSeleccionado.id).subscribe((productoActualizado: any) => {
        this.startEdit(productoActualizado);
      });
      
    },
    error: () => {
      alert('Error al subir la imagen');
    }
  });
}

seleccionarColorGaleria(id: number): void {
  this.colorGaleriaSeleccionado = id;
}





}