pdf_filename: usuarios

# Usuarios

Esta guía proporciona una descripción clara y concisa de cómo gestionar usuarios en la aplicación, incluyendo la creación de nuevos usuarios y la administración de sus roles. Cada sección incluye instrucciones paso a paso y capturas de pantalla para ayudarte a navegar por el proceso sin problemas.

## Tabla de Contenidos

1. [Introducción](#introduccion)
2. [Creación de Nuevos Usuarios](#creacion-de-nuevos-usuarios)
3. [Gestión de Roles de Usuario](#gestion-de-roles-de-usuario)

---

## Introducción {#introduccion}

La gestión de usuarios es esencial para controlar el acceso a la aplicación. Una gestión adecuada de usuarios asegura que los miembros del equipo tengan niveles de acceso y permisos apropiados mientras se mantiene la seguridad.

Esta guía cubre el ciclo de vida completo:

- **Creación de Nuevos Usuarios:** Configuración de usuarios con roles y permisos iniciales
- **Gestión de Roles de Usuario:** Actualización y verificación de niveles de acceso de usuario

---

## Creación de Nuevos Usuarios {#creacion-de-nuevos-usuarios}

Sigue estos pasos para crear y configurar un nuevo usuario en la aplicación.

### Paso 1: Visitar la Página de Usuarios {#visitar-pagina-de-usuarios}

Navega a la página de Usuarios donde puedes ver la lista de todos los usuarios con sus roles y permisos.
![Paso 1: Lista de Usuarios](./screenshots/user.cy.ts/1_users_list.png)

<!-- new-page -->

### Paso 2: Iniciar la Creación de Usuario {#iniciar-creacion-de-usuario}

Haz clic en el botón "Crear" para comenzar a crear un nuevo usuario.
![Paso 2: Hacer Clic en el Botón Crear](./screenshots/user.cy.ts/2_click_create_button.png)

### Paso 3: Configurar el Correo Electrónico del Usuario {#configurar-correo-electronico}

Ingresa la dirección de correo electrónico para el nuevo usuario.
![Paso 3: Ingresar Correo Electrónico](./screenshots/user.cy.ts/3_enter_email.png)

<!-- new-page -->

### Paso 4: Establecer Rol Inicial {#establecer-rol-inicial}

Selecciona la casilla de rol de administrador para otorgar privilegios administrativos.
![Paso 4: Asignar Rol de Administrador](./screenshots/user.cy.ts/4_assign_admin_role.png)

### Paso 5: Enviar Detalles del Usuario {#enviar-detalles-usuario}

Haz clic en el botón enviar para crear el usuario y enviar un enlace mágico.
![Paso 5: Enviar Creación](./screenshots/user.cy.ts/5_submit_creation.png)

<!-- new-page -->

### Paso 6: Confirmar Creación {#confirmar-creacion}

Confirma que el usuario se ha creado correctamente y se ha enviado el enlace mágico.
![Paso 6: Verificar Creación](./screenshots/user.cy.ts/6_verify_creation.png)

### Paso 7: Verificar Lista de Usuarios {#verificar-lista-usuarios}

Navega de vuelta a la lista de usuarios para verificar que aparece el nuevo usuario.
![Paso 7: Ver en Lista](./screenshots/user.cy.ts/7_view_in_list.png)

---

<!-- new-page -->

## Gestión de Roles de Usuario {#gestion-de-roles-de-usuario}

Una vez que se crea un usuario, puedes gestionar sus roles y permisos para ajustar sus niveles de acceso.

### Paso 1: Acceder a la Gestión de Roles {#acceder-gestion-roles}

Haz clic en el usuario y gestiona sus roles asignando permisos adicionales.
![Paso 8: Gestionar Roles](./screenshots/user.cy.ts/8_manage_roles.png)

### Paso 2: Actualizar Permisos de Usuario {#actualizar-permisos-usuario}

Selecciona roles adicionales (por ejemplo, Contador) para actualizar los permisos del usuario.
![Paso 9: Actualizar Roles](./screenshots/user.cy.ts/9_update_roles.png)

<!-- new-page -->

### Paso 3: Verificar Cambios de Rol {#verificar-cambios-rol}

Confirma que la actualización del rol se ha realizado correctamente.
![Paso 10: Verificar Actualización](./screenshots/user.cy.ts/10_verify_update.png)

Siguiendo estos pasos, puedes gestionar eficientemente los usuarios y sus roles mientras mantienes un control de acceso adecuado en toda la aplicación.

---
