# base commands
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS base

WORKDIR /app

EXPOSE 5032

ENV ASPNETCORE_URLS=http://+:5032

COPY dotnet.csproj ./

RUN dotnet restore

COPY . .

# run in watch mode for development
FROM base AS development

CMD ["dotnet", "watch"]


# build for production
FROM base AS build

RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS production

COPY --from=build /app/publish .

RUN apt-get update && apt-get install -y curl

ENTRYPOINT ["dotnet", "dotnet.dll", "--urls", "http://+:5032"]
