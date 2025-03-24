// admin-editarproducto.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-admin-editarproducto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-editarproducto.component.html',
  styleUrls: ['./admin-editarproducto.component.css']

})
export class AdminEditarproductoComponent implements OnInit {
  formProducto!: FormGroup;
  productoId!: number;
  imagenPreview: string | null = null;
  imagenArchivo: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));
    this.inicializarFormulario();
    this.cargarProducto();
  }

  inicializarFormulario(): void {
    this.formProducto = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: ['', Validators.required],
    });
  }

  cargarProducto(): void {
    this.productoService.getProducto(this.productoId).subscribe((producto: any) => {
      this.formProducto.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio
      });
      this.imagenPreview = producto.foto ? `http://127.0.0.1:8000${producto.foto}` : null;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imagenArchivo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  actualizarProducto(): void {
    if (this.formProducto.invalid) return;

    const formData = new FormData();
    formData.append('nombre', this.formProducto.get('nombre')?.value);
    formData.append('descripcion', this.formProducto.get('descripcion')?.value);
    formData.append('precio', this.formProducto.get('precio')?.value);

    if (this.imagenArchivo) {
      formData.append('foto', this.imagenArchivo);
    }

    this.productoService.actualizarProducto(this.productoId, formData).subscribe({
      next: () => {
        alert('Producto actualizado correctamente');
        this.router.navigate(['/administrador/listar-productos']);
      },
      error: () => {
        alert('Error al actualizar el producto');
      }
    });
  }
}
