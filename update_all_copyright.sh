#!/bin/bash

# Script para actualizar copyright en todos los archivos
# Marcelo Roffé ahora es solo Consultor y Curador de Contenido
# Copyright es compartido (joint ownership)

echo "Actualizando copyright en todos los archivos..."

# Función para actualizar un archivo
update_file() {
    local file="$1"
    echo "Actualizando: $file"
    
    # Backup
    cp "$file" "$file.bak"
    
    # Reemplazos
    sed -i 's/Marcelo Roffé - Professional Sports Psychology Advisor/Consultor y Curador de Contenido: Marcelo Roffé/g' "$file"
    sed -i 's/Professional Consultant: Marcelo Roffé/Consultor y Curador de Contenido: Marcelo Roffé/g' "$file"
    sed -i 's/© Marcelo Roffé 2026/© Fair Support Fair Play 2026 | Consultor: Marcelo Roffé/g' "$file"
    sed -i 's/Copyright © 2026 Marcelo Roffé/Copyright © 2026 Fair Support Fair Play/g' "$file"
    sed -i 's/Content © Marcelo Roffé/Contenido curado por: Marcelo Roffé/g' "$file"
    sed -i 's/Marcelo Roffé, reconocido psicólogo deportivo/Consultor y curador de contenido: Marcelo Roffé, reconocido psicólogo deportivo/g' "$file"
    sed -i "s/author='Marcelo Roffé'/curator='Marcelo Roffé'/g" "$file"
    sed -i "s/\"author\": \"Marcelo Roffé\"/\"curator\": \"Marcelo Roffé\"/g" "$file"
    sed -i "s/'author': 'Marcelo Roffé'/'curator': 'Marcelo Roffé'/g" "$file"
    
    # Si el archivo menciona que Marcelo es el autor principal, cambiar
    sed -i 's/desarrollada por Marcelo Roffé/con contenido curado por Marcelo Roffé/g' "$file"
    sed -i 's/creada por Marcelo Roffé/con contenido curado por Marcelo Roffé/g' "$file"
    
    # Limpiar backup si no hubo cambios significativos
    if diff "$file" "$file.bak" > /dev/null 2>&1; then
        rm "$file.bak"
        echo "  → Sin cambios necesarios"
    else
        rm "$file.bak"
        echo "  → ✅ Actualizado"
    fi
}

# Archivos Python
for file in ./src/server/**/*.py; do
    [ -f "$file" ] && update_file "$file"
done

# Archivos SQL
for file in ./src/server/db/*.sql; do
    [ -f "$file" ] && update_file "$file"
done

# Archivos Markdown
for file in ./*.md ./docs/*.md; do
    [ -f "$file" ] && update_file "$file"
done

echo ""
echo "✅ Actualización completa!"
echo ""
echo "Resumen de cambios:"
echo "- Marcelo Roffé ahora aparece como: 'Consultor y Curador de Contenido'"
echo "- Copyright cambiado a: '© Fair Support Fair Play 2026'"
echo "- Referencias de autoría cambiadas a curaduría"
