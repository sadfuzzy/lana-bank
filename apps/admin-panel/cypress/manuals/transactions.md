# Transactions

This guide provides the steps for creating deposits and managing withdrawals in the application.

---

## Table of Contents

1. [Create Deposits](#1-create-deposits)
2. [Create Withdrawals](#2-create-withdrawals)
3. [Manage Withdrawals](#3-manage-withdrawals)
   - [Cancel Withdrawals](#cancel-withdrawals)
   - [Approve Withdrawals](#approve-withdrawals)

---

### 1. Create Deposits {#1-create-deposits}

**Flow:** Create a new deposit and verify its creation in various views.

#### Steps

1. Click on the global create button to initiate a new deposit.
   ![Step 1: Click Create Button](./screenshots/transactions.cy.ts/1_deposit_create_button.png)

<!-- new-page -->

2. Choose the "Create Deposit" option to start a new deposit.
   ![Step 2: Select Deposit](./screenshots/transactions.cy.ts/2_deposit_select.png)

3. Input the amount you wish to deposit in the designated field.
   ![Step 3: Enter Details](./screenshots/transactions.cy.ts/3_deposit_enter_amount.png)

<!-- new-page -->

4. Click the Submit button to process your deposit.
   ![Step 4: Submit Deposit](./screenshots/transactions.cy.ts/4_deposit_submit.png)

5. You will see a success message confirming your deposit was created.
   ![Step 5: Success Message](./screenshots/transactions.cy.ts/5_deposit_success.png)

<!-- new-page -->

6. Verify the deposit:
   - Check that your deposit appears in the main deposits list
     ![Step 6: Deposits List](./screenshots/transactions.cy.ts/6_deposit_in_list.png)
   - Verify the deposit is visible in the customer's transaction history
     ![Step 7: Transaction History](./screenshots/transactions.cy.ts/7_deposit_in_transactions.png)

---

<!-- new-page -->

### 2. Create Withdrawals {#2-create-withdrawals}

**Flow:** Create a new withdrawal and verify its creation in the system.

#### Steps

1. Click the Create button to start a new withdrawal.
   ![Step 8: Start Withdrawal](./screenshots/transactions.cy.ts/8_withdrawal_create_button.png)

2. Click the "Create Withdrawal" button.
   ![Step 9: Select Withdrawal](./screenshots/transactions.cy.ts/9_withdrawal_select.png)

<!-- new-page -->

3. Specify the amount you wish to withdraw.
   ![Step 10: Enter Amount](./screenshots/transactions.cy.ts/10_withdrawal_enter_amount.png)

4. Submit the withdrawal request for processing.
   ![Step 11: Submit](./screenshots/transactions.cy.ts/11_withdrawal_submit.png)

<!-- new-page -->

5. Verify the withdrawal:
   - Check that the withdrawal appears in the main withdrawals list
     ![Step 12: Withdrawals List](./screenshots/transactions.cy.ts/12_withdrawal_in_list.png)
   - Verify the withdrawal is visible in the customer's transaction history
     ![Step 13: Transaction History](./screenshots/transactions.cy.ts/13_withdrawal_in_transactions.png)

---

<!-- new-page -->

### 3. Manage Withdrawals {#3-manage-withdrawals}

#### Cancel Withdrawals

**Flow:** Cancel a pending withdrawal request.

#### Steps

1. To cancel a withdrawal, click the Cancel button.
   ![Step 14: Cancel Button](./screenshots/transactions.cy.ts/14_withdrawal_cancel_button.png)

2. Confirm that you want to cancel the withdrawal.
   ![Step 15: Confirm Cancel](./screenshots/transactions.cy.ts/15_withdrawal_cancel_confirm.png)

<!-- new-page -->

3. The withdrawal status will update to cancelled.
   ![Step 16: Cancelled Status](./screenshots/transactions.cy.ts/16_withdrawal_cancelled_status.png)

<!-- new-page -->

#### Approve Withdrawals

**Flow:** Approve a pending withdrawal request.

#### Steps

1. To approve a withdrawal, click the Approve button.
   ![Step 17: Approve Button](./screenshots/transactions.cy.ts/17_withdrawal_approve_button.png)

2. Confirm that you want to approve the withdrawal.
   ![Step 18: Confirm Approval](./screenshots/transactions.cy.ts/18_withdrawal_approve_confirm.png)

<!-- new-page -->

3. The withdrawal status will update to confirmed.
   ![Step 19: Approved Status](./screenshots/transactions.cy.ts/19_withdrawal_approved_status.png)

---

By following these steps, you should be able to successfully create deposits and manage withdrawals in the application.
