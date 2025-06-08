#!/bin/bash

echo "Starting Ollama server..."
ollama serve &
SERVE_PID=$!

echo "Waiting for Ollama server to be active..."
while ! ollama list | grep -q 'NAME'; do
  sleep 1
done

echo "Pulling Ollama models..."
ollama pull llama3.2:3b

echo "Warming up the model..."
curl -X POST http://ollama:11434/api/generate -H "Content-Type: application/json" -d '{"model": "llama3.2:3b", "prompt": "Hi"}'

echo "Ollama server is active!"

wait $SERVE_PID
