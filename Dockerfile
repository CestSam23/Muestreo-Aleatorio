# Etapa de construcción usando Node 16
FROM node:16-bookworm AS builder

# Instalar herramientas de compilación de C++
RUN apt-get update && apt-get install -y \
    build-essential \
    libginac-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Compilar la librería 
COPY muestreo.cpp .
RUN g++ -shared -fPIC -o libmuestreo.so muestreo.cpp \
    $(pkg-config --cflags --libs ginac)

# Etapa de producción
FROM node:16-bookworm

# Instalar dependencias de ejecución para la librería de C++
RUN apt-get update && apt-get install -y \
    libcln6 \
    libginac11 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar las dependencias de Node.js EXACTAS con 'npm ci'
RUN npm ci

# Copiar la librería ya compilada desde la primera etapa
COPY --from=builder /app/libmuestreo.so ./

# Copiar el resto de la aplicación
COPY server.js ./
COPY public/ ./public/

EXPOSE 8080

# Iniciar el servidor
CMD ["node", "server.js"]