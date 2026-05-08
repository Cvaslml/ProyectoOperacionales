import os
import shutil

BASE_DIR = "/data"
current_path = BASE_DIR

def get_relative_path():
    return current_path.replace(BASE_DIR, "~") or "~"

def editor(path):
    with open(path, "r") as f:
        lines = f.read().splitlines()

    while True:
        print("\n  Contenido actual:")
        print("  ----------------------------")
        if lines:
            for i, line in enumerate(lines):
                print(f"  {i+1}: {line}")
        else:
            print("  (archivo vacio)")
        print("  ----------------------------")
        print("  Opciones: [a] agregar linea  [r] reemplazar linea  [d] borrar linea  [s] guardar y salir")
        opcion = input("  > ").strip()

        if opcion == "a":
            print("  Escribe la nueva linea:")
            nueva = input("  > ")
            lines.append(nueva)

        elif opcion == "r":
            print(f"  Numero de linea a reemplazar (1-{len(lines)}):")
            try:
                num = int(input("  > ")) - 1
                if 0 <= num < len(lines):
                    print(f"  Linea actual: {lines[num]}")
                    print("  Nueva linea:")
                    lines[num] = input("  > ")
                else:
                    print("  Numero fuera de rango")
            except ValueError:
                print("  Escribe un numero valido")

        elif opcion == "d":
            print(f"  Numero de linea a borrar (1-{len(lines)}):")
            try:
                num = int(input("  > ")) - 1
                if 0 <= num < len(lines):
                    borrada = lines.pop(num)
                    print(f"  Linea borrada: {borrada}")
                else:
                    print("  Numero fuera de rango")
            except ValueError:
                print("  Escribe un numero valido")

        elif opcion == "s":
            with open(path, "w") as f:
                f.write("\n".join(lines) + "\n")
            print("  Archivo guardado.")
            break

        else:
            print("  Opcion no reconocida")

def run():
    global current_path
    print("🖥️  Sistema de Archivos Simulado")
    print("   Escribe 'help' para ver los comandos disponibles\n")

    while True:
        command = input(f"[{get_relative_path()}] $ ").strip()

        if command == "exit":
            print("Saliendo del sistema...")
            break

        elif command == "help":
            print("""
Comandos disponibles:
  ls                    - Listar contenido del directorio actual
  mkdir <nombre>        - Crear un directorio
  rmdir <nombre>        - Eliminar un directorio vacio
  cd <nombre>           - Entrar a un directorio
  cd ..                 - Volver al directorio anterior
  touch <nombre>        - Crear un archivo vacio
  rm <nombre>           - Eliminar un archivo
  mv <origen> <destino> - Mover o renombrar un archivo
  edit <nombre>         - Editar un archivo .txt
  read <nombre>         - Leer un archivo .txt
  exit                  - Salir
            """)

        elif command == "ls":
            items = os.listdir(current_path)
            if items:
                for item in items:
                    full = os.path.join(current_path, item)
                    tipo = "📁" if os.path.isdir(full) else "📄"
                    print(f"  {tipo} {item}")
            else:
                print("  (vacio)")

        elif command.startswith("mkdir "):
            name = command[6:].strip()
            path = os.path.join(current_path, name)
            if os.path.exists(path):
                print(f"  Ya existe: {name}")
            else:
                os.makedirs(path)
                print(f"  Directorio creado: {name}")

        elif command.startswith("rmdir "):
            name = command[6:].strip()
            path = os.path.join(current_path, name)
            if not os.path.isdir(path):
                print(f"  No existe el directorio: {name}")
            elif os.listdir(path):
                print(f"  El directorio no esta vacio: {name}")
            else:
                os.rmdir(path)
                print(f"  Directorio eliminado: {name}")

        elif command.startswith("cd "):
            name = command[3:].strip()
            if name == "..":
                if current_path != BASE_DIR:
                    current_path = os.path.dirname(current_path)
                else:
                    print("  Ya estas en la raiz")
            else:
                path = os.path.join(current_path, name)
                if os.path.isdir(path):
                    current_path = path
                else:
                    print(f"  No existe el directorio: {name}")

        elif command.startswith("touch "):
            name = command[6:].strip()
            path = os.path.join(current_path, name)
            if os.path.exists(path):
                print(f"  Ya existe: {name}")
            else:
                open(path, "w").close()
                print(f"  Archivo creado: {name}")

        elif command.startswith("rm "):
            name = command[3:].strip()
            path = os.path.join(current_path, name)
            if not os.path.isfile(path):
                print(f"  No existe el archivo: {name}")
            else:
                os.remove(path)
                print(f"  Archivo eliminado: {name}")

        elif command.startswith("mv "):
            parts = command[3:].strip().split()
            if len(parts) != 2:
                print("  Uso: mv <origen> <destino>")
            else:
                origen = os.path.join(current_path, parts[0])
                destino = os.path.join(current_path, parts[1])
                if not os.path.exists(origen):
                    print(f"  No existe: {parts[0]}")
                else:
                    shutil.move(origen, destino)
                    print(f"  Movido: {parts[0]} -> {parts[1]}")

        elif command.startswith("edit "):
            name = command[5:].strip()
            path = os.path.join(current_path, name)
            if not name.endswith(".txt"):
                print("  Solo se puede editar archivos .txt")
            elif not os.path.isfile(path):
                print(f"  No existe el archivo: {name}")
            else:
                editor(path)

        elif command.startswith("read "):
            name = command[5:].strip()
            path = os.path.join(current_path, name)
            if not os.path.isfile(path):
                print(f"  No existe el archivo: {name}")
            elif not name.endswith(".txt"):
                print("  Solo se puede leer archivos .txt")
            else:
                with open(path, "r") as f:
                    print(f.read())

        else:
            if command != "":
                print(f"  Comando no reconocido: '{command}'. Escribe 'help'")

if __name__ == "__main__":
    run()
