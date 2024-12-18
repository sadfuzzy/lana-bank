# Customers

This guide provides the steps for creating a new customer, verifying their information, managing their documents, and completing KYC verification.

---

## Table of Contents

1. [Create and Verify Customer](#1-create-and-verify-customer)
2. [View Customer Details](#2-view-customer-details)
3. [Manage Customer Documents](#3-manage-customer-documents)
4. [KYC Verification](#4-kyc-verification)

---

### 1. Create and Verify Customer {#1-create-and-verify-customer}

**Flow:** Create a new customer with required information and verify their details.

#### Steps

1. Visit the Customers page.
   Here you can see the list of individuals or entities who hold accounts, loans, or credit facilities with the bank.
   ![Step 1: Customers List](./screenshots/customers.cy.ts/2_list_all_customers.png)

<!-- new-page -->

2. Click on the "Create" button to initiate the process of creating a new customer.
   ![Step 2: Click the "Create" Button](./screenshots/customers.cy.ts/3_click_create_button.png)

3. Input a unique email address for the new customer.
   ![Step 4: Enter a Unique Email](./screenshots/customers.cy.ts/5_enter_email.png)

<!-- new-page -->

4. Provide a unique Telegram ID for the customer.
   ![Step 5: Enter a Unique Telegram ID](./screenshots/customers.cy.ts/6_enter_telegram_id.png)

5. Complete the review and submission process:
   - Click the "Review Details" button to proceed with reviewing the entered information
   - Verify that the entered email and Telegram ID are displayed correctly on the review screen
   - Click the "Confirm and Submit" button to finalize the creation of the new customer
     .
     ![Step 6: Click "Review Details"](./screenshots/customers.cy.ts/7_click_review_details.png)

---

<!-- new-page -->

### 2. View Customer Details {#2-view-customer-details}

**Flow:** Access and verify the newly created customer's details and presence in the customer list.

#### Steps

1. Look at the Customer Details.
   Here you have all the customer details. You can view their balances and perform all operations for this customer from this screen.
   ![Step 9: Customer Details Page](./screenshots/customers.cy.ts/10_verify_email.png)

2. Navigate back to the customers list to verify that the new customer appears in the list.
   ![Step 10: Customers List](./screenshots/customers.cy.ts/11_verify_customer_in_list.png)

---

<!-- new-page -->

### 3. Manage Customer Documents {#3-manage-customer-documents}

**Flow:** Access the documents section and upload required customer documents.

#### Steps

1. Navigate to the customer's documents section to start uploading documents.
   You'll see the documents interface where you can manage all customer-related files.
   ![Step 11: Documents Section](./screenshots/customers.cy.ts/12_customer_documents.png)

2. Upload documents by clicking the Upload area or dragging and dropping a PDF file.
   After processing, the system will display a success message. You can then manage your documents by using the "View" button to open them or the "Delete" button to remove them from the system.
   ![Step 12: Document Upload](./screenshots/customers.cy.ts/13_upload_document.png)

---

<!-- new-page -->

### 4. KYC Verification {#4-kyc-verification}

**Flow:** Complete the Know Your Customer (KYC) verification process for the customer.

#### Steps

1. Navigate to the customer's details page to access KYC features.  
   From here, you can start the customer's KYC verification process.  
   Click on "Create link" below the "KYC Application Link" detail to generate a unique verification URL that can be shared with the customer, allowing them to start their verification process.  
   ![Step 13: Customer KYC Details Page](./screenshots/customers.cy.ts/14_customer_kyc_details_page.png)

2. Generate a KYC verification link.  
   Once generated, the link will be displayed and ready to share with the customer, enabling them to complete the process.  
   ![Step 14: KYC Link Generated](./screenshots/customers.cy.ts/15_kyc_link_created.png)

<!-- new-page -->

3. View the updated KYC status.  
   After the customer completes the verification process, their KYC status will be updated to reflect their verification level and completion status. You can visit the KYC provider platform (SumSub) by clicking on the applicant ID below the "KYC Application Link," where you can see the customer details they provided during the KYC process.  
   ![Step 15: Updated KYC Status](./screenshots/customers.cy.ts/16_kyc_status_updated.png)

**Note:** The KYC verification process is completed by the customer through the provided link. Once completed, the status will automatically update to reflect the verification level and completion status.
