#!/usr/bin/env bash

# ============================================================================
# MAULA.AI Production Deployment Script v2.0
# ============================================================================
# USAGE:
#   ./deploy-production.sh                    # Show help menu
#   ./deploy-production.sh maula-frontend     # Deploy maula.ai marketing site
#   ./deploy-production.sh tool <tool-name>   # Deploy specific tool frontend
#   ./deploy-production.sh all                # Deploy everything
#   ./deploy-production.sh list               # List all deployable targets
#
# IMPORTANT: Always use this script for deployments. Never deploy manually!
# ============================================================================

set -e # Exit on any error

# Get project root directory FIRST (before loading config)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Load configuration
if [ -f "$PROJECT_ROOT/deploy-config.sh" ]; then
	source "$PROJECT_ROOT/deploy-config.sh"
else
	echo "Error: deploy-config.sh not found. Please create it with your deployment settings."
	exit 1
fi

# ============================================================================
# DEPLOYMENT PATHS - SINGLE SOURCE OF TRUTH
# ============================================================================
# These functions return paths for each target. Never hardcode paths elsewhere!

get_server_path() {
	local target=$1
	case "$target" in
	maula-frontend) echo "/var/www/maula.ai/live" ;;
	neural-link) echo "/var/www/neural-link" ;;
	phishguard) echo "/var/www/tools/phishguard" ;;
	darkwebmonitor) echo "/var/www/tools/darkwebmonitor" ;;
	zerodaydetect) echo "/var/www/tools/zerodaydetect" ;;
	ransomshield) echo "/var/www/tools/ransomshield" ;;
	phishnetai) echo "/var/www/tools/phishnetai" ;;
	vulnscan) echo "/var/www/tools/vulnscan" ;;
	pentestai) echo "/var/www/tools/pentestai" ;;
	codesentinel) echo "/var/www/tools/codesentinel" ;;
	firewallai) echo "/var/www/tools/firewallai" ;;
	threatradar) echo "/var/www/tools/threatradar" ;;
	intrusiondetect) echo "/var/www/tools/intrusiondetect" ;;
	fraudguard) echo "/var/www/tools/fraudguard" ;;
	secureauth) echo "/var/www/tools/secureauth" ;;
	datafortress) echo "/var/www/tools/datafortress" ;;
	apishield) echo "/var/www/tools/apishield" ;;
	logsentry) echo "/var/www/tools/logsentry" ;;
	accesscontrol) echo "/var/www/tools/accesscontrol" ;;
	encryptionmanager) echo "/var/www/tools/encryptionmanager" ;;
	cryptovault) echo "/var/www/tools/cryptovault" ;;
	networkmonitor) echo "/var/www/tools/networkmonitor" ;;
	audittrail) echo "/var/www/tools/audittrail" ;;
	threatmodel) echo "/var/www/tools/threatmodel" ;;
	riskassess) echo "/var/www/tools/riskassess" ;;
	securityscore) echo "/var/www/tools/securityscore" ;;
	xdrplatform) echo "/var/www/tools/xdrplatform" ;;
	*) echo "" ;;
	esac
}

