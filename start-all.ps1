Write-Host "🚀 Iniciando BackEnd..."
cd .\BackEnd
npm install
Start-Process powershell -ArgumentList 'npm run dev'
cd ..

Write-Host "🚀 Iniciando FrontEnd..."
cd .\FrontEnd
npm install
Start-Process powershell -ArgumentList 'npm run dev'

Write-Host "✅ Ambos entornos iniciados."
