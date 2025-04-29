# Sistema de Gestión de Alquiler de Equipos de Playa - Marcos Buratovich

Proyecto Full Stack Universidad de Palermo - Marcos Buratovich

### Instalación y Ejecución

1. **Clonar el repositorio:**
   ```
   git clone https://github.com/marcosburatovich/Proyecto-Full-Stack-UP---Marcos-Buratovich.git
   cd Proyecto-Full-Stack-UP---Marcos-Buratovich
   ```

2. **Instalar dependencias:**
   ```
   npm install
   ```

3. **Iniciar el servidor:**
   ```
   npm start
   ```
   La API estará disponible en: http://localhost:5001

**IMPORTANTE:** La API está configurada para utilizar MongoDB local. Es necesario tener MongoDB instalado en su sistema.

### Requisitos de Base de Datos
1. Instalar MongoDB Community Edition (si no está instalado)
2. Asegurarse que el servicio de MongoDB esté funcionando

3. Poblar la base de datos (ejecutar después de instalar las dependencias):
   ```
   npm run seed
   ```

### Documentación de la API

La documentación de la API está disponible en:
- /ejemplos-api.md

## Credenciales de Prueba

**Usuario Administrador:**
- Username: `admin`
- Password: `adminpassword`

**Usuario Staff:**
- Username: `staff`
- Password: `staffpassword`

## API Endpoints

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/register`

### Productos
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Equipos de Seguridad
- `GET /api/safety-equipment`
- `GET /api/safety-equipment/:id`
- `POST /api/safety-equipment`
- `PUT /api/safety-equipment/:id`
- `DELETE /api/safety-equipment/:id`

### Reservas
- `GET /api/reservations`
- `GET /api/reservations/:id`
- `GET /api/reservations/date/:date`
- `POST /api/reservations`
- `PUT /api/reservations/:id`
- `PUT /api/reservations/:id/cancel`
- `PUT /api/reservations/:id/payment`
- `PUT /api/reservations/:id/storm-refund`

### Disponibilidad
- `GET /api/availability/:date`
- `GET /api/availability/:date/:productId`

## Reglas de Negocio

- Las motos acuáticas requieren chaleco salvavidas
- Tanto las motos acuáticas como los ATVs requieren casco
- Máximo 2 personas por producto (1-2 equipos de seguridad según corresponda)
- Cada franja horaria es de 30 minutos
- Máximo 3 franjas consecutivas por cliente
- Reservas con hasta 48 horas de anticipación
- Cancelación sin penalidad hasta 2 horas antes de la franja
- Reembolso del 50% por tormenta