get_local_path() {
	local target=$1
	case "$target" in
	maula-frontend) echo "$PROJECT_ROOT/frontend/maula-frontend/dist" ;;
	neural-link) echo "$PROJECT_ROOT/frontend/neural-link-interface/dist" ;;
	phishguard) echo "$PROJECT_ROOT/frontend/tools/01-phishguard/dist" ;;
	darkwebmonitor) echo "$PROJECT_ROOT/frontend/tools/02-darkwebmonitor/dist" ;;
	zerodaydetect) echo "$PROJECT_ROOT/frontend/tools/03-zerodaydetect/dist" ;;
	ransomshield) echo "$PROJECT_ROOT/frontend/tools/04-ransomshield/dist" ;;
	phishnetai) echo "$PROJECT_ROOT/frontend/tools/05-phishnetai/dist" ;;
	vulnscan) echo "$PROJECT_ROOT/frontend/tools/06-vulnscan/dist" ;;
	pentestai) echo "$PROJECT_ROOT/frontend/tools/07-pentestai/dist" ;;
	codesentinel) echo "$PROJECT_ROOT/frontend/tools/08-codesentinel/dist" ;;
	firewallai) echo "$PROJECT_ROOT/frontend/tools/05-firewallai/dist" ;;
	threatradar) echo "$PROJECT_ROOT/frontend/tools/06-threatradar/dist" ;;
	intrusiondetect) echo "$PROJECT_ROOT/frontend/tools/07-intrusiondetect/dist" ;;
	fraudguard) echo "$PROJECT_ROOT/frontend/tools/08-fraudguard/dist" ;;
	secureauth) echo "$PROJECT_ROOT/frontend/tools/09-secureauth/dist" ;;
	datafortress) echo "$PROJECT_ROOT/frontend/tools/10-datafortress/dist" ;;
	apishield) echo "$PROJECT_ROOT/frontend/tools/22-apishield/dist" ;;
	logsentry) echo "$PROJECT_ROOT/frontend/tools/11-logsentry/dist" ;;
	accesscontrol) echo "$PROJECT_ROOT/frontend/tools/13-accesscontrol/dist" ;;
	encryptionmanager) echo "$PROJECT_ROOT/frontend/tools/14-encryptionmanager/dist" ;;
	cryptovault) echo "$PROJECT_ROOT/frontend/tools/15-cryptovault/dist" ;;
	networkmonitor) echo "$PROJECT_ROOT/frontend/tools/16-networkmonitor/dist" ;;
	audittrail) echo "$PROJECT_ROOT/frontend/tools/17-audittrail/dist" ;;
	threatmodel) echo "$PROJECT_ROOT/frontend/tools/18-threatmodel/dist" ;;
	riskassess) echo "$PROJECT_ROOT/frontend/tools/19-riskassess/dist" ;;
	securityscore) echo "$PROJECT_ROOT/frontend/tools/20-securityscore/dist" ;;
	xdrplatform) echo "$PROJECT_ROOT/frontend/tools/12-xdrplatform/dist" ;;
	*) echo "" ;;
	esac
}

get_build_dir() {
	local target=$1
	case "$target" in
	maula-frontend) echo "$PROJECT_ROOT/frontend/maula-frontend" ;;
	neural-link) echo "$PROJECT_ROOT/frontend/neural-link-interface" ;;
	phishguard) echo "$PROJECT_ROOT/frontend/tools/01-phishguard" ;;
	darkwebmonitor) echo "$PROJECT_ROOT/frontend/tools/02-darkwebmonitor" ;;
	zerodaydetect) echo "$PROJECT_ROOT/frontend/tools/03-zerodaydetect" ;;
	ransomshield) echo "$PROJECT_ROOT/frontend/tools/04-ransomshield" ;;
	phishnetai) echo "$PROJECT_ROOT/frontend/tools/05-phishnetai" ;;
	vulnscan) echo "$PROJECT_ROOT/frontend/tools/06-vulnscan" ;;
	pentestai) echo "$PROJECT_ROOT/frontend/tools/07-pentestai" ;;
	codesentinel) echo "$PROJECT_ROOT/frontend/tools/08-codesentinel" ;;
	firewallai) echo "$PROJECT_ROOT/frontend/tools/05-firewallai" ;;
	threatradar) echo "$PROJECT_ROOT/frontend/tools/06-threatradar" ;;
	intrusiondetect) echo "$PROJECT_ROOT/frontend/tools/07-intrusiondetect" ;;
	fraudguard) echo "$PROJECT_ROOT/frontend/tools/08-fraudguard" ;;
	secureauth) echo "$PROJECT_ROOT/frontend/tools/09-secureauth" ;;
	datafortress) echo "$PROJECT_ROOT/frontend/tools/10-datafortress" ;;
	apishield) echo "$PROJECT_ROOT/frontend/tools/22-apishield" ;;
	logsentry) echo "$PROJECT_ROOT/frontend/tools/11-logsentry" ;;
	accesscontrol) echo "$PROJECT_ROOT/frontend/tools/13-accesscontrol" ;;
	encryptionmanager) echo "$PROJECT_ROOT/frontend/tools/14-encryptionmanager" ;;
	cryptovault) echo "$PROJECT_ROOT/frontend/tools/15-cryptovault" ;;
	networkmonitor) echo "$PROJECT_ROOT/frontend/tools/16-networkmonitor" ;;
	audittrail) echo "$PROJECT_ROOT/frontend/tools/17-audittrail" ;;
	threatmodel) echo "$PROJECT_ROOT/frontend/tools/18-threatmodel" ;;
	riskassess) echo "$PROJECT_ROOT/frontend/tools/19-riskassess" ;;
	securityscore) echo "$PROJECT_ROOT/frontend/tools/20-securityscore" ;;
	xdrplatform) echo "$PROJECT_ROOT/frontend/tools/12-xdrplatform" ;;
	*) echo "" ;;
	esac
}

# All available targets
ALL_TARGETS="maula-frontend neural-link phishguard darkwebmonitor zerodaydetect ransomshield phishnetai vulnscan pentestai codesentinel firewallai threatradar intrusiondetect fraudguard secureauth datafortress apishield logsentry accesscontrol encryptionmanager cryptovault networkmonitor audittrail threatmodel riskassess securityscore xdrplatform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
	echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
	echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
	echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
	echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
	echo ""
	echo -e "${MAGENTA}============================================================================${NC}"
	echo -e "${MAGENTA}  $1${NC}"
	echo -e "${MAGENTA}============================================================================${NC}"
}

# Function to check if command exists
command_exists() {
	command -v "$1" >/dev/null 2>&1
}

# Function to get current timestamp
get_timestamp() {
	date +"%Y%m%d_%H%M%S"
}

# ============================================================================
# HELP / USAGE
# ============================================================================
show_help() {
	echo ""
	echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
	echo -e "${CYAN}║              MAULA.AI PRODUCTION DEPLOYMENT SCRIPT v2.0                  ║${NC}"
	echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
	echo ""
	echo -e "${YELLOW}USAGE:${NC}"
	echo "  ./deploy-production.sh <command> [options]"
	echo ""
	echo -e "${YELLOW}COMMANDS:${NC}"
	echo -e "  ${GREEN}maula-frontend${NC}        Deploy maula.ai marketing site"
	echo -e "  ${GREEN}neural-link${NC}           Deploy Neural Link Interface"
	echo -e "  ${GREEN}tool <name>${NC}           Deploy specific tool (e.g., phishguard, ransomshield)"
	echo -e "  ${GREEN}all${NC}                   Deploy everything"
	echo -e "  ${GREEN}list${NC}                  List all deployable targets with paths"
	echo -e "  ${GREEN}status${NC}                Check deployment status on server"
	echo -e "  ${GREEN}help${NC}                  Show this help message"
	echo ""
	echo -e "${YELLOW}OPTIONS:${NC}"
	echo -e "  ${GREEN}--no-build${NC}            Skip npm build, deploy existing dist/"
	echo -e "  ${GREEN}--build-only${NC}          Build only, don't deploy"
	echo ""
	echo -e "${YELLOW}EXAMPLES:${NC}"
	echo "  ./deploy-production.sh maula-frontend           # Build & deploy maula.ai"
	echo "  ./deploy-production.sh maula-frontend --no-build  # Deploy existing build"
	echo "  ./deploy-production.sh tool phishguard          # Deploy PhishGuard tool"
	echo "  ./deploy-production.sh list                     # Show all targets & paths"
	echo ""
	echo -e "${YELLOW}SERVER:${NC}"
	echo "  Host: $EC2_HOST"
	echo "  Key:  $EC2_KEY"
	echo ""
	echo -e "${RED}⚠️  IMPORTANT: Always use this script for deployments!${NC}"
	echo -e "${RED}   Never deploy manually to avoid path mistakes.${NC}"
	echo ""
}

# ============================================================================
# LIST ALL TARGETS
# ============================================================================
list_targets() {
	log_header "DEPLOYABLE TARGETS"
	echo ""
	echo -e "${CYAN}Target Name          | Server Path                        | Local Source${NC}"
	echo "─────────────────────────────────────────────────────────────────────────────────"

	for target in $ALL_TARGETS; do
		local server_path=$(get_server_path "$target")
		local local_path=$(get_local_path "$target")
		local exists=""

		if [ -d "$local_path" ]; then
			exists="${GREEN}✓${NC}"
		else
			exists="${RED}✗${NC}"
		fi

		printf "%-20s | %-34s | %b %s\n" "$target" "$server_path" "$exists" "${local_path/$PROJECT_ROOT/\$PROJECT_ROOT}"
	done

	echo ""
	echo -e "${GREEN}✓${NC} = dist/ exists, ${RED}✗${NC} = needs build"
	echo ""
}

