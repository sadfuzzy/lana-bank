{{ config(materialized='table') }}

select
    right(id_codigo_cuenta, 10) as id_codigo_cuenta,
    left(nom_cuenta, 80) as nom_cuenta,
    format('%.2f', round(valor, 2)) as valor

from {{ ref('int_npb4_16_01_saldo_cuenta_xml_raw') }}
