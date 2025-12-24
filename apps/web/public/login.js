// Melhorar o suporte ao login com HTMX
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('login-form')
  if (!form) return

  // Interceptar submissão do formulário
  form.addEventListener('submit', function(e) {
    e.preventDefault()
    
    const formData = new FormData(form)
    const jsonData = {
      email: formData.get('email'),
      password: formData.get('password')
    }

    // Enviar via fetch com JSON
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.error || 'Credenciais inválidas')
        })
      }
      return response.json()
    })
    .then(data => {
      if (data.success) {
        // Redirecionar para dashboard
        window.location.href = '/dashboard'
      }
    })
    .catch(error => {
      // Mostrar erro
      const errorDiv = document.getElementById('error-message')
      const errorText = document.getElementById('error-text')
      errorText.textContent = error.message || 'Erro ao fazer login'
      errorDiv.classList.remove('hidden')
      
      // Limpar spinner
      htmx.ajax('GET', window.location.href, { select: 'body' })
    })
  })
})

// Função para lidar com erros de resposta
function handleLoginError(event) {
  const errorDiv = document.getElementById('error-message')
  const errorText = document.getElementById('error-text')
  errorText.textContent = 'Erro ao conectar com o servidor'
  errorDiv.classList.remove('hidden')
}
