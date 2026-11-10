$ErrorActionPreference = 'Stop'

$env:SUPERADMIN_USERNAME = Read-Host 'Nombre de usuario para la cuenta propietaria'
$env:SUPERADMIN_EMAIL = Read-Host 'Email de la cuenta propietaria'
$securePassword = Read-Host 'Contraseña (mínimo 12 caracteres; no se mostrará)' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:SUPERADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    npm run create:superadmin
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la cuenta superadmin.' }
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    Remove-Item Env:SUPERADMIN_USERNAME -ErrorAction SilentlyContinue
    Remove-Item Env:SUPERADMIN_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:SUPERADMIN_PASSWORD -ErrorAction SilentlyContinue
}
