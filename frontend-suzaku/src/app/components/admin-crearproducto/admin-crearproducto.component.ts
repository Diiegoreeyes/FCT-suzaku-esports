import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-crearproducto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-crearproducto.component.html',
  styleUrls: ['./admin-crearproducto.component.css']
})
export class AdminCrearproductoComponent implements OnInit {
  formProducto!: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formProducto = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [null, [Validators.required, Validators.min(0)]],
      foto: [null]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.formProducto.patchValue({ foto: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  crearProducto(): void {
    if (this.formProducto.invalid) return;

    const formData = new FormData();
    formData.append('nombre', this.formProducto.get('nombre')?.value);
    formData.append('descripcion', this.formProducto.get('descripcion')?.value);
    formData.append('precio', this.formProducto.get('precio')?.value);

    const foto = this.formProducto.get('foto')?.value;
    if (foto) formData.append('foto', foto);

    this.productoService.crearProducto(formData).subscribe({
      next: () => {
        alert('✅ Producto creado con éxito');
        this.router.navigate(['/administrador/listar-productos']);
      },
      error: () => {
        alert('❌ Error al crear el producto');
      }
    });
  }
}
