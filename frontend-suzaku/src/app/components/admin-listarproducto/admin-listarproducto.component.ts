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

  productos: any[] = [];

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
    this.initForms();
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
    const f = this.formCrear.get('foto')!.value;
    if (f) fd.append('foto', f);

    this.productoService.crearProducto(fd).subscribe({
      next: prod => {
        this.productos.push(prod);
        this.toggleCreate();
      }, error: e => console.error('Error crear', e)
    });
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