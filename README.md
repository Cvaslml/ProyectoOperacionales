# 🐳 Proyecto Docker — Entornos Multi-Contenedor con Docker Compose

Este proyecto demuestra el uso de **Docker y Docker Compose** para construir, desplegar y administrar un entorno multi-contenedor reproducible. Se levantan **tres contenedores en un mismo equipo**, coordinados por un archivo `docker-compose.yml`, que juntos implementan un simulador de sistema de archivos accesible desde el navegador.

**Repositorio:** [github.com/alalo10/ProyectoOperacionales](https://github.com/alalo10/ProyectoOperacionales)

---

## Objetivos cumplidos

| Requisito del laboratorio | Implementación |
|---|---|
| Instalar y configurar Docker en Linux | Docker Engine en Ubuntu |
| Construir y ejecutar tres contenedores | `node-web`, `filesystem-cli`, `mongodb` |
| Desplegar una app web con Node.js | Express en el contenedor `node-web`, puerto 3000 |
| Verificar funcionamiento de cada contenedor | `docker compose ps` + health checks |
| Definir servicios en `docker-compose.yml` | Archivo único orquesta los 3 servicios |
| Levantar, detener y escalar servicios | `up`, `stop`, `down`, `--scale` |

---

## 🏗️ Arquitectura del sistema
```text
┌─────────────────────────────────────────────────────────────────┐
│                   Docker Compose Network                        │
│                                                                 │
│  ┌───────────────┐   ┌───────────────┐   ┌──────────────────┐   │
│  │ Contenedor 1  │   │ Contenedor 2  │   │  Contenedor 3    │   │
│  │  node-app     │──▶│filesystem-cli │   │    mongodb       │   │
│  │ Node.js+Expr  │   │  Python CLI   │   │  MongoDB 7       │   │
│  │  Puerto 3000  │   │  ls,mkdir...  │   │  Puerto 27017    │   │
│  │Dockerf propio │   │Dockerf propio │   │  Sin docerfyle   │   │
│  └──────┬────────┘   └──────┬────────┘   └────────┬─────────┘   │
│         │__________________│                      │             |
│                 │                                 │             | 
│   shared_data (volumen)            mongo_data  ◄──┘             |
└─────────────────────────────────────────────────────────────────┘

         ▲
    Usuario → http://localhost:3000
```

---

## Estructura del proyecto
```text
ProyectoOperacionales/
│
├── app/                    # Contenedor 1 — Node.js + Express
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
│
├── filesystem/             # Contenedor 2 — Python CLI
│   ├── Dockerfile
│   └── main.py
│
├── volumes/               
│   └── data/              # Sistema de archivos simulado (volumen compartido)
│
├── docker-compose.yml     # (Contenedor 3 — mongo-db) Orquestación de los 3 servicios
|                          # Variables de entorno fijas
├── .gitignore
└── README.md

```

---

## Requisitos previos

- Sistema operativo: **Linux** (Ubuntu 20.04+)
- Docker Engine instalado (`docker --version`)
- Docker Compose v2 (`docker compose version`)

---

## Despliegue paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/alalo10/ProyectoOperacionales.git
cd ProyectoOperacionales
```

### 2. Construir y levantar los tres contenedores

```bash
docker compose up --build -d
```

### 3. Verificar que los tres contenedores están activos

```bash
docker compose ps
```

Salida esperada:
NAME             IMAGE              STATUS          PORTS
node-web         app-node-web       Up (healthy)    0.0.0.0:3000->3000/tcp
filesystem-cli   app-filesystem     Up
mongodb          mongo:7            Up              27017/tcp
### 4. Acceder a la aplicación web

Abrir en el navegador: **http://localhost:3000**

---

## Administración del ciclo de vida con Docker Compose

```bash
# Levantar todos los servicios en segundo plano
docker compose up -d

# Ver estado de los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f node-web

# Detener los servicios (sin borrar contenedores)
docker compose stop

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores + volúmenes
docker compose down -v

# Escalar el servicio CLI a 3 instancias
docker compose up --scale filesystem-cli=3 -d

# Reiniciar un servicio específico
docker compose restart node-web

# Entrar a un contenedor en ejecución
docker exec -it node-web bash
docker exec -it filesystem-cli bash
```

---

## Gestión de variables de entorno

Archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=mongodb://mongodb:27017/filesystemdb
NODE_ENV=production
PORT=3000
```

Docker Compose los inyecta automáticamente en cada servicio que los declara con `env_file: .env`.

---

## Gestión de volúmenes

El proyecto define dos volúmenes nombrados en `docker-compose.yml`:

```yaml
volumes:
  shared_data:    # Compartido entre node-web y filesystem-cli
  mongo_data:     # Exclusivo de MongoDB — persiste la base de datos
```

Los datos **sobreviven** a reinicios y paradas de contenedores. Solo se eliminan con `docker compose down -v`.

---

## Descripción de los tres contenedores

### Contenedor 1 — `node-web`
- **Imagen base:** `node:18-alpine`
- **Dockerfile:** `app/Dockerfile`
- **Puerto:** `3000` (expuesto al host)
- **Función:** Servidor web Express que expone una API REST para operar sobre el sistema de archivos simulado. Se conecta a MongoDB para registrar operaciones.

### Contenedor 2 — `filesystem-cli`
- **Imagen base:** `python:3.11-slim`
- **Dockerfile:** `filesystem/Dockerfile`
- **Función:** Interfaz de línea de comandos que simula operaciones de un sistema de archivos real sobre el volumen compartido (`ls`, `mkdir`, `touch`, `rm`, `mv`, `read`).

### Contenedor 3 — `mongodb`
- **Imagen:** `mongo:7` (imagen oficial de Docker Hub, sin Dockerfile personalizado)
- **Puerto interno:** `27017`
- **Función:** Base de datos que persiste el registro de operaciones realizadas. No se expone al host por seguridad.

---

## Conceptos Docker demostrados

- **Imágenes personalizadas** construidas desde `Dockerfile` (contenedores 1 y 2)
- **Imagen oficial** de Docker Hub sin modificación (contenedor 3)
- **Red interna** `app-network` — los contenedores se comunican por nombre de servicio
- **Volúmenes nombrados** — persistencia de datos independiente del ciclo de vida del contenedor
- **Variables de entorno** — configuración externalizada en `.env`
- **Health checks** — Docker verifica que los servicios estén listos antes de marcarlos como `Up`
- **Escalado** — `--scale` levanta múltiples instancias del mismo servicio
- **Orquestación completa** — un solo comando (`docker compose up`) levanta todo el entorno