# ============================================================================
# CHECK STATUS ON SERVER
# ============================================================================
check_status() {
	log_header "SERVER DEPLOYMENT STATUS"

	ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        echo ''
        echo 'Directory                          | Status     | Files'
        echo '───────────────────────────────────────────────────────────'
        
        for dir in /var/www/maula.ai/live /var/www/neural-link /var/www/tools/*; do
            if [ -d \"\$dir\" ]; then
                count=\$(find \"\$dir\" -type f 2>/dev/null | wc -l)
                has_index=''
                if [ -f \"\$dir/index.html\" ]; then
                    has_index='✓ index.html'
                else
                    has_index='✗ no index'
                fi
                printf '%-34s | %-10s | %s files\n' \"\$dir\" \"\$has_index\" \"\$count\"
            fi
        done
        echo ''
    "
}

# Function to deploy Cloudflare SSL certificates
deploy_cloudflare_ssl() {
	log_info "Deploying Cloudflare SSL certificates to EC2..."

	local SSL_LOCAL_DIR="$PROJECT_ROOT/backend/ssl/cloudflare"
	local SSL_REMOTE_DIR="/etc/ssl/cloudflare"

	# Check if local certificate files exist
	if [ ! -f "$SSL_LOCAL_DIR/origin-cert.pem" ] || [ ! -f "$SSL_LOCAL_DIR/origin-key.pem" ]; then
		log_warning "Cloudflare SSL certificates not found in $SSL_LOCAL_DIR - skipping SSL deployment"
		return 0
	fi

	# Create remote directory and deploy certificates
	ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        sudo mkdir -p $SSL_REMOTE_DIR
        sudo chown root:root $SSL_REMOTE_DIR
        sudo chmod 755 $SSL_REMOTE_DIR
    "

	# Copy certificate files
	scp -i "$EC2_KEY" -o StrictHostKeyChecking=no "$SSL_LOCAL_DIR/origin-cert.pem" "$EC2_HOST:/tmp/"
	scp -i "$EC2_KEY" -o StrictHostKeyChecking=no "$SSL_LOCAL_DIR/origin-key.pem" "$EC2_HOST:/tmp/"

	# Move to proper location with correct permissions
	ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        sudo mv /tmp/origin-cert.pem $SSL_REMOTE_DIR/
        sudo mv /tmp/origin-key.pem $SSL_REMOTE_DIR/
        sudo chown root:root $SSL_REMOTE_DIR/origin-cert.pem $SSL_REMOTE_DIR/origin-key.pem
        sudo chmod 644 $SSL_REMOTE_DIR/origin-cert.pem
        sudo chmod 600 $SSL_REMOTE_DIR/origin-key.pem
    "

	log_success "Cloudflare SSL certificates deployed to $SSL_REMOTE_DIR"
}

# ============================================================================
# CORE BUILD FUNCTION
# ============================================================================
build_target() {
	local target=$1
	local build_dir=$(get_build_dir "$target")

	if [ -z "$build_dir" ]; then
		log_error "Unknown target: $target"
		return 1
	fi

	if [ ! -d "$build_dir" ]; then
		log_error "Build directory not found: $build_dir"
		return 1
	fi

	log_info "Building $target..."
	log_info "Directory: $build_dir"

	cd "$build_dir"

	# Install dependencies if needed
	if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
		log_info "Installing dependencies..."
		npm install
	fi

	# Run build
	log_info "Running npm build..."
	npm run build

	cd "$PROJECT_ROOT"

	# Verify build output
	local dist_dir=$(get_local_path "$target")
	if [ -d "$dist_dir" ] && [ -f "$dist_dir/index.html" ]; then
		log_success "Build completed: $dist_dir"
		return 0
	else
		log_error "Build failed - no dist/index.html found"
		return 1
	fi
}

# ============================================================================
# CORE DEPLOY FUNCTION
# ============================================================================
deploy_target() {
	local target=$1
	local local_path=$(get_local_path "$target")
	local server_path=$(get_server_path "$target")

	if [ -z "$server_path" ]; then
		log_error "Unknown target: $target"
		return 1
	fi

	if [ ! -d "$local_path" ]; then
		log_error "Local dist not found: $local_path"
		log_error "Run with build first or check the path"
		return 1
	fi

	log_header "DEPLOYING: $target"
	echo ""
	echo -e "${CYAN}Source:${NC}      $local_path"
	echo -e "${CYAN}Destination:${NC} $EC2_HOST:$server_path"
	echo ""

	# Create directory on server
	log_info "Creating server directory..."
	ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        sudo mkdir -p $server_path
        sudo chown -R ubuntu:ubuntu $server_path
    "

	# Clean old files (except keep for rollback reference)
	log_info "Cleaning old files..."
	ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        # Remove old JS bundles but keep current for 1 deployment
        find $server_path/assets -name '*.js' -mmin +5 -delete 2>/dev/null || true
        find $server_path/assets -name '*.css' -mmin +5 -delete 2>/dev/null || true
    "

	# Deploy new files
	log_info "Uploading files..."
	scp -i "$EC2_KEY" -o StrictHostKeyChecking=no -r "$local_path"/* "$EC2_HOST:$server_path/"

	# Set permissions
	ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        sudo chown -R ubuntu:ubuntu $server_path
        sudo chmod -R 755 $server_path
    "

	# Verify deployment
	log_info "Verifying deployment..."
	local verification=$(ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
        if [ -f '$server_path/index.html' ]; then
            echo 'OK'
            ls -la $server_path/assets/*.js 2>/dev/null | head -3
        else
            echo 'FAIL'
        fi
    ")

	if [[ $verification == *"OK"* ]]; then
		log_success "Deployment verified!"
		echo "$verification" | tail -n +2
	else
		log_error "Deployment verification failed!"
		return 1
	fi

	echo ""
	log_success "✅ $target deployed to $server_path"
	echo ""
}

# ============================================================================
# BUILD AND DEPLOY COMBINED
# ============================================================================
build_and_deploy() {
	local target=$1
	local skip_build=$2
	local build_only=$3

	if [ "$skip_build" != "true" ]; then
		if ! build_target "$target"; then
			log_error "Build failed for $target"
			return 1
		fi
	fi

	if [ "$build_only" != "true" ]; then
		if ! deploy_target "$target"; then
			log_error "Deploy failed for $target"
			return 1
		fi
	fi

	return 0
}

# Function to test deployment
test_deployment() {
	local subdomain=$1

	log_info "Testing deployment for $subdomain.maula.ai..."

	# Test HTTPS
	if curl -s -o /dev/null -w "%{http_code}" "https://$subdomain.maula.ai" | grep -q "200"; then
		log_success "HTTPS endpoint responding"
	else
		log_warning "HTTPS endpoint not responding"
	fi

	# Test API health
	if curl -s "https://$subdomain.maula.ai/api/health" >/dev/null; then
		log_success "API health endpoint responding"
	else
		log_warning "API health endpoint not responding"
	fi
}

# ============================================================================
# DEPLOY ALL TARGETS
# ============================================================================
deploy_all() {
	local skip_build=$1
	local build_only=$2

	log_header "DEPLOYING ALL TARGETS"

	local failed=0
	local success=0

	for target in $ALL_TARGETS; do
		if build_and_deploy "$target" "$skip_build" "$build_only"; then
			success=$((success + 1))
		else
			failed=$((failed + 1))
			log_warning "Failed to deploy: $target"
		fi
	done

	echo ""
	log_header "DEPLOYMENT SUMMARY"
	echo -e "${GREEN}Successful:${NC} $success"
	echo -e "${RED}Failed:${NC}     $failed"
	echo ""
}

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================
main() {
	local command=${1:-"help"}
	local skip_build=false
	local build_only=false

	# Parse options
	for arg in "$@"; do
		case $arg in
		--no-build)
			skip_build=true
			;;
		--build-only)
			build_only=true
			;;
		esac
	done

	# Check prerequisites
	if ! command_exists ssh; then
		log_error "SSH is not available"
		exit 1
	fi

	if ! command_exists scp; then
		log_error "SCP is not available"
		exit 1
	fi

	# Handle commands
	case "$command" in
	help | --help | -h | "")
		show_help
		;;
	list)
		list_targets
		;;
	status)
		check_status
		;;
	maula-frontend)
		build_and_deploy "maula-frontend" "$skip_build" "$build_only"
		;;
	neural-link)
		build_and_deploy "neural-link" "$skip_build" "$build_only"
		;;
	tool)
		local tool_name=$2
		if [ -z "$tool_name" ]; then
			log_error "Please specify a tool name"
			echo "Usage: ./deploy-production.sh tool <tool-name>"
			echo "Example: ./deploy-production.sh tool phishguard"
			echo ""
			echo "Available tools:"
			for t in $ALL_TARGETS; do
				if [[ $t != "maula-frontend" && $t != "neural-link" ]]; then
					echo "  - $t"
				fi
			done
			exit 1
		fi

		local server_path=$(get_server_path "$tool_name")
		if [ -z "$server_path" ]; then
			log_error "Unknown tool: $tool_name"
			echo "Run './deploy-production.sh list' to see available targets"
			exit 1
		fi

		build_and_deploy "$tool_name" "$skip_build" "$build_only"
		;;
	all)
		deploy_all "$skip_build" "$build_only"
		;;
	ssl)
		deploy_cloudflare_ssl
		;;
	*)
		# Check if it's a direct target name
		local server_path=$(get_server_path "$command")
		if [ -n "$server_path" ]; then
			build_and_deploy "$command" "$skip_build" "$build_only"
		else
			log_error "Unknown command: $command"
			echo "Run './deploy-production.sh help' for usage information"
			exit 1
		fi
		;;
	esac
}

# Run main function with all arguments
main "$@"
