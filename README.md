# Sistema de Gestión de Proyectos

Un sistema web completo para la gestión de proyectos y tareas desarrollado con React, Next.js y Tailwind CSS.

## 🚀 Características

- ✅ **Autenticación completa** - Registro, login y protección de rutas
- ✅ **Roles diferenciados** - Gerente y Usuario con permisos específicos
- ✅ **Gestión de proyectos** - CRUD completo para proyectos
- ✅ **Gestión de tareas** - Sistema Kanban para organizar tareas
- ✅ **Dashboard interactivo** - Estadísticas y resúmenes visuales
- ✅ **Diseño responsive** - Optimizado para móviles y escritorio
- ✅ **API REST simulada** - Usando JSON Server para desarrollo

## 🛠️ Tecnologías

- **Frontend**: React 18 + Next.js 14
- **Estilos**: Tailwind CSS
- **HTTP Client**: Axios
- **Estado**: React Context + Hooks
- **API**: JSON Server (simulada)
- **Iconos**: Lucide React
- **Despliegue**: Vercel

## 📋 Prerequisitos

- Node.js 18 o superior
- npm o yarn
- Git

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/project-management.git
   cd project-management
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Iniciar JSON Server (API simulada)**
   ```bash
   # En una terminal separada
   npm run json-server
   ```

5. **Iniciar la aplicación**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 👤 Credenciales de Prueba

### Gerente
- **Email**: gerente@test.com
- **Contraseña**: 123456

### Usuario
- **Email**: usuario@test.com  
- **Contraseña**: 123456

## 📁 Estructura del Proyecto

```
project-management/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── layout/         # Componentes de layout
│   ├── projects/       # Componentes de proyectos
│   └── tasks/          # Componentes de tareas
├── context/            # Context API de React
├── lib/                # Utilidades y configuración
├── pages/              # Páginas de Next.js
│   ├── auth/          # Páginas de autenticación
│   ├── projects/      # Páginas de proyectos
│   └── tasks/         # Páginas de tareas
├── styles/             # Archivos CSS
├── public/             # Archivos estáticos
├── db.json            # Base de datos simulada
└── package.json       # Dependencias del proyecto
```

## 🎯 Funcionalidades por Rol

### 👨‍💼 Gerente
- Crear, editar y eliminar proyectos
- Crear, editar y eliminar tareas
- Asignar tareas a miembros del equipo
- Ver dashboard completo con estadísticas
- Gestionar miembros de proyecto

### 👤 Usuario
- Ver proyectos asignados
- Actualizar estado de tareas propias
- Ver dashboard personal
- Recibir notificaciones de tareas

## 🔐 Sistema de Autenticación

- **Registro**: Validación de formularios y creación de usuarios
- **Login**: Autenticación con email y contraseña
- **Protección de rutas**: Context API para verificar autenticación
- **Persistencia**: localStorage para mantener sesión
- **Roles**: Diferenciación de permisos según rol de usuario

## 📊 API Endpoints

### Autenticación
```
GET  /users              # Listar usuarios (para login)
POST /users              # Crear usuario (registro)
```

### Proyectos
```
GET    /projects         # Listar proyectos
GET    /projects/:id     # Obtener proyecto específico
POST   /projects         # Crear proyecto
PUT    /projects/:id     # Actualizar proyecto
DELETE /projects/:id     # Eliminar proyecto
```

### Tareas
```
GET    /tasks            # Listar tareas
GET    /tasks?projectId=:id  # Tareas por proyecto
POST   /tasks            # Crear tarea
PUT    /tasks/:id        # Actualizar tarea
DELETE /tasks/:id        # Eliminar tarea
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conectar repositorio a Vercel**
   - Crear cuenta en [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub
   - Configurar variables de entorno

2. **Variables de entorno en Vercel**
   ```
   NEXT_PUBLIC_API_URL=https://tu-api-url.com
   NEXT_PUBLIC_APP_URL=https://tu-proyecto.vercel.app
   ```

3. **Desplegar**
   - Push a rama main/master
   - Despliegue automático

### Para API en producción
Considera usar servicios como:
- **Railway** - Para desplegar JSON Server
- **Heroku** - Para APIs Node.js
- **Supabase** - Base de datos y API
- **Firebase** - Backend completo

## 📱 Capturas de Pantalla

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Lista de Proyectos  
![Projects](screenshots/projects.png)

### Gestión de Tareas
![Tasks](screenshots/tasks.png)

### Login/Registro
![Auth](screenshots/auth.png)

## 🧪 Testing

```bash
# Ejecutar tests (si están configurados)
npm test

# Linting
npm run lint

# Build para producción
npm run build
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linting
npm run json-server  # API simulada
```

## ⚠️ Notas Importantes

- **Datos simulados**: Utiliza JSON Server para desarrollo
- **Persistencia**: Los datos se reinician al reiniciar JSON Server
- **Producción**: Requiere API real para entorno productivo
- **Autenticación**: Implementación básica para desarrollo

## 🐛 Troubleshooting

### Problema: CORS Error
```bash
# Solución: Verificar que JSON Server esté corriendo
npm run json-server
```

### Problema: Rutas no funcionan
```bash
# Solución: Verificar configuración Next.js
npm run build
```

### Problema: Estilos no cargan
```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙋‍♂️ Soporte

Para preguntas o problemas:
- Crear un [Issue](https://github.com/tu-usuario/project-management/issues)
- Email: tu-email@ejemplo.com

## 🎉 Agradecimientos

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [JSON Server](https://github.com/typicode/json-server)

---

**Desarrollado con ❤️ para la gestión eficiente de proyectos**export default TaskCard;
