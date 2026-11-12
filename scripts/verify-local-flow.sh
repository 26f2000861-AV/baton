#!/bin/bash
# Verification v5 — golden path end + persistence across server restart.
set -u
cd "$(dirname "$0")/.."

SECRET=$(grep -E '^NEXTAUTH_SECRET=' .env | cut -d= -f2)
start_server() {
  NEXTAUTH_URL=http://localhost:3000 NEXTAUTH_SECRET="$SECRET" \
    setsid nohup npm run dev </dev/null >/dev/null 2>&1 &
  for i in $(seq 1 40); do
    curl -sf -o /dev/null --max-time 10 http://localhost:3000/ && return 0
    sleep 3
  done
  return 1
}

start_server || { echo "SERVER FAILED"; exit 1; }
echo "--- SERVER READY (1st boot) ---"

# browser still holds the JWT session cookie from v4's sign-in (stateless JWT
# survives server restarts; same pinned secret now)
agent-browser open http://localhost:3000/signin/role
agent-browser wait --load networkidle 2>/dev/null
echo "URL: $(agent-browser get url)"

agent-browser find role button click --name "Create my sample handover" || agent-browser find text "Create my sample handover" click
sleep 6
echo "URL AFTER CREATE: $(agent-browser get url)"
agent-browser wait --load networkidle 2>/dev/null
echo "=== WORKSPACE SNAPSHOT ==="
agent-browser snapshot -c -d 4 2>/dev/null | head -60

echo "--- restart server to prove DB persistence ---"
pkill -f "next dev" 2>/dev/null; sleep 3
start_server || { echo "SERVER FAILED ON RESTART"; exit 1; }
echo "--- SERVER READY (2nd boot) ---"
agent-browser open http://localhost:3000/workspace
agent-browser wait --load networkidle 2>/dev/null
echo "URL AFTER RESTART: $(agent-browser get url)"
echo "=== WORKSPACE AFTER RESTART (first lines) ==="
agent-browser snapshot -c -d 3 2>/dev/null | head -25

echo "--- LOG ERRORS ---"
grep -ac "JWT_SESSION_ERROR\|Error" dev.log || true
