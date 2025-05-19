# 🛍️ Tienda Suzaku Esports

**Tienda Suzaku Esports** es una plataforma de comercio electrónico centrada en productos de merchandising, ropa y accesorios de videojuegos, anime y cultura pop. Cuenta con una interfaz moderna, intuitiva y adaptable tanto para usuarios como administradores.

---

## 📦 Funcionalidades

- ✅ Registro y login con autenticación por token (JWT)
- ✅ Gestión de perfil y direcciones
- ✅ Carrito de compra y proceso de checkout
- ✅ Aplicación de códigos de descuento
- ✅ Panel de administración con gestión de productos, pedidos, posts, equipo y sponsors
- ✅ Valoraciones y comentarios en productos
- ✅ Control de stock por talla y color
- ✅ Imágenes y videos promocionales para productos y sponsors
- ✅ Responsive y preparado para producción

---

## 🚀 Tecnologías Utilizadas

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 17, HTML5, CSS3 |
| Backend | Django 4, Django REST Framework |
| Base de Datos | PostgreSQL |
| Autenticación | JWT |
| Estilos | Bootstrap, estilos personalizados |
| Despliegue | Docker, NGINX, Gunicorn |

---

## ⚙️ Instalación Local (Modo Desarrollo)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Diiegoreeyes/FCT-suzaku-esports
   cd tu-repo

2. **Iniciar Proyecto - Backend (Django + DRF)**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

3. **Iniciar Proyecto - Frontend (Angular)**
    ```bash
    cd frontend
    npm install
    ng serve