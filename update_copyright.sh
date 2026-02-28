#!/bin/bash
# Script para actualizar copyright de Marcelo Roffé a Fair Support Fair Play
# Marcelo Roffé será mencionado como Consultor y Curador de Contenido

echo "Actualizando referencias de copyright..."

# Actualizar referencias en archivos Python
find src/server/main/admin src/server/main/platforms src/server/api -name "*.py" -type f -exec sed -i \
  's/© Marcelo Roffe 2026/Consultor y Curador: Marcelo Roffé\n© Fair Support Fair Play 2026 - Todos los derechos reservados/g' {} \;

find src/server/main/admin src/server/main/platforms src/server/api -name "*.py" -type f -exec sed -i \
  's/"author": "Marcelo Roffé"/"author": "Fair Support Fair Play"  # Curado por Marcelo Roffé/g' {} \;

# Actualizar SQL
sed -i 's/© Marcelo Roffe 2026/Consultor y Curador: Marcelo Roffé\n-- © Fair Support Fair Play 2026 - Todos los derechos reservados/g' src/server/db/*.sql

sed -i "s/author VARCHAR(255) DEFAULT 'Marcelo Roffé'/author VARCHAR(255) DEFAULT 'Fair Support Fair Play'/g" src/server/db/*.sql

sed -i "s/'Marcelo Roffé'/'Fair Support Fair Play'/g" src/server/db/seed_demo_data.sql

# Actualizar documentación
find docs -name "*.md" -type f -exec sed -i \
  's/**© Marcelo Roffe 2026 - Todos los Derechos Reservados**/**Consultor y Curador de Contenido:** Marcelo Roffé\n**© Fair Support Fair Play 2026 - Todos los derechos reservados**/g' {} \;

find docs -name "*.md" -type f -exec sed -i \
  's/© Marcelo Roffe 2026/Consultor y Curador: Marcelo Roffé\n© Fair Support Fair Play 2026 - Todos los derechos reservados/g' {} \;

# Actualizar README principal
sed -i 's/© Marcelo Roffe 2026/Consultor y Curador: Marcelo Roffé\n© Fair Support Fair Play 2026/g' README.md
sed -i 's/**Marcelo Roffe © 2026/**Fair Support Fair Play © 2026 | Consultor: Marcelo Roffé/g' README.md

echo "✅ Copyright actualizado en todos los archivos"
echo "✅ Marcelo Roffé ahora figura como: Consultor y Curador de Contenido"
echo "✅ Copyright principal: Fair Support Fair Play 2026"
