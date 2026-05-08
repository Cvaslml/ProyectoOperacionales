# Proyecto Sistemas Operacionales  
## Simulación de un Sistema de Archivos usando Docker

### 📌 Descripción general
Este proyecto consiste en la simulación de un sistema de archivos utilizando contenedores Docker.  
El objetivo es comprender, de forma práctica, conceptos fundamentales de los Sistemas Operacionales como:
- gestión de archivos
- persistencia de datos
- aislamiento de procesos
Cada contenedor representa un entorno aislado que interactúa con un sistema de archivos simulado mediante volúmenes de Docker.
---

### 🎯 Objetivo del proyecto
Simular el funcionamiento básico de un sistema de archivos, permitiendo realizar operaciones como creación, lectura, escritura y eliminación de archivos, y analizar su persistencia y aislamiento utilizando Docker.

---

### 🧱 Estructura del proyecto
La estructura base del proyecto es la siguiente:

```text
ProyectoOperacionales/
│
├── app/ # Código de la aplicación (Python / C++ / Java)
│ └── main.py
│
├── docker/ # Configuración de Docker
│ └── Dockerfile
│
├── volumes/
│ └── data/ # Sistema de archivos simulado (volumen)
│
├── docker-compose.yml # Orquestación de contenedores
├── README.md # Documentación del proyecto
└── .gitignore
```

### ▶️ Clonar el repositorio
```terminal bash
git clone https://github.com/alalo10/ProyectoOperacionales.git
cd ProyectoOperacionales
```

### ¿Qué es un Dockerfile?
Un Dockerfile es un archivo de texto que contiene las instrucciones para construir una imagen Docker, después de creados los programa se le dan las intrucciones al Dockerfile que ese sera el programa que va a contener, los contenedores docker corren en linux, es posible que corran con windows pero eso los vuelve más pesados y complejos por eso se usa la tecnologia WSL que es propia de docker y lo que permite es darle un piso con kernel de linux para crear las paredes del contenedor y este se pueda correr en toda máquina, los que hace WSL es conectar con el kernel de la maquia y ejecutar el kernel de linux

Dicho de forma sencilla:

* Dockerfile = receta
* Imagen Docker = torta ya horneada
* Contenedor = torta servida y en uso

## ¿Qué vamos a hacer realmente?
Sistema de archivos simulado con Docker pensado para Sistemas Operacionales, no para hacer un Windows 2.0. Haremoa una interfaz por consola (CLI) Tal como:
* ls
* cd
* mkdir
* touch
Esto es exactamente cómo funcionan los SO por debajo.

2️⃣ ¿Qué es “un archivo” En nuestro sistema, un archivo es una clave conceptual, no importa el tipo de archivo... Para el sistema operativo:
* .txt
* .pdf
* .xlsx
* .docx
Todos son solo archivos con bytes, así que NO los vamos a interpretar, solo:
* crear
* borrar
* mover
* listar
* leer texto (solo si es .txt)

3️⃣ Paras las funcionalidades que tendrá el sistema, se definirá un MVP académico (mínimo viable pero sólido).

📁 Gestión de directorios
* Crear directorios
* Listar contenido
* Navegar entre carpetas
* Eliminar directorios vacíos
Comandos simulados:
* mkdir docs
* cd docs
* ls
* rmdir docs

📄 Gestión de archivos
* Crear archivos vacíos
* Eliminar archivos
* Mover archivos
* Renombrar archivos
* Mostrar contenido solo de .txt

---

### ¿Qué rol juega Docker aquí?
Docker garantiza que: Todos usan el mismo entorno, No importa Windows / Linux / Mac, El sistema funciona igual en cualquier PC

📦 El contenedor será: “Un sistema Linux que ejecuta un gestor de archivos simulado por consola” -> Eso es texto de informe nivel SO.

---
Lo que logramos:

Un sistema de archivos simulado corriendo dentro de un contenedor Docker
Comandos funcionales: ls, mkdir, rmdir, cd, touch, rm, mv, read, edit
Un editor de texto por líneas con opciones de agregar, reemplazar y borrar
Persistencia de datos mediante volúmenes Docker — los archivos sobreviven aunque el contenedor se apague
Aislamiento de procesos — todo corre dentro del contenedor sin afectar tu máquina
Código subido a GitHub correctamente

Los tres conceptos de Sistemas Operacionales que demostramos:

Gestión de archivos → todos los comandos del CLI
Persistencia de datos → volumen volumes/data
Aislamiento de procesos → el contenedor Docker

<img width="560" height="429" alt="image" src="https://github.com/user-attachments/assets/8ef174c4-0d5a-4295-9763-2f33419ea432" />

