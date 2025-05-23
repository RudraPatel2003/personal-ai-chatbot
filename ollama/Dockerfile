FROM ollama/ollama:0.7.0

EXPOSE 11434

WORKDIR /app

COPY ./setup-ollama.sh .

RUN chmod +x ./setup-ollama.sh

ENTRYPOINT ["./setup-ollama.sh"]