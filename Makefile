.SILENT:
.PHONY: check setup install dev api stop api_db apidb_stop generate studio migrate seed up caddy_start caddy_stop auth-docs api-docs help
.DEFAULT_GOAL := help

# ==============================================================================
# VARIABLES
# ==============================================================================
EXECUTABLES = pnpm docker caddy
DOCKERFILES = ./.devcontainer

# ==============================================================================
# LOGGING & ERROR HANDLING
# ==============================================================================
# Cross-platform color output using printf to ensure it works on macOS/Linux
define log
	printf "\033[0;34m[INFO]\033[0m %s\n" $1
endef

define success
	printf "\033[0;32m[SUCCESS]\033[0m %s\n" $1
endef

define err
	printf "\033[0;31m[ERROR]\033[0m %s\n" $1 >&2; exit 1
endef

# ==============================================================================
# HELP
# ==============================================================================
help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[0-9a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

# ==============================================================================
# ENVIRONMENT & SETUP
# ==============================================================================
check: ## Check if all required executables are installed
	$(call log,"Checking dependencies...")
	@for exe in $(EXECUTABLES); do \
		command -v $$exe > /dev/null 2>&1 || { $(call err,"'$$exe' is not installed. Please install it and try again."); }; \
	done
	@docker compose version >/dev/null 2>&1 || { $(call err,"'docker compose' plugin not found. Please verify your Docker installation."); }
	$(call success,"All basic dependencies are installed!")

install: check ## Install all project dependencies via pnpm
	$(call log,"Installing dependencies...")
	@pnpm install || { $(call err,"Failed to install dependencies."); }
	$(call success,"Dependencies installed successfully.")

setup: install api_db caddy_start ## Run comprehensive setup (installs deps, starts db & proxy)
	$(call success,"Setup complete! You can now run 'make dev' or 'make api'.")

# ==============================================================================
# DEVELOPMENT
# ==============================================================================
dev: setup ## Run all applications in development mode using Turbo
	$(call log,"Starting all applications in development mode...")
	@pnpm turbo run dev

api: setup ## Run only the API application in development mode
	$(call log,"Starting API dynamically...")
	@pnpm turbo run dev --filter=@hris-v2/api

stop: apidb_stop caddy_stop ## Stop all running services (Docker, Caddy)
	$(call success,"All services stopped.")

# ==============================================================================
# DOCKER SERVICES
# ==============================================================================
api_db: ## Start the API database container
	$(call log,"Starting API database...")
	@docker compose -f $(DOCKERFILES)/docker-compose.yml up -d --wait || { $(call err,"Failed to start the API database. Make sure Docker is running."); }
	$(call success,"Database is running.")

apidb_stop: ## Stop the API database container
	$(call log,"Stopping API database...")
	@docker compose -f $(DOCKERFILES)/docker-compose.yml down --remove-orphans || true

# ==============================================================================
# DRIZZLE ORM (Filtered for API)
# ==============================================================================
generate: ## Generate a new database migration file
	$(call log,"Generating migration file...")
	@pnpm --filter=@hris-v2/api generate

studio: ## Run Drizzle Kit Studio
	$(call log,"Starting Drizzle Kit Studio...")
	@pnpm --filter=@hris-v2/api studio & sleep 2 && npx open-cli https://local.drizzle.studio

migrate: generate ## Run database migrations
	$(call log,"Running database migrations...")
	@pnpm --filter=@hris-v2/api migrate

seed: ## Seed the database with initial data
	$(call log,"Seeding database...")
	@pnpm --filter=@hris-v2/api seed

up: ## Run drizzle-kit up
	$(call log,"Running drizzle-kit up...")
	@pnpm --filter=@hris-v2/api kit:up

# ==============================================================================
# CADDY SERVER
# ==============================================================================
caddy_start: ## Start the Caddy server
	$(call log,"Starting Caddy server...")
	@caddy start 2>/dev/null || $(call log,"Caddy might already be running.")

caddy_stop: ## Stop the Caddy server
	$(call log,"Stopping Caddy server...")
	@caddy stop > /dev/null 2>&1 || true

# ==============================================================================
# DOCUMENTATION
# ==============================================================================
auth-docs: ## Open BetterAuth documentation
	$(call log,"Opening BetterAuth documentation...")
	@pnpm --filter=@hris-v2/api auth-docs

api-docs: ## Open API documentation
	$(call log,"Opening API documentation...")
	@npx open-cli https://api.hris.localhost/docs
