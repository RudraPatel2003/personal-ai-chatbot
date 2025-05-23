#!/bin/bash

echo "Starting Ollama server..."
ollama serve &
SERVE_PID=$!

echo "Waiting for Ollama server to be active..."
while ! ollama list | grep -q 'NAME'; do
  sleep 1
done

echo "Pulling Ollama models..."
ollama pull deepseek-r1:1.5b

echo "Ollama server is active!"

wait $SERVE_PID
