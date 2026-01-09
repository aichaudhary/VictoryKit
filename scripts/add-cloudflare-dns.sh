#!/bin/bash
# Add all 50 rebranded subdomains to Cloudflare DNS
# Run this locally (requires curl and your Cloudflare API credentials)

# Load from .env or set manually
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-vEGQdzHmfv1dWmgUT5c5_VPXwCkDeHIcMbiMZq8c}"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-3f0cd573e167f428350c411fbcb21cbd}"
EC2_IP="18.140.156.40"

# All 50 rebranded subdomains
SUBDOMAINS=(
    "fraudguard"
    "darkwebmonitor"
    "zerodaydetect"
    "ransomshield"
    "phishnetai"
    "vulnscan"
    "pentestai"
    "codesentinel"
    "runtimeguard"
    "dataguardian"
    "incidentresponse"
    "xdrplatform"
    "identityforge"
    "secretvault"
    "privilegeguard"
    "networkforensics"
    "audittrailpro"
    "threatmodel"
    "riskquantify"
    "securitydashboard"
    "wafmanager"
    "apishield"
    "botmitigation"
    "ddosdefender"
    "sslmonitor"
    "blueteamai"
    "siemcommander"
    "soarengine"
    "behavioranalytics"
    "policyengine"
    "cloudposture"
    "zerotrust"
    "kubearmor"
    "containerscan"
    "emaildefender"
    "browserisolation"
    "dnsfirewall"
    "firewallai"
    "vpnanalyzer"
    "wirelesshunter"
    "dlpadvanced"
    "iotsentinel"
    "mobileshield"
    "supplychainai"
    "drplan"
    "privacyshield"
    "gdprcompliance"
    "hipaaguard"
    "soc2automator"
    "iso27001"
)

echo "🌐 Adding subdomains to Cloudflare DNS..."
echo "Zone ID: $CLOUDFLARE_ZONE_ID"
echo "Target IP: $EC2_IP"
echo ""

for subdomain in "${SUBDOMAINS[@]}"; do
    echo -n "Adding $subdomain.maula.ai... "
    
    # Check if record already exists
    existing=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?type=A&name=$subdomain.maula.ai" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    
    if [ "$existing" != "0" ] && [ -n "$existing" ]; then
        echo "already exists ✓"
        continue
    fi
    
    # Create new A record (proxied through Cloudflare)
    result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{
            "type": "A",
            "name": "'"$subdomain"'",
            "content": "'"$EC2_IP"'",
            "ttl": 1,
            "proxied": true
        }')
    
    if echo "$result" | grep -q '"success":true'; then
        echo "created ✓"
    else
        echo "FAILED ✗"
        echo "$result" | grep -o '"message":"[^"]*"' | head -1
    fi
done

echo ""
echo "✅ DNS configuration complete!"
echo ""
echo "Your new subdomains:"
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "  https://$subdomain.maula.ai"
done
