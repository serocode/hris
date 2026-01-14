.SILENT:
.PHONY: check setup help down
.DEFAULT_GOAL:= help

EXECUTABLES = pnpm docker caddy
SERVER_DIR=./apps/api
DOCKERFILES=./.devcontainer
COLOR_GREEN=$(shell echo "\033[0;32m")
COLOR_RED=$(shell echo "\033[0;31m")
COLOR_END=$(shell echo "\033[0;0m")

define log
	echo "\033[0;32m$1\033[0m"
endef

define err
	echo "\033[0;31m$1\033[0m"
endef

## ---
## HELP - SHOWS A LIST OF AVAILABLE TARGETS WHICH CAN BE CALLED WITH MAKE.
## ---

help:
	@for makefile in $(MAKEFILE_LIST) ; do \
		grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $$makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' ; \
	done

check: ## Check if all requred executables are installed
	$(call log,"Checking dependencies...");
	@for exe in $(EXECUTABLES); do \
		which $$exe > /dev/null || { echo "$(COLOR_RED)Error: \"$$exe\" not found, please install \"$$exe\" and try again.$(COLOR_END)"; exit 1;} \
	done
	$(call log,"All dependencies are installed!");

setup: check api_db install ## Run all setup command

install: ## Install all dependencies
	$(call log,"Installing dependencies...")
	@pnpm install
	$(call log,"Done!")

dev: setup caddy_start ## Run pma in development mode
	$(call log,"Running pma in development mode...")
	@pnpm run dev

api: setup caddy_start
	@pnpm api dev

stop: apidb_stop caddy_stop ## Stop all running containers

apidb_stop: ## Stop API database
	$(call log,"Stopping all running containers...")
	@docker compose -f $(DOCKERFILES)/docker-compose.api.yml stop

api_db: ## Setup database for API
	$(call log,"Setting up databases for the API...")
	@docker compose -f $(DOCKERFILES)/docker-compose.api.yml up -d

## ---
## DRIZZLE COMMANDS
## ---

generate: ## Generates migration file - does not run the migration
	$(call log,"Generating migration file...")
	@pnpm --filter api generate

studio: ## Run Drizzle Kit Studio
	$(call log,"Running Drizzle Kit Studio...")
	@pnpm --filter api studio

migrate: generate ## Run migration
	$(call log,"Running migration...")
	@pnpm --filter api migrate

seed: ## Seed database with data
	$(call log,"Seeding database with data...")
	@pnpm --filter api seed

up: ## Run drizzle-kit up
	$(call log,"Running drizzle-kit up...")
	@pnpm --filter api kit:up

## ---
## CADDY COMMANDS
## ---

caddy_start: ## Start Caddy server
	$(call log,"Starting Caddy server...")
	@caddy start

caddy_stop: ## Stop Caddy server
	$(call log,"Stopping Caddy server...")
	@caddy stop || true

## ---
## BETTERAUTH COMMANDS
## ---

auth-docs: ## Open BetterAuth documentation
	$(call log,"Opening BetterAuth documentation...")
	@pnpm --filter api auth-docs