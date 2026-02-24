.PHONY: help install init dev dev-front dev-back build start lint seed dashboard

# Colors
CYAN  := \033[36m
RESET := \033[0m

help: ## Show available commands
	@printf "$(CYAN)sp_zoo-codaro$(RESET)\n\n"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(CYAN)%-12s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

install: ## Install / update npm dependencies
	npm install

init: install ## First-time setup: deps + Convex project + auth config + dashboard
	npm run predev

dev: ## Run frontend + backend in parallel (daily use)
	npm run dev

dev-front: ## Next.js dev server only (port 3000)
	npm run dev:frontend

dev-back: ## Convex backend dev server only
	npm run dev:backend

build: ## Production build (Next.js)
	npm run build

start: ## Start production server
	npm run start

lint: ## Run ESLint
	npm run lint

seed: ## Seed database with demo data
	npx convex run seed:seedData

dashboard: ## Open Convex dashboard in browser
	npx convex dashboard
