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
npm install
ng serve --open
```

---

## 💻 Si vas a desplegar en AWS

> Requiere una instancia EC2 (t3.medium mínimo recomendado) y abrir puertos 8000 y 4200 en el *Security Group*.

### 1. Conectarse a la instancia EC2 (desde tu PC con Git Bash)
```bash
ssh -i suzaku-key.pem ubuntu@TU_IP_PUBLICA
```

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


### 5. Cargar datos y ejecutar servidor
```bash
python manage.py migrate
python manage.py loaddata backup.json
python manage.py runserver 0.0.0.0:8000
Si quieres permanentemente: nohup python manage.py runserver 0.0.0.0:8000 > django.log 2>&1 &

```



### 6. Iniciar el Frontend (Angular)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g @angular/cli http-server
cd frontend-suzaku
npm install
grep -rl '127.0.0.1:8000' src/app | xargs sed -i 's|127.0.0.1:8000|TU_IP:8000|g'
ng build --configuration production
cat > bs-config.js << 'EOF'
module.exports = {
  port: 4200,
  server: {
    baseDir: "dist/frontend-suzaku/browser",
    middleware: {
      1: require('connect-history-api-fallback')({
        index: '/index.html',
        verbose: true
      })
    }
  }
};

lite-server

Si quieres permanentemente: nohup lite-server > lite.log 2>&1 &```

### 7. Accede desde otro dispositivo
En tu navegador:  
```
http://TU_IP_PUBLICA:4200
```

---

