pdf_filename: facilidades-de-credito

# Guía de Facilidades de Crédito

Esta guía proporciona una descripción clara y concisa de cómo gestionar facilidades de crédito, incluyendo la creación de una nueva facilidad, la actualización de su garantía y la iniciación de desembolsos. Cada sección incluye instrucciones paso a paso y capturas de pantalla para ayudarte a navegar por el proceso sin problemas.

---

## Tabla de Contenidos
1. [Crear una Facilidad de Crédito](#1-crear-una-facilidad-de-credito)  
2. [Actualizar Garantía y Aprobación](#2-actualizar-garantia)  
3. [Desembolsar](#3-desembolsar)  
<!-- 4. [Pagos](#4-pagos) TODO: -->

---

## 1. Crear una Facilidad de Crédito {#1-crear-una-facilidad-de-credito}

**Flujo:** Visita la página de un Cliente y crea una facilidad de crédito

#### Pasos

1. Desde la página de un cliente, haz clic en el botón **Crear**. Se te presentará un menú desplegable.
  ![Hacer Clic en Crear Facilidad de Crédito](./screenshots/credit-facilities.cy.ts/1_click_create_credit_facility_button.png)

<!-- new-page -->

2. Selecciona la opción **Facilidad de Crédito** para abrir el formulario de creación de facilidad.  
  ![Abrir Formulario de Facilidad de Crédito](./screenshots/credit-facilities.cy.ts/2_open_credit_facility_form.png)

3. Ingresa el monto de facilidad deseado y selecciona una Plantilla de Términos.  
  ![Ingresar Monto de Facilidad](./screenshots/credit-facilities.cy.ts/3_enter_facility_amount.png)

<!-- new-page -->

4. Haz clic en **Crear Facilidad de Crédito**. 
  ![Enviar Formulario de Facilidad de Crédito](./screenshots/credit-facilities.cy.ts/4_submit_credit_facility_form.png)

5. Confirma que la facilidad se creó correctamente revisando el mensaje de confirmación. Deberías poder ver los detalles de la Facilidad de Crédito.
  ![Facilidad Creada Exitosamente](./screenshots/credit-facilities.cy.ts/5_credit_facility_created_success.png)

Para una Facilidad de Crédito recién creada, el Estado será **Colateralización Pendiente**.

<!-- new-page -->

---

## 2. Actualizar Garantía y Aprobación {#2-actualizar-garantia}

**Flujo:** Modificar el monto de garantía asociado con una facilidad de crédito existente

#### Pasos

1. Navega a la página de detalles de la facilidad de crédito cuya garantía se va a actualizar desde la Página de Facilidades de Crédito.
  ![Visitar Página de Facilidad de Crédito](./screenshots/credit-facilities.cy.ts/6_visit_credit_facility_page.png)

2. Haz clic en el botón **Actualizar Garantía** para abrir el formulario de actualización de garantía.  
  ![Hacer Clic en el Botón Actualizar Garantía](./screenshots/credit-facilities.cy.ts/7_click_update_collateral_button.png)

<!-- new-page -->

3. Ingresa el nuevo valor de garantía en el campo proporcionado.  
  ![Ingresar Nuevo Valor de Garantía](./screenshots/credit-facilities.cy.ts/8_enter_new_collateral_value.png)

4. Confirma la actualización para aplicar los cambios.  
  ![Confirmar Actualización de Garantía](./screenshots/credit-facilities.cy.ts/9_confirm_collateral_update.png)

<!-- new-page -->

5. Aprueba la facilidad de crédito haciendo clic en **Aprobar**.
 ![Aprobar la Facilidad de Crédito](./screenshots/credit-facilities.cy.ts/9_1_approve.png)

Ten en cuenta que puede haber más usuarios que tendrán que aprobar para que la facilidad se active.

6. Verifica que el estado de la facilidad ahora es **ACTIVO**, lo que indica una colateralización adecuada.  
  ![Verificar Estado Activo](./screenshots/credit-facilities.cy.ts/10_verify_active_status.png)

---

<!-- new-page -->

## 3. Desembolsar {#3-desembolsar}

**Flujo:** Iniciar un desembolso de fondos una vez que la facilidad está activa y adecuadamente garantizada

#### Pasos

1. Regresa a la página de detalles de la facilidad de crédito para iniciar el proceso de desembolso.  
  ![Visitar Página de Facilidad de Crédito para Desembolso](./screenshots/credit-facilities.cy.ts/11_visit_credit_facility_page_for_disbursal.png)

2. Haz clic en el botón **Iniciar Desembolso**.  
  ![Hacer Clic en el Botón Iniciar Desembolso](./screenshots/credit-facilities.cy.ts/12_click_initiate_disbursal_button.png)

<!-- new-page -->

3. Ingresa el monto del desembolso. Asegúrate de que esté dentro del límite de facilidad aprobado.  
  ![Ingresar Monto de Desembolso](./screenshots/credit-facilities.cy.ts/13_enter_disbursal_amount.png)

4. Debería aparecer un mensaje de éxito, indicando que el desembolso se inició correctamente. Revisa la página de detalles del desembolso para aprobar el proceso.
  ![Página de Desembolso](./screenshots/credit-facilities.cy.ts/15_disbursal_page.png)

<!-- new-page -->

5. Aprueba el desembolso haciendo clic en **Aprobar**.
 ![Aprobar el Desembolso](./screenshots/credit-facilities.cy.ts/16_1_approve.png)

Ten en cuenta que puede haber más usuarios que tendrán que aprobar para que la facilidad se active.

6. Verifica que el estado del desembolso ahora es **CONFIRMADO**.  
  ![Verificar Estado de Desembolso Confirmado](./screenshots/credit-facilities.cy.ts/17_verify_disbursal_status_confirmed.png)

<!-- new-page -->

7. Revisa la lista de desembolsos para ver el desembolso recién iniciado.  
  ![Desembolso en Lista](./screenshots/credit-facilities.cy.ts/18_disbursal_in_list.png)