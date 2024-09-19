#!/bin/bash

set -eu

export PACKAGE_DIR="${PACKAGE_DIR:-.}"
export CI_ROOT=$(pwd)

host_name=$(cat nix-host/metadata | jq -r '.docker_host_name')
echo "Running on host: ${host_name}"
host_zone=$(cat nix-host/metadata | jq -r '.docker_host_zone')
gcp_project=$(cat nix-host/metadata | jq -r '.docker_host_project')

gcloud_ssh() {
  gcloud compute ssh "${host_name}" \
    --zone="${host_zone}" \
    --project="${gcp_project}" \
    --ssh-key-file="${CI_ROOT}/login.ssh" \
    --tunnel-through-iap \
    --command "$@" 2> /dev/null
}

cat <<EOF > "${CI_ROOT}/gcloud-creds.json"
${GOOGLE_CREDENTIALS}
EOF
cat <<EOF > "${CI_ROOT}/login.ssh"
${SSH_PRIVATE_KEY}
EOF
chmod 600 "${CI_ROOT}/login.ssh"
cat <<EOF > "${CI_ROOT}/login.ssh.pub"
${SSH_PUB_KEY}
EOF
gcloud auth activate-service-account --key-file "${CI_ROOT}/gcloud-creds.json" 2> /dev/null

gcloud_ssh "docker ps -qa | xargs docker rm -fv || true;"

login_user="sa_$(cat "${CI_ROOT}/gcloud-creds.json" | jq -r '.client_id')"

gcloud compute start-iap-tunnel "${host_name}" --zone="${host_zone}" --project="${gcp_project}" 22 --local-host-port=localhost:2222 &
tunnel_pid="$!"

# Retry loop with a 1-second sleep to wait for the rsync command to succeed
rsync_ready=false
for i in {1..30}; do
  rsync -avr --delete --exclude="target/**" --exclude="**/node_modules/**" \
    -e "ssh -o StrictHostKeyChecking=no -i ${CI_ROOT}/login.ssh -p 2222" \
    "${REPO_PATH}/" \
    "${login_user}@localhost:${REPO_PATH}" && {
    rsync_ready=true
    break
  } || {
    echo "rsync command failed, retrying in 1 second (attempt $i/30)..."
    sleep 1
  }
done

if [ "$rsync_ready" = false ]; then
  echo "rsync command failed after 30 attempts. Exiting."
  exit 1
fi

kill "${tunnel_pid}"

gcloud_ssh "gcloud config set account galoy-staging-cluster@galoy-staging.iam.gserviceaccount.com"
gcloud_ssh "cd ${REPO_PATH}; cd ${PACKAGE_DIR}; export BQ_SERVICE_ACCOUNT_BASE64=eyAgInR5cGUiOiAic2VydmljZV9hY2NvdW50IiwgICJwcm9qZWN0X2lkIjogImFiY19hcHAiLCAgInByaXZhdGVfa2V5X2lkIjogImFiYyIsICAicHJpdmF0ZV9rZXkiOiAiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG5NSUlFdmdJQkFEQU5CZ2txaGtpRzl3MEJBUUVGQUFTQ0JLZ3dnZ1NrQWdFQUFvSUJBUURZM0U4bzFORUZjak1NXG5IVy81WmZGSncyOS84TkVxcFZpTmpRSXg5NVh4NUtEdEorblduOStPVzB1cXNTcUtsS0doQWRBbytRNmJqeDJjXG51WFZzWFR1N1hyWlVZNUtsdHZqOTREdlVhMXdqTlhzNjA2ci9SeFdUSjU4YmZkQytnTEx4QmZHbkI2Q3dLMFlRXG54bmZwak5ia1VmVlZ6TzBNUUQ3VVAwSGw1WmNZMFB1dnhkL3lIdU9OUW4vcklBaWVUSEgxcHFnVyt6ckgveTNjXG41OUlHVGhDOVBQdHVnSTllYThSU25WajNQV3oxYlgyVWtDRHB5OUlSaDlMekpMYVlZWDlSVWQ3KytkVUxVbGF0XG5BYVhCaDFVNmVtVUR6aHJJc2dBcGpEVnRpbU9QYm1RV21YMVM2MG1xUWlrUnBWWVo4dStOREQrTE53Ky9Fb3ZuXG54Q2oyWTN6MUFnTUJBQUVDZ2dFQVdEQnpvcU8xSXZWWGpCQTJscUlkMTBUNmhYbU4zajFpZnlIK2FBcUsrRlZsXG5HanlXakRqMHhXUWNKOXluYzdiUTZmU2VUZU5HelAwTTZrekRVMSt3NkZneVpxd2RtWFdJMlZtRWl6Ump3aysvXG4vdUxRVWNMN0k1NUR4bjdLVW9acy9yWlBtUUR4bUdMb3VlNjBHZzZ6M3lMelZjS2lEYzdjbmh6aGRCZ0RjOHZkXG5Rb3JOQWxxR1BSbm0zRXFLUTZWUXA2ZnlRbUNBeHJyNDVrc3BSWE5MZGRhdDNBTXN1cUltRGtxR0tCbUYzUTF5XG54V0dlODFMcGhVaVJxdnFieVVsaDZjZFNaOHBMQnBjOW0wYzNxV1BLczlwYXFCSXZnVVBsdk9aTXFlYzZ4NFM2XG5DaGJka2tUUkxuYnNScjBZZy9uRGVFUGxraFJCaGFzWHB4cE1VQmdQeXdLQmdRRHMyYXhOa0ZqYlU5NHVYdmQ1XG56blVoRFZ4UEZCdXh5VUh0c0pOcVc0cC91akxOaW1HZXQ1RS9ZdGhDblFlQzJQM1ltN2MzZml6NjhhbU02aGlBXG5Pblc3SFlQWitqS0ZuZWZwQXRqeU9PczQ2QWtmdEVnMDdUOVhqd1dOUHQ4KzhsMERZYXdQb0pnYk01aUUwTDJPXG54OFRVMVZzNG1YYytxbDlGOTBHekkweDNWd0tCZ1FEcVpPT3FXdzNoVG5OVDA3SXhxbm1kM2R1Z1Y5UzdlVzZvXG5VOU9vVWdKQjRyWVRwRyt5RnFOcWJSVDhia3gzN2lLQk1FUmVwcHFvbk9xR200d3R1UlI2TFNMbGdjSVU5SXd4XG55ZkgxMlVXcVZtRlNIc2daRnFNL2NLM3dHZXYzOGgxV0JJT3gzL2RqS243QmRsS1ZoOGtXeXg2dUM4Ym1WK0U2XG5Pb0swdkpENmt3S0JnSEF5U09uUk9CWmxxemtpS1c4Yyt1VTJWQVR0ekpTeWRyV20wSjR3VVBKaWZOQmEvaFZXXG5kY3FtQXpYQzl4em50NUFWYTN3eEhCT2Z5S2FFK2lnOENTc2pOeU5aM3ZibXIwWDA0Rm9WMW05MWsyVGVYTm9kXG5qTVRvYmtQVGhhTm00ZUxKTU4yU1FKdWFIR1RHRVJXQzBsM1QxOHQrL3pyRE1EQ1BpU0xYMU5BdkFvR0JBTjFUXG5WTEpZZGp2SU14ZjFibTU5VlljZXBiSzdITEhGa1JxNnhNSk1aYnRHMHJ5cmFaalV6WXZCNHE0VmpIazJVRGlDXG5saHgxM3RYV0RaSDdNSnRBQnpqeWcrQUk3WFdTRVFzMmNCWEFDb3MwTTRNeWM2bFUrZUwraUErT3VvVU9obXJoXG5xbVQ4WVlHdTc2L0lCV1VTcVd1dmNwSFBwd2w3ODcxaTRHYS9JM3FuQW9HQkFOTmtLQWNNb2VBYkpRSzdhL1JuXG53UEVKQitkUGdORElhYm9Bc2gxblpoVmhONWN2ZHZDV3VFWWdPR0NQUUxZUUYwem1UTGNNK3NWeE9ZZ2Z5OG1WXG5mYk5nUGdzUDV4bXU2ZHcyQ09CS2R0b3p3MEhyV1NSakFDZDFONHlHdTc1K3dQQ2NYL2dRYXJjalJjWFhaZUVhXG5OdEJMU2ZjcVBVTHFEK2g3YnI5bEVKaW9cbi0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS1cbiIsICAiY2xpZW50X2VtYWlsIjogIjEyMy1hYmNAZGV2ZWxvcGVyLmdzZXJ2aWNlYWNjb3VudC5jb20iLCAgImNsaWVudF9pZCI6ICIxMjMtYWJjLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwgICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsICAidG9rZW5fdXJpIjogImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MS90b2tlbiJ9; nix develop -c ${CMD} 2>&1"

