# Ejemplos de API - Beach Rental Management

## Índice
1. [Autenticación](#autenticación)
2. [Productos](#productos)
3. [Equipos de Seguridad](#equipos-de-seguridad)
4. [Reservas](#reservas)
5. [Disponibilidad](#disponibilidad)

---

## Autenticación

### Login de Usuario (Admin)

**Método:** POST  
**URL:** http://localhost:5001/api/auth/login

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "admin",
  "password": "adminpassword"
}
```

**Respuesta Ejemplo:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "123456789",
    "username": "admin",
    "name": "Usuario Admin",
    "role": "admin",
    "permissions": ["view_products", "manage_products"]
  }
}
```

---

### Login de Staff

**Método:** POST  
**URL:** http://localhost:5001/api/auth/login

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "staff",
  "password": "staffpassword"
}
```

---

### Obtener Perfil del Usuario

**Método:** GET  
**URL:** http://localhost:5001/api/auth/profile

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

## Productos

### Listar Todos los Productos

**Método:** GET  
**URL:** http://localhost:5001/api/products

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Obtener Producto por ID

**Método:** GET  
**URL:** http://localhost:5001/api/products/ID_PRODUCTO

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Crear Producto Nuevo

**Método:** POST  
**URL:** http://localhost:5001/api/products

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "type": "JetSki",
  "quantity": 2,
  "price": 120,
  "status": "available"
}
```

---

### Crear Producto Nuevo (Surfboard)

**Método:** POST  
**URL:** http://localhost:5001/api/products

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "type": "Surfboard",
  "sizeCategory": "adult",
  "quantity": 5,
  "price": 30,
  "status": "available"
}
```

---

### Actualizar Producto

**Método:** PUT  
**URL:** http://localhost:5001/api/products/ID_PRODUCTO

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "quantity": 8,
  "price": 110,
  "status": "available"
}
```

---

### Eliminar Producto

**Método:** DELETE  
**URL:** http://localhost:5001/api/products/ID_PRODUCTO

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Filtrar Productos

**Método:** GET  
**URL:** http://localhost:5001/api/products/find?type=JetSki&status=available

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

## Equipos de Seguridad

### Listar Equipos de Seguridad

**Método:** GET  
**URL:** http://localhost:5001/api/safety-equipment

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Obtener Equipo de Seguridad por ID

**Método:** GET  
**URL:** http://localhost:5001/api/safety-equipment/ID_EQUIPO

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Crear Equipo de Seguridad

**Método:** POST  
**URL:** http://localhost:5001/api/safety-equipment

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "type": "Helmet",
  "size": "L",
  "quantity": 10,
  "status": "available"
}
```

---

### Actualizar Equipo de Seguridad

**Método:** PUT  
**URL:** http://localhost:5001/api/safety-equipment/ID_EQUIPO

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "quantity": 15,
  "status": "available"
}
```

---

### Eliminar Equipo de Seguridad

**Método:** DELETE  
**URL:** http://localhost:5001/api/safety-equipment/ID_EQUIPO

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

## Reservas

### Listar Todas las Reservas

**Método:** GET  
**URL:** http://localhost:5001/api/reservations

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Obtener Reserva por ID

**Método:** GET  
**URL:** http://localhost:5001/api/reservations/ID_RESERVA

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Obtener Reservas por Fecha

**Método:** GET  
**URL:** http://localhost:5001/api/reservations/date/2025-04-30

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

### Crear Reserva

**Método:** POST  
**URL:** http://localhost:5001/api/reservations

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "customer": {
    "name": "Juan Pérez",
    "contact": "juan@example.com"
  },
  "products": [
    {
      "product": "ID_JETSKI",
      "quantity": 1
    }
  ],
  "safetyEquipment": [
    {
      "equipment": "ID_HELMET",
      "quantity": 1
    },
    {
      "equipment": "ID_LIFEJACKET",
      "quantity": 1
    }
  ],
  "date": "2025-04-30",
  "slots": [28, 29],
  "totalPrice": 120,
  "paymentDeadline": "2025-04-30T00:00:00.000Z"
}
```

> **Nota**: Los slots son números del 0-47, donde 28=14:00-14:30 y 29=14:30-15:00

---

### Actualizar Reserva

**Método:** PUT  
**URL:** http://localhost:5001/api/reservations/ID_RESERVA

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "customer": {
    "name": "Juan Pérez",
    "contact": "juan.nuevo@example.com"
  },
  "slots": [30, 31]
}
```

---

### Cancelar Reserva

**Método:** PUT  
**URL:** http://localhost:5001/api/reservations/ID_RESERVA/cancel

**Headers:**
```
(No se requieren headers)
```

---

### Procesar Pago

**Método:** PUT  
**URL:** http://localhost:5001/api/reservations/ID_RESERVA/payment

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_JWT_AQUI
```

**Body:**
```json
{
  "type": "cash",
  "currency": "local"
}
```

---

### Procesar Reembolso por Tormenta

**Método:** PUT  
**URL:** http://localhost:5001/api/reservations/ID_RESERVA/storm-refund

**Headers:**
```
Authorization: Bearer TOKEN_JWT_AQUI
```

---

## Disponibilidad

### Verificar Disponibilidad por Fecha

**Método:** GET  
**URL:** http://localhost:5001/api/availability/2025-04-30

**Headers:**
```
(No se requieren headers)
```

---

### Verificar Disponibilidad de Producto Específico

**Método:** GET  
**URL:** http://localhost:5001/api/availability/2025-04-30/ID_PRODUCTO

**Headers:**
```
(No se requieren headers)
```

---

## Notas adicionales

### Sobre los slots de tiempo
Los slots representan franjas de 30 minutos y se numeran de 0 a 47, donde:
- 0 = 00:00-00:30
- 1 = 00:30-01:00
- 28 = 14:00-14:30
- 29 = 14:30-15:00
- 47 = 23:30-00:00

### IDs de ejemplo
Aquí hay algunos IDs que puedes usar en tus pruebas:
- Producto (JetSki): `681151828a8214b692361046`
- Equipo (Casco): `681151828a8214b69236104d`
- Equipo (Chaleco): `681151828a8214b692361050`

### Reemplazo de valores
Recuerda reemplazar los siguientes valores en los ejemplos:
- `TOKEN_JWT_AQUI`: Token obtenido al hacer login
- `ID_PRODUCTO`, `ID_EQUIPO`, `ID_RESERVA`: IDs reales obtenidos de las respuestas de los endpoints de listado
