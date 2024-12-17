# Credit Facilities Guide

This guide provides a clear and concise overview of how to manage credit facilities, including creating a new facility, updating its collateral, and initiating disbursals. Each section includes step-by-step instructions and accompanying screenshots to help you navigate the process seamlessly.

---

## Table of Contents
1. [Create a Credit Facility](#1-create-a-credit-facility)  
2. [Update Collateral and Approval](#2-update-collateral)  
3. [Disburse](#3-disburse)  
<!-- 4. [Payments](#4-payments) TODO: -->

---

## 1. Create a Credit Facility {#1-create-a-credit-facility}

**Flow:** Visit a Customer's page and create a credit facility

#### Steps

1. From a customer’s page, click the **Create** button. You will be presented with a dropdown.
   ![Click Create Credit Facility](./screenshots/credit-facilities.cy.ts/1_click_create_credit_facility_button.png)

<!-- new-page -->

2. Select the **Credit Facility** option to open the facility creation form.  
   ![Open Credit Facility Form](./screenshots/credit-facilities.cy.ts/2_open_credit_facility_form.png)

3. Enter the desired facility amount, and select a Terms Template.  
   ![Enter Facility Amount](./screenshots/credit-facilities.cy.ts/3_enter_facility_amount.png)

<!-- new-page -->

4. Click **Create Credit Facility**. 
   ![Submit Credit Facility Form](./screenshots/credit-facilities.cy.ts/4_submit_credit_facility_form.png)

5. Confirm the facility was created successfully by reviewing the confirmation message. You should be able to see the Credit Facility details.
   ![Facility Created Successfully](./screenshots/credit-facilities.cy.ts/5_credit_facility_created_success.png)

For a newly created Credit Facility, the Status shall be **Pending Collateralization**.

<!-- new-page -->

---

## 2. Update Collateral and Approval {#2-update-collateral}

**Flow:** Modify the collateral amount associated with an existing credit facility

#### Steps

1. Navigate to the credit facility’s detail page whose collateral is to be updated from the Credit Facilities Page.
   ![Visit Credit Facility Page](./screenshots/credit-facilities.cy.ts/6_visit_credit_facility_page.png)

2. Click the **Update Collateral** button to open the collateral update form.  
   ![Click Update Collateral Button](./screenshots/credit-facilities.cy.ts/7_click_update_collateral_button.png)

<!-- new-page -->

3. Enter the new collateral value in the provided field.  
   ![Enter New Collateral Value](./screenshots/credit-facilities.cy.ts/8_enter_new_collateral_value.png)

4. Confirm the update to apply the changes.  
   ![Confirm Collateral Update](./screenshots/credit-facilities.cy.ts/9_confirm_collateral_update.png)

<!-- new-page -->

5. Approve the credit facility by clicking **Approve**.
  ![Approve the Credit Facility](./screenshots/credit-facilities.cy.ts/9_1_approve.png)

Please note that there maybe more users who will have to approve for the facility to become active.

6. Verify that the facility’s status is now **ACTIVE**, indicating proper collateralization.  
   ![Verify Active Status](./screenshots/credit-facilities.cy.ts/10_verify_active_status.png)

---

<!-- new-page -->

## 3. Disburse {#3-disburse}

**Flow:** Initiate a funds disbursal once the facility is active and adequately secured

#### Steps

1. Return to the credit facility detail page to start the disbursal process.  
   ![Visit Credit Facility Page for Disbursal](./screenshots/credit-facilities.cy.ts/11_visit_credit_facility_page_for_disbursal.png)

2. Click the **Initiate Disbursal** button.  
   ![Click Initiate Disbursal Button](./screenshots/credit-facilities.cy.ts/12_click_initiate_disbursal_button.png)

<!-- new-page -->

3. Enter the disbursal amount. Ensure it is within the approved facility limit.  
   ![Enter Disbursal Amount](./screenshots/credit-facilities.cy.ts/13_enter_disbursal_amount.png)

4. A success message should appear, indicating the disbursal was initiated successfully. Review the disbursal detail page to approve the process.
   ![Disbursal Page](./screenshots/credit-facilities.cy.ts/15_disbursal_page.png)

<!-- new-page -->

5. Approve the disbursal by clicking **Approve**.
  ![Approve the Disbursal](./screenshots/credit-facilities.cy.ts/16_1_approve.png)

Please note that there maybe more users who will have to approve for the facility to become active.

6. Verify the disbursal status is now **CONFIRMED**.  
   ![Verify Disbursal Status Confirmed](./screenshots/credit-facilities.cy.ts/17_verify_disbursal_status_confirmed.png)

<!-- new-page -->

7. Check the disbursal list to see the newly initiated disbursal.  
   ![Disbursal in List](./screenshots/credit-facilities.cy.ts/18_disbursal_in_list.png)

