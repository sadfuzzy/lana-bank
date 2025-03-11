{{ config(materialized='table') }}

-- TODO: update with the business onboarding PR

with dummy as (

    select
        null as `nit_deudor`,
        null as `nit_socio	`,
        null as `porcentaje_participacion`

)

select *
from dummy
where false
