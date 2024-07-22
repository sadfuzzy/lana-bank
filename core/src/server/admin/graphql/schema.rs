use async_graphql::{types::connection::*, *};
use uuid::Uuid;

use super::{account_set::*, loan::*, shareholder_equity::*, terms::*, user::*};
use crate::{
    app::LavaApp,
    primitives::{LoanId, UserId},
    server::shared_graphql::{
        loan::Loan, objects::SuccessPayload, primitives::UUID,
        sumsub::SumsubPermalinkCreatePayload, terms::Terms, user::User,
    },
};

pub struct Query;

#[Object]
impl Query {
    async fn loan(&self, ctx: &Context<'_>, id: UUID) -> async_graphql::Result<Option<Loan>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app.loans().find_by_id(LoanId::from(id)).await?;
        Ok(loan.map(Loan::from))
    }

    async fn user(&self, ctx: &Context<'_>, id: UUID) -> async_graphql::Result<Option<User>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let user = app.users().find_by_id(UserId::from(id)).await?;
        Ok(user.map(User::from))
    }

    async fn users(
        &self,
        ctx: &Context<'_>,
        first: i32,
        after: Option<String>,
    ) -> Result<Connection<UserByNameCursor, User, EmptyFields, EmptyFields>> {
        let app = ctx.data_unchecked::<LavaApp>();
        query(
            after,
            None,
            Some(first),
            None,
            |after, _, first, _| async move {
                let first = first.expect("First always exists");
                let res = app
                    .users()
                    .list(crate::query::PaginatedQueryArgs {
                        first,
                        after: after.map(crate::user::UserByNameCursor::from),
                    })
                    .await?;
                let mut connection = Connection::new(false, res.has_next_page);
                connection
                    .edges
                    .extend(res.entities.into_iter().map(|user| {
                        let cursor = UserByNameCursor::from((user.id, user.email.as_ref()));
                        Edge::new(cursor, User::from(user))
                    }));
                Ok::<_, async_graphql::Error>(connection)
            },
        )
        .await
    }

    async fn default_terms(&self, ctx: &Context<'_>) -> async_graphql::Result<Option<Terms>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let terms = app.loans().find_default_terms().await?;
        Ok(terms.map(Terms::from))
    }

    async fn trial_balance(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Option<TrialBalance>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let account_summary = app.ledger().trial_balance().await?;
        Ok(account_summary.map(TrialBalance::from))
    }

    async fn off_balance_sheet_trial_balance(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Option<TrialBalance>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let account_summary = app.ledger().obs_trial_balance().await?;
        Ok(account_summary.map(TrialBalance::from))
    }

    async fn chart_of_accounts(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Option<ChartOfAccounts>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let chart_of_accounts = app.ledger().chart_of_accounts().await?;
        Ok(chart_of_accounts.map(ChartOfAccounts::from))
    }

    async fn off_balance_sheet_chart_of_accounts(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<Option<ChartOfAccounts>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let chart_of_accounts = app.ledger().obs_chart_of_accounts().await?;
        Ok(chart_of_accounts.map(ChartOfAccounts::from))
    }

    async fn account_set(
        &self,
        ctx: &Context<'_>,
        account_set_id: UUID,
    ) -> async_graphql::Result<Option<AccountSetAndSubAccounts>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let account_set = app
            .ledger()
            .account_set_and_sub_accounts(account_set_id.into(), 0, None)
            .await?;
        Ok(account_set.map(AccountSetAndSubAccounts::from))
    }

    async fn account_set_with_balance(
        &self,
        ctx: &Context<'_>,
        account_set_id: UUID,
    ) -> async_graphql::Result<Option<AccountSetAndSubAccountsWithBalance>> {
        let app = ctx.data_unchecked::<LavaApp>();
        let account_set = app
            .ledger()
            .account_set_and_sub_accounts_with_balance(account_set_id.into(), 0, None)
            .await?;
        Ok(account_set.map(AccountSetAndSubAccountsWithBalance::from))
    }
}

pub struct Mutation;

#[Object]
impl Mutation {
    pub async fn shareholder_equity_add(
        &self,
        ctx: &Context<'_>,
        input: ShareholderEquityAddInput,
    ) -> async_graphql::Result<SuccessPayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        Ok(SuccessPayload::from(
            app.ledger()
                .add_equity(input.amount, input.reference)
                .await?,
        ))
    }

    pub async fn sumsub_permalink_create(
        &self,
        ctx: &Context<'_>,
        input: SumsubPermalinkCreateInput,
    ) -> async_graphql::Result<SumsubPermalinkCreatePayload> {
        let user_id = Uuid::parse_str(&input.user_id);
        let user_id = user_id.map_err(|_| "Invalid user id")?;
        let user_id = UserId::from(user_id);

        let app = ctx.data_unchecked::<LavaApp>();
        let res = app.applicants().create_permalink(user_id).await?;

        let url = res.url;
        Ok(SumsubPermalinkCreatePayload { url })
    }

    async fn default_terms_update(
        &self,
        ctx: &Context<'_>,
        input: DefaultTermsUpdateInput,
    ) -> async_graphql::Result<DefaultTermsUpdatePayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let term_values = crate::loan::TermValues::builder()
            .annual_rate(input.annual_rate)
            .interval(input.interval)
            .duration(input.duration)
            .liquidation_cvl(input.liquidation_cvl)
            .margin_call_cvl(input.margin_call_cvl)
            .initial_cvl(input.initial_cvl)
            .build()?;
        let terms = app.loans().update_default_terms(term_values).await?;
        Ok(DefaultTermsUpdatePayload::from(terms))
    }
    async fn loan_create(
        &self,
        ctx: &Context<'_>,
        input: LoanCreateInput,
    ) -> async_graphql::Result<LoanCreatePayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let LoanCreateInput {
            user_id,
            desired_principal,
            loan_terms,
        } = input;
        let term_values = crate::loan::TermValues::builder()
            .annual_rate(loan_terms.annual_rate)
            .interval(loan_terms.interval)
            .duration(loan_terms.duration)
            .liquidation_cvl(loan_terms.liquidation_cvl)
            .margin_call_cvl(loan_terms.margin_call_cvl)
            .initial_cvl(loan_terms.initial_cvl)
            .build()?;
        let loan = app
            .loans()
            .create_loan_for_user(user_id, desired_principal, term_values)
            .await?;
        Ok(LoanCreatePayload::from(loan))
    }

    async fn loan_approve(
        &self,
        ctx: &Context<'_>,
        input: LoanApproveInput,
    ) -> async_graphql::Result<LoanApprovePayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app
            .loans()
            .approve_loan(input.loan_id, input.collateral)
            .await?;
        Ok(LoanApprovePayload::from(loan))
    }

    pub async fn loan_partial_payment(
        &self,
        ctx: &Context<'_>,
        input: LoanPartialPaymentInput,
    ) -> async_graphql::Result<LoanPartialPaymentPayload> {
        let app = ctx.data_unchecked::<LavaApp>();
        let loan = app
            .loans()
            .record_payment(input.loan_id.into(), input.amount)
            .await?;
        Ok(LoanPartialPaymentPayload::from(loan))
    }
}
