'use client'

import { useParams } from 'next/navigation'

export default function TenantPage() {
  const params = useParams()
  const tenantSlug = params.tenantSlug

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>AIGenda - {tenantSlug}</h1>
      <p>Página em desenvolvimento</p>
    </div>
  )
}
