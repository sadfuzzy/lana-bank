## general

for webhook (opt):

on one terminal:
`python3 webhook.py`

on another one, launch ngrok:
`ngrok http 5253`

the webhook needs to now be updated from sumsub interface here
https://cockpit.sumsub.com/checkus#/devSpace/webhooks/webhookManager

it won't work with staging, so the staging webhook needs to be deactivated if errors arise


if ngrok give this:  https://0f5c-190-150-67-13.ngrok-free.app -> http://localhost:5253 

add `https://0f5c-190-150-67-13.ngrok-free.app/sumsub/callback` to sumsub callback api

## for applicant

1. create a new link with ./create_sumsub_link.sh

.env need to be configured with SUMSUB_KEY and SUMSUB_SECRET

to test it works correctly locally, run 

```
curl -X POST http://localhost:5253/sumsub/callback \
  -H "Content-Type: application/json" \
  -d '{
    "applicantId": "test-applicant-id",
    "externalUserId": "test-user-id",
    "type": "applicantCreated",
    "reviewStatus": "init"
  }'
```

2. calling sumsub for the result 

`./get_sumsub_applicant.sh $(cat .sumsub_customer_id)`


## for transactions

`./submit_finance_transaction.sh`
