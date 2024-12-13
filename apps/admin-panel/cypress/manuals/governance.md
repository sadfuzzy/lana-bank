# Governance Test Steps

This document outlines the steps taken in the Governance tests, along with corresponding screenshots captured during test execution.

---

## Table of Contents
1. [Create a Committee](#1-create-a-committee)
2. [Verify Committee in List](#2-verify-committee-in-list)
3. [Add a Member to the Committee](#3-add-a-member-to-the-committee)
4. [Attach Committee to a Policy](#4-attach-committee-to-a-policy)
5. [View Pending Actions](#5-view-pending-actions)
6. [Approve a Process](#6-approve-a-process)
7. [Deny a Process](#7-deny-a-process)

---

### 1. Create a Committee
**Test Action:** Visit the Committees page, create a new committee, and verify it is created successfully.

#### Steps
1. Visit the Committees page.  
   ![Step 1: Visit Committees Page](./screenshots/governance.cy.ts/1_step-visit-committees.png)

2. Click the "Create Committee" button.  
   ![Step 2: Click Create Committee Button](./screenshots/governance.cy.ts/2_step-click-create-committee-button.png)

3. Fill in the committee name and verify the input.  
   ![Step 3: Fill Committee Name](./screenshots/governance.cy.ts/3_step-fill-committee-name.png)

4. Submit the form to create the committee.  
   ![Step 4: Submit Committee Creation](./screenshots/governance.cy.ts/4_step-submit-committee-creation.png)

5. Verify the success message after creation.  
   ![Step 5: Committee Created Successfully](./screenshots/governance.cy.ts/5_step-committee-created-successfully.png)

---

### 2. Verify Committee in List
**Test Action:** Return to the committees list and verify the newly created committee is visible.

#### Steps
1. Visit the Committees list page.  
   ![Step 6: Committees List](./screenshots/governance.cy.ts/6_step-view-committees-list.png)

---

### 3. Add a Member to the Committee
**Test Action:** Open the committee details page, add a new member (admin) to the committee, and verify the action was successful.

#### Steps
1. Visit the committee details page.  
   ![Step 7: Visit Committee Details](./screenshots/governance.cy.ts/7_step-visit-committee-details.png)

2. Click the "Add Member" button.  
   ![Step 8: Click Add Member Button](./screenshots/governance.cy.ts/8_step-click-add-member-button.png)

3. Select the "admin" role from the dropdown.  
   ![Step 9: Select Admin Role](./screenshots/governance.cy.ts/9_step-select-admin-role.png)

4. Submit the form to add the member.  
   ![Step 10: Submit Add Member](./screenshots/governance.cy.ts/10_step-submit-add-member.png)

5. Verify the success message and member addition.  
   ![Step 11: Member Added Successfully](./screenshots/governance.cy.ts/11_step-verify-member-added.png)

---

### 4. Attach Committee to a Policy
**Test Action:** Visit the policies page, assign the previously created committee to a policy, and verify the assignment.

#### Steps
1. Visit the Policies page.  
   ![Step 12: Visit Policies Page](./screenshots/governance.cy.ts/12_step-visit-policies-page.png)

2. Select a policy from the list.  
   ![Step 13: Select Policy](./screenshots/governance.cy.ts/13_step-select-policy.png)

3. Assign the committee to the policy with a threshold.  
   ![Step 14: Assign Committee to Policy](./screenshots/governance.cy.ts/14_step-assign-committee-to-policy.png)

4. Verify the success message and committee assignment.  
   ![Step 15: Verify Committee Assigned](./screenshots/governance.cy.ts/15_step-verify-committee-assigned.png)

---

### 5. View Pending Actions
**Test Action:** Initiate a deposit and withdrawal for a customer, then visit the actions page to verify pending approvals.

#### Steps
1. Visit the Actions page.  
   ![Step 16: View Actions Page](./screenshots/governance.cy.ts/16_step-view-actions-page.png)

2. Verify the pending withdrawal is visible.  
   ![Step 17: Verify Pending Withdrawal](./screenshots/governance.cy.ts/17_step-verify-pending-withdrawal.png)

---

### 6. Approve a Process
**Test Action:** As a committee member, approve a process (e.g., approving a withdrawal assigned to the committee).

#### Steps
1. Create and visit the withdrawal details page.  
   ![Step 18: Visit Withdrawal Details](./screenshots/governance.cy.ts/18_step-visit-withdrawal-details.png)

2. Click the "Approve" button.  
   ![Step 19: Click Approve Button](./screenshots/governance.cy.ts/19_step-click-approve-button.png)

3. Verify the approval success and status change.  
   ![Step 20: Verify Approval Success](./screenshots/governance.cy.ts/20_step-verify-approval-success.png)

---

### 7. Deny a Process
**Test Action:** As a committee member, deny a process (e.g., denying a withdrawal assigned to the committee).

#### Steps
1. Create and visit the withdrawal details page.  
   ![Step 21: Visit Withdrawal for Denial](./screenshots/governance.cy.ts/21_step-visit-withdrawal-for-denial.png)

2. Click the "Deny" button and provide a reason.  
   ![Step 22: Click Deny Button](./screenshots/governance.cy.ts/22_step-click-deny-button.png)

3. Verify the denial success and status change.  
   ![Step 23: Verify Denial Success](./screenshots/governance.cy.ts/23_step-verify-denial-success.png)
