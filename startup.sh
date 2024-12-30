#!/bin/bash
set -euo pipefail

PROJECT_ROOT=$(pwd)
LOG_DIR="$PROJECT_ROOT/log"
MAIN_LOG_FILE="$LOG_DIR/startup.log"
INSTALL_LOG_FILE="$LOG_DIR/install.log"
MIGRATION_LOG_FILE="$LOG_DIR/migration.log"
FRONTEND_LOG_FILE="$LOG_DIR/frontend.log"
BACKEND_LOG_FILE="$LOG_DIR/backend.log"
HEALTH_CHECK_LOG="$LOG_DIR/health_check.log"
FRONTEND_PID_FILE="$LOG_DIR/frontend.pid"
BACKEND_PID_FILE="$LOG_DIR/backend.pid"
PORT_CHECK_TIMEOUT=10
SERVICE_STARTUP_TIMEOUT=60
HEALTH_CHECK_INTERVAL=10

mkdir -p "$LOG_DIR"

log_info() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - INFO: $1" | tee -a "$MAIN_LOG_FILE"
}

log_error() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1" | tee -a "$MAIN_LOG_FILE" >&2
}

cleanup() {
  log_info "Cleaning up..."
  if [ -f "$FRONTEND_PID_FILE" ]; then
    kill "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null
    rm "$FRONTEND_PID_FILE"
  fi
  if [ -f "$BACKEND_PID_FILE" ]; then
    kill "$(cat "$BACKEND_PID_FILE")" 2>/dev/null
    rm "$BACKEND_PID_FILE"
  fi
  log_info "Cleanup complete."
}

check_dependencies() {
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed."
    exit 1
  fi
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed."
    exit 1
  fi
  if ! command -v curl &> /dev/null; then
    log_error "curl is not installed."
    exit 1
  fi
  log_info "Dependencies check passed."
}

check_port() {
  local port="$1"
  local timeout="$2"
  local start_time=$(date +%s)
  while true; do
    if nc -z localhost "$port" 2>/dev/null; then
      return 0
    fi
    local elapsed_time=$(( $(date +%s) - start_time ))
    if [ "$elapsed_time" -gt "$timeout" ]; then
      return 1
    fi
    sleep 1
  done
}

store_pid() {
    local pid="$1"
    local pid_file="$2"
    echo "$pid" > "$pid_file"
    if [ ! -s "$pid_file" ]; then
      log_error "Failed to write PID to $pid_file"
      exit 1
    fi
    log_info "PID $pid stored in $pid_file"
}

wait_for_service() {
  local port="$1"
  local timeout="$2"
  log_info "Waiting for service on port $port..."
  if check_port "$port" "$timeout"; then
      log_info "Service on port $port is ready."
      return 0
  else
      log_error "Service on port $port failed to start within the timeout."
      return 1
  fi
}


verify_service() {
  local url="$1"
  local timeout="$2"
  log_info "Verifying service at $url..."
  if curl -s -m "$timeout" "$url" > /dev/null; then
     log_info "Service at $url is healthy."
     echo "$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: Service at $url is healthy." | tee -a "$HEALTH_CHECK_LOG"
     return 0
  else
      log_error "Service at $url is unreachable."
      echo "$(date '+%Y-%m-%d %H:%M:%S') - FAILURE: Service at $url is unreachable." | tee -a "$HEALTH_CHECK_LOG"
      return 1
  fi
}

start_backend() {
  log_info "Starting backend server..."
  if [ -f "$BACKEND_PID_FILE" ]; then
      if kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
         log_error "Backend server is already running. PID: $(cat "$BACKEND_PID_FILE")"
         return 1
      fi
       log_info "Stale backend PID file found. Overwriting it."
    fi
    nohup npm run server > "$BACKEND_LOG_FILE" 2>&1 &
  BACKEND_PID=$!
  store_pid "$BACKEND_PID" "$BACKEND_PID_FILE"
  wait_for_service 3000 "$SERVICE_STARTUP_TIMEOUT"
   if [ $? -ne 0 ]; then
      log_error "Failed to start the backend server."
      return 1
   fi
    log_info "Backend server started successfully."
}

start_frontend() {
 log_info "Starting frontend server..."
  if [ -f "$FRONTEND_PID_FILE" ]; then
      if kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
         log_error "Frontend server is already running. PID: $(cat "$FRONTEND_PID_FILE")"
         return 1
      fi
       log_info "Stale frontend PID file found. Overwriting it."
  fi
    nohup npm run client > "$FRONTEND_LOG_FILE" 2>&1 &
    FRONTEND_PID=$!
  store_pid "$FRONTEND_PID" "$FRONTEND_PID_FILE"
  wait_for_service 5173 "$SERVICE_STARTUP_TIMEOUT"
  if [ $? -ne 0 ]; then
    log_error "Failed to start the frontend server."
    return 1
  fi
    log_info "Frontend server started successfully."
}

trap cleanup EXIT ERR INT TERM

check_dependencies

if [ -f ".env" ]; then
  log_info "Sourcing .env file..."
  source .env
else
  log_error ".env file not found."
  exit 1
fi


if [ -z "$PORT" ] || [ -z "$MONGODB_URI" ] || [ -z "$JWT_SECRET" ] || [ -z "$NODE_ENV" ]; then
    log_error "Required environment variables are not set (PORT, MONGODB_URI, JWT_SECRET, NODE_ENV)."
    exit 1
fi
log_info "Environment variables loaded."

log_info "Installing dependencies..."
npm install > "$INSTALL_LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  log_error "npm install failed."
  exit 1
fi
log_info "Dependencies installed successfully."

start_backend
if [ $? -ne 0 ]; then
  log_error "Backend server startup failed."
  cleanup
  exit 1
fi
start_frontend
if [ $? -ne 0 ]; then
    log_error "Frontend server startup failed."
    cleanup
    exit 1
fi

sleep 5
verify_service "http://localhost:3000/api/auth/verify" "$HEALTH_CHECK_INTERVAL"
if [ $? -ne 0 ]; then
  log_error "Backend service health check failed."
  cleanup
  exit 1
fi

verify_service "http://localhost:5173/" "$HEALTH_CHECK_INTERVAL"
if [ $? -ne 0 ]; then
  log_error "Frontend service health check failed."
  cleanup
  exit 1
fi


log_info "Application started successfully."