FROM ollama/ollama:0.7.0

EXPOSE 11434

WORKDIR /app

RUN apt-get -y update; apt-get -y install curl

COPY ./setup-ollama.sh .

RUN chmod +x ./setup-ollama.sh

ENTRYPOINT ["./setup-ollama.sh"]