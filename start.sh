#!/bin/bash

echo "🔮 Hermeneia — iniciando..."

cd "$(dirname "$0")"

# Backend
echo "▶ API (porta 8001)..."
source .venv/bin/activate
uvicorn api.main:app --port 8001 --reload &
API_PID=$!

# Frontend
echo "▶ Frontend (porta 5174)..."
cd frontend && npm run dev -- --port 5174 &
FRONTEND_PID=$!

echo ""
echo "✅ Rodando:"
echo "   API      → http://localhost:8001"
echo "   Frontend → http://localhost:5174"
echo ""
echo "Ctrl+C para parar tudo."

trap "kill $API_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Hermeneia encerrado.'" EXIT INT TERM
wait
