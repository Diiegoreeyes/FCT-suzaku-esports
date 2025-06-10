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

| Capa       | Tecnología                 |
|------------|----------------------------|
| Frontend   | Angular 17, HTML5, CSS3    |
| Backend    | Django 4, Django REST Framework |
| Base de Datos | PostgreSQL              |
| Autenticación | JWT                     |
| Estilos    | Bootstrap, estilos personalizados |
| Despliegue | Docker, NGINX, Gunicorn    |

---

## ⚙️ Instalación Local (Modo Desarrollo)

### 1. Clonar el repositorio y configurar Python
```bash
sudo apt update
sudo apt install python3 python3-pip python-is-python3 -y  
git clone https://github.com/Diiegoreeyes/FCT-suzaku-esports
cd FCT-suzaku-esports
python -m venv venv
source venv/bin/activate
```

### 2. Iniciar Proyecto - Backend (Django + DRF)
```bash
cd tienda
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata backup.json
python manage.py runserver
```

### 3. Iniciar Proyecto - Frontend (Angular)
```bash
cd frontend-suzaku
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g @angular/cli
ng serve --open
```

---

## 💻 Si vas a desplegar en AWS

> Requiere una instancia EC2 (t3.medium mínimo recomendado) y abrir puertos 8000 y 4200 en el *Security Group*.

### 1. Conectarse a la instancia EC2 (desde tu PC con Git Bash)
```bash
ssh -i suzaku-key.pem ubuntu@TU_IP_PUBLICA
```
python3.10-venv

### 2. Instaslaciones previa
```bash
sudo apt update
sudo apt install python3 python3-pip python3.10-venv python-is-python3 -y
sudo apt install postgresql postgresql-contrib -y
```

### 3. Configurar Django para producción
```bash
git clone https://github.com/Diiegoreeyes/FCT-suzaku-esports
cd FCT-suzaku-esports
python -m venv venv
source venv/bin/activate
cd tienda
pip install -r requirements.txt
```

### 4. Crear base de datos en PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE bd_suzaku;
CREATE USER diego WITH PASSWORD 'diego';
ALTER ROLE diego SET client_encoding TO 'utf8';
ALTER ROLE diego SET default_transaction_isolation TO 'read committed';
ALTER ROLE diego SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bd_suzaku TO diego;
\q
```

✅ **NOTA IMPORTANTE:** 
### Recuerda editar `ALLOWED_HOSTS` en `settings.py` y permitir el tráfico (Django):
```bash
nano settings

ALLOWED_HOSTS = ['*']

Ctrl+o y Ctrl+x
```
### Y si quieres mantener compatibilidad con desarrollo local:
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'TU_IP_PUBLICA']
```



### 5. Cargar datos y ejecutar servidor
```bash
python manage.py migrate
python manage.py loaddata backup.json
python manage.py runserver 0.0.0.0:8000
```



### 6. Iniciar el Frontend (Angular)
```bash
cd ../frontend-suzaku
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g http-server 
sudo npm install -g @angular/cli
grep -rl '127.0.0.1:8000' src/app | xargs sed -i 's|127.0.0.1:8000|TU_IP_PUBLICA:8000|g'
ng build --configuration production
http-server dist/frontend-suzaku --host 0.0.0.0 --port 4200```

### 7. Accede desde otro dispositivo
En tu navegador:  
```
http://TU_IP_PUBLICA:4200
```

---

