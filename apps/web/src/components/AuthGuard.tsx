'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Spin } from 'antd'
import { useAuthStore, UserRole } from '@/stores/auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  
  const { 
    isAuthenticated, 
    isLoading, 
    user,
    checkAuth, 
    canAccess 
  } = useAuthStore()

  useEffect(() => {
    const verify = async () => {
      // Se já está autenticado, não precisa verificar
      if (!isAuthenticated) {
        await checkAuth()
      }
      setIsChecking(false)
    }
    
    verify()
  }, [isAuthenticated, checkAuth])

  // Ainda verificando autenticação
  if (isChecking || isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="Carregando..." />
      </div>
    )
  }

  // Rota pública - permite acesso
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Se já está autenticado e tenta acessar login/register, redireciona para dashboard
    if (isAuthenticated) {
      router.replace('/dashboard')
      return null
    }
    return <>{children}</>
  }

  // Rota protegida - verifica autenticação
  if (!isAuthenticated) {
    router.replace('/login')
    return null
  }

  // Verifica role se necessário
  if (requiredRole && !canAccess(requiredRole)) {
    // Usuário autenticado mas sem permissão
    router.replace('/dashboard')
    return null
  }

  return <>{children}</>
}

// HOC para páginas que precisam de autenticação
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole | UserRole[]
) {
  return function ProtectedPage(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Hook para verificar permissões
export function usePermissions() {
  const { user, tenant, isMaster, isOwner, isProfessional, canAccess } = useAuthStore()
  
  return {
    user,
    tenant,
    role: user?.role,
    isMaster: isMaster(),
    isOwner: isOwner(),
    isProfessional: isProfessional(),
    canAccess,
    
    // Permissões específicas
    canViewFinancials: user?.role === 'MASTER' || user?.role === 'OWNER',
    canManageProfessionals: user?.role === 'MASTER' || user?.role === 'OWNER',
    canManageServices: user?.role === 'MASTER' || user?.role === 'OWNER',
    canManageSettings: user?.role === 'MASTER' || user?.role === 'OWNER',
    canViewAllAppointments: user?.role === 'MASTER' || user?.role === 'OWNER',
  }
}
