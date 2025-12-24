// Arquivo para melhorar o suporte ao login com HTMX
document.addEventListener('htmx:configRequest', function(detail) {
  // Se for para /api/login, garantir JSON
  if (detail.verb === 'POST' && detail.path === '/api/login') {
    detail.headers['Content-Type'] = 'application/json'
  }
})

// Interceptar submissão do formulário de login
document.addEventListener('htmx:beforeRequest', function(detail) {
  if (detail.verb === 'POST' && detail.path === '/api/login') {
    // Extrair dados do formulário
    const form = detail.target.closest('form')
    if (form) {
      const formData = new FormData(form)
      const jsonData = Object.fromEntries(formData)
      // Converter para JSON
      detail.detail.body = JSON.stringify(jsonData)
    }
  }
})
