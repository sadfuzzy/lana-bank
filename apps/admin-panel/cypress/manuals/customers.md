pdf_filename: clientes

# Clientes

Esta guía proporciona los pasos para crear un nuevo cliente, verificar su información, gestionar sus documentos y completar la verificación KYC.

---

## Tabla de Contenidos

1. [Crear y Verificar Cliente](#1-crear-y-verificar-cliente)
2. [Ver Detalles del Cliente](#2-ver-detalles-del-cliente)
3. [Gestionar Documentos del Cliente](#3-gestionar-documentos-del-cliente)
4. [Verificación KYC](#4-verificación-kyc)

---

### 1. Crear y Verificar Cliente {#1-crear-y-verificar-cliente}

**Flujo:** Crear un nuevo cliente con la información requerida y verificar sus detalles.

#### Pasos

1. Visita la página de Clientes.
   Aquí puedes ver la lista de individuos o entidades que tienen cuentas, préstamos o líneas de crédito con el banco.
   ![Paso 1: Lista de Clientes](./screenshots/customers.cy.ts/2_list_all_customers.png)

<!-- new-page -->

2. Haz clic en el botón "Crear" para iniciar el proceso de creación de un nuevo cliente.
   ![Paso 2: Hacer Clic en el Botón "Crear"](./screenshots/customers.cy.ts/3_click_create_button.png)

3. Introduce una dirección de correo electrónico única para el nuevo cliente.
   ![Paso 4: Introducir un Correo Electrónico Único](./screenshots/customers.cy.ts/5_enter_email.png)

<!-- new-page -->

4. Proporciona un ID de Telegram único para el cliente.
   ![Paso 5: Introducir un ID de Telegram Único](./screenshots/customers.cy.ts/6_enter_telegram_id.png)

5. Completa el proceso de revisión y envío:
   - Haz clic en el botón "Revisar Detalles" para proceder con la revisión de la información introducida
   - Verifica que el correo electrónico y el ID de Telegram introducidos se muestren correctamente en la pantalla de revisión
   - Haz clic en el botón "Confirmar y Enviar" para finalizar la creación del nuevo cliente
     .
     ![Paso 6: Hacer Clic en "Revisar Detalles"](./screenshots/customers.cy.ts/7_click_review_details.png)

---

<!-- new-page -->

### 2. Ver Detalles del Cliente {#2-ver-detalles-del-cliente}

**Flujo:** Acceder y verificar los detalles del cliente recién creado y su presencia en la lista de clientes.

#### Pasos

1. Mira los Detalles del Cliente.
   Aquí tienes todos los detalles del cliente. Puedes ver sus saldos y realizar todas las operaciones para este cliente desde esta pantalla.
   ![Paso 9: Página de Detalles del Cliente](./screenshots/customers.cy.ts/10_verify_email.png)

2. Navega de vuelta a la lista de clientes para verificar que el nuevo cliente aparece en la lista.
   ![Paso 10: Lista de Clientes](./screenshots/customers.cy.ts/11_verify_customer_in_list.png)

---

<!-- new-page -->

### 3. Gestionar Documentos del Cliente {#3-gestionar-documentos-del-cliente}

**Flujo:** Acceder a la sección de documentos y subir los documentos requeridos del cliente.

#### Pasos

1. Navega a la sección de documentos del cliente para comenzar a subir documentos.
   Verás la interfaz de documentos donde puedes gestionar todos los archivos relacionados con el cliente.
   ![Paso 11: Sección de Documentos](./screenshots/customers.cy.ts/12_customer_documents.png)

2. Sube documentos haciendo clic en el área de Subir o arrastrando y soltando un archivo PDF.
   Después del procesamiento, el sistema mostrará un mensaje de éxito. Luego puedes gestionar tus documentos usando el botón "Ver" para abrirlos o el botón "Eliminar" para eliminarlos del sistema.
   ![Paso 12: Subida de Documento](./screenshots/customers.cy.ts/13_upload_document.png)

---

<!-- new-page -->

### 4. Verificación KYC {#4-verificación-kyc}

**Flujo:** Completar el proceso de verificación Know Your Customer (KYC) para el cliente.

#### Pasos

1. Navega a la página de detalles del cliente para acceder a las funciones KYC.  
   Desde aquí, puedes iniciar el proceso de verificación KYC del cliente.  
   Haz clic en "Crear enlace" debajo del detalle "Enlace de Solicitud KYC" para generar una URL de verificación única que se puede compartir con el cliente, permitiéndoles iniciar su proceso de verificación.  
   ![Paso 13: Página de Detalles KYC del Cliente](./screenshots/customers.cy.ts/14_customer_kyc_details_page.png)

2. Genera un enlace de verificación KYC.  
   Una vez generado, el enlace se mostrará y estará listo para compartir con el cliente, permitiéndoles completar el proceso.  
   ![Paso 14: Enlace KYC Generado](./screenshots/customers.cy.ts/15_kyc_link_created.png)

<!-- new-page -->

3. Ver el estado KYC actualizado.  
   Después de que el cliente complete el proceso de verificación, su estado KYC se actualizará para reflejar su nivel de verificación y estado de finalización. Puedes visitar la plataforma del proveedor KYC (SumSub) haciendo clic en el ID del solicitante debajo del "Enlace de Solicitud KYC", donde puedes ver los detalles del cliente que proporcionaron durante el proceso KYC.  
   ![Paso 15: Estado KYC Actualizado](./screenshots/customers.cy.ts/16_kyc_status_updated.png)

**Nota:** El proceso de verificación KYC es completado por el cliente a través del enlace proporcionado. Una vez completado, el estado se actualizará automáticamente para reflejar el nivel de verificación y el estado de finalización.