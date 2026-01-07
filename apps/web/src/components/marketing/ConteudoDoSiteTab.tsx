'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Form, Input, Button, Upload, message, Row, Col, Image, Space, Spin, Card, Switch, Divider, Tooltip, Modal, ColorPicker } from 'antd'
import { useAuthStore } from '@/stores/auth'
import PhonePreview, { PhonePreviewRef } from './PhonePreview'
import type { UploadFile } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons'
import { OptimizedProfessionalsList } from '@/components/OptimizedProfessionalsList'
import { HorariosTab } from '@/components/HorariosTab'

const { TextArea } = Input

// Presets de temas
const THEME_PRESETS = [
  {
    id: 'dark',
    name: 'Escuro',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    buttonColor: '#22c55e',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'light',
    name: 'Claro',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    buttonColor: '#22c55e',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    backgroundColor: '#0f172a',
    textColor: '#e2e8f0',
    buttonColor: '#3b82f6',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    backgroundColor: '#1c1917',
    textColor: '#fef3c7',
    buttonColor: '#f97316',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'royal',
    name: 'Royal',
    backgroundColor: '#1e1b4b',
    textColor: '#e0e7ff',
    buttonColor: '#8b5cf6',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'rose',
    name: 'Rosa Feminino',
    backgroundColor: '#fdf2f8',
    textColor: '#831843',
    buttonColor: '#ec4899',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'sunshine',
    name: 'Sunshine (Amarelo)',
    backgroundColor: '#fffbf0',
    textColor: '#d97706',
    buttonColor: '#fbbf24',
    buttonTextColor: '#ffffff',
  },
  {
    id: 'custom',
    name: 'Personalizado',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    buttonColor: '#22c55e',
    buttonTextColor: '#ffffff',
  },
]

interface LandingPageContent {
  banner?: string
  aboutUs?: string
}

interface LandingBlock {
  id: string
  name: string
  label: string
  enabled: boolean
  order: number
}

interface ThemeColors {
  backgroundColor: string
  textColor: string
  buttonColor: string
  buttonTextColor: string
}

export default function ConteudoDoSiteTab() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [professionalsModalVisible, setProfessionalsModalVisible] = useState(false)
  const [horariosModalVisible, setHorariosModalVisible] = useState(false)
  const { tenant } = useAuthStore()
  const phonePreviewRef = useRef<PhonePreviewRef>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedColorsRef = useRef<ThemeColors | null>(null)
  
  // Estado do tema
  const [selectedTheme, setSelectedTheme] = useState('dark')
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    backgroundColor: '#000000',
    textColor: '#ffffff',
    buttonColor: '#22c55e',
    buttonTextColor: '#ffffff',
  })
  const [showBannerOverlay, setShowBannerOverlay] = useState(true)

  // Monitorar mudanças no themeColors e salvar automaticamente se estiver em modo 'custom'
  useEffect(() => {
    if (selectedTheme !== 'custom') {
      return
    }

    // Verificar se as cores realmente mudaram
    if (JSON.stringify(lastSavedColorsRef.current) === JSON.stringify(themeColors)) {
      return
    }

    // Atualizar preview localmente
    phonePreviewRef.current?.refresh()

    // Limpar timeout anterior
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Configurar novo timeout para salvar após 1 segundo sem mudanças
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveThemeCustom()
    }, 1000)

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [themeColors, selectedTheme])
  
  const [blocks, setBlocks] = useState<LandingBlock[]>([
    { id: 'sobre-nos', name: 'sobre-nos', label: 'Sobre Nós', enabled: true, order: 1 },
    { id: 'equipe', name: 'equipe', label: 'Profissionais', enabled: true, order: 2 },
    { id: 'horarios', name: 'horarios', label: 'Horário de Funcionamento', enabled: true, order: 3 },
    { id: 'contato', name: 'contato', label: 'Contato', enabled: true, order: 4 },
  ])

  // Carregar dados ao montar
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('Por favor, faça login para acessar esta área')
      setFetching(false)
      return
    }
    
    if (tenant?.id) {
      loadLandingPageContent()
      loadLandingBlocks()
    }
  }, [tenant?.id])

  const loadLandingBlocks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Token não encontrado - usuário não autenticado')
        return
      }
      
      console.log('Carregando blocos com token:', token.substring(0, 20) + '...')
      
      const response = await fetch(`http://localhost:3001/api/tenants/landing-blocks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Resposta do GET /landing-blocks:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Blocos carregados:', data.blocks)
        if (data.blocks && Array.isArray(data.blocks)) {
          // Definir blocos padrão
          const defaultBlocks: LandingBlock[] = [
            { id: 'sobre-nos', name: 'sobre-nos', label: 'Sobre Nós', enabled: true, order: 1 },
            { id: 'equipe', name: 'equipe', label: 'Profissionais', enabled: true, order: 2 },
            { id: 'horarios', name: 'horarios', label: 'Horário de Funcionamento', enabled: true, order: 3 },
            { id: 'contato', name: 'contato', label: 'Contato', enabled: true, order: 4 },
          ]
          
          // Merge: pega os dados salvos e adiciona blocos que faltam
          const savedBlockIds = data.blocks.map((b: LandingBlock) => b.id)
          const mergedBlocks = [...data.blocks]
          
          // Adicionar blocos que não existem nos salvos
          defaultBlocks.forEach(defaultBlock => {
            if (!savedBlockIds.includes(defaultBlock.id)) {
              mergedBlocks.push({
                ...defaultBlock,
                order: mergedBlocks.length + 1
              })
            }
          })
          
          // Ordenar por order
          mergedBlocks.sort((a: LandingBlock, b: LandingBlock) => a.order - b.order)
          
          setBlocks(mergedBlocks)
          console.log('Blocos após merge:', mergedBlocks)
        }
      } else if (response.status === 403) {
        console.error('Token inválido ou expirado')
        message.error('Sessão expirada. Por favor, faça login novamente.')
        localStorage.removeItem('token')
      } else {
        const error = await response.json()
        console.error('Erro ao carregar blocos:', error)
        message.error(error.error || 'Erro ao carregar blocos')
      }
    } catch (error) {
      console.error('Erro ao carregar blocos:', error)
      message.error('Erro ao conectar com o servidor')
    }
  }

  const loadLandingPageContent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/tenants/branding`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        form.setFieldsValue({
          aboutUs: data.description || data.about || '',
        })
        if (data.heroImage) {
          setPreviewImage(data.heroImage)
        }
        
        // Carregar cores do tema
        if (data.themeTemplate) {
          setSelectedTheme(data.themeTemplate)
        }
        if (data.backgroundColor || data.textColor || data.buttonColorPrimary) {
          setThemeColors({
            backgroundColor: data.backgroundColor || '#000000',
            textColor: data.textColor || '#ffffff',
            buttonColor: data.buttonColorPrimary || '#22c55e',
            buttonTextColor: data.buttonTextColor || '#ffffff',
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error)
    } finally {
      setFetching(false)
    }
  }

  // Função para selecionar um tema
  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId)
    const preset = THEME_PRESETS.find(t => t.id === themeId)
    if (preset && themeId !== 'custom') {
      setThemeColors({
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        buttonColor: preset.buttonColor,
        buttonTextColor: preset.buttonTextColor,
      })
    }
    // Atualizar preview localmente
    setTimeout(() => phonePreviewRef.current?.refresh(), 100)
    
    // Salvar tema automaticamente ao selecionar
    setTimeout(() => saveThemeAutomatically(themeId, preset), 200)
  }

  // Salvar tema automaticamente sem feedback visual de loading
  const saveThemeAutomatically = async (themeId: string, preset: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const payload = {
        themeTemplate: themeId,
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        buttonColorPrimary: preset.buttonColor,
        buttonTextColor: preset.buttonTextColor,
      }
      
      const response = await fetch('http://localhost:3001/api/tenants/branding', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (response.ok) {
        console.log('✅ Tema salvo automaticamente')
        // Atualizar preview com dados salvos
        setTimeout(() => {
          phonePreviewRef.current?.refresh()
        }, 300)
      }
    } catch (error) {
      console.error('Erro ao salvar tema automaticamente:', error)
    }
  }

  // Autosave com debounce para color pickers (salva quando o usuário sai)
  // Salvar tema customizado silenciosamente
  const saveThemeCustom = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const payload = {
        themeTemplate: selectedTheme,
        backgroundColor: themeColors.backgroundColor,
        textColor: themeColors.textColor,
        buttonColorPrimary: themeColors.buttonColor,
        buttonTextColor: themeColors.buttonTextColor,
      }
      
      const response = await fetch('http://localhost:3001/api/tenants/branding', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      if (response.ok) {
        console.log('✅ Tema personalizado salvo automaticamente')
        // Atualizar referência de cores salvas
        lastSavedColorsRef.current = { ...themeColors }
        // Atualizar preview
        setTimeout(() => {
          phonePreviewRef.current?.refresh()
        }, 300)
      }
    } catch (error) {
      console.error('Erro ao salvar tema personalizado:', error)
    }
  }

  // Salvar tema na API
  const saveTheme = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        message.error('Sessão expirada. Por favor, faça login novamente.')
        return
      }
      
      const payload = {
        themeTemplate: selectedTheme,
        backgroundColor: themeColors.backgroundColor,
        textColor: themeColors.textColor,
        buttonColorPrimary: themeColors.buttonColor,
        buttonTextColor: themeColors.buttonTextColor,
      }
      
      console.log('🎨 Salvando tema:', payload)
      
      const response = await fetch('http://localhost:3001/api/tenants/branding', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      let data
      try {
        data = await response.json()
      } catch (e) {
        data = { error: 'Resposta inválida do servidor' }
      }
      
      console.log('📡 Resposta:', response.status, data)
      
      if (response.ok) {
        message.success('Tema salvo com sucesso!')
        // Aguardar um pouco antes de atualizar o preview para garantir que os dados foram salvos
        setTimeout(() => {
          phonePreviewRef.current?.refresh()
        }, 500)
      } else if (response.status === 401) {
        message.error('Sessão expirada. Por favor, faça login novamente.')
      } else if (response.status === 400) {
        message.error(`Dados inválidos: ${JSON.stringify(data.details || data.error)}`)
      } else {
        message.error(`Erro ao salvar tema: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
      message.error('Erro ao conectar com o servidor')
    }
  }

  const toggleBlock = (blockId: string) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b))
  }

  // Carregar horários quando o modal de horários abre

  const getSortedBlocks = () => {
    return [...blocks].sort((a, b) => a.order - b.order)
  }

  const getBlockIndex = (blockId: string) => {
    return getSortedBlocks().findIndex(b => b.id === blockId)
  }

  const getTotalBlocks = () => {
    return getSortedBlocks().length
  }

  const moveBlockUp = (blockId: string) => {
    const sortedBlocks = getSortedBlocks()
    const index = sortedBlocks.findIndex(b => b.id === blockId)
    if (index > 0) {
      const newBlocks = blocks.map(b => {
        if (b.id === blockId) {
          return { ...b, order: sortedBlocks[index - 1].order }
        }
        if (b.id === sortedBlocks[index - 1].id) {
          return { ...b, order: sortedBlocks[index].order }
        }
        return b
      })
      setBlocks(newBlocks)
    }
  }

  const moveBlockDown = (blockId: string) => {
    const sortedBlocks = getSortedBlocks()
    const index = sortedBlocks.findIndex(b => b.id === blockId)
    if (index < sortedBlocks.length - 1) {
      const newBlocks = blocks.map(b => {
        if (b.id === blockId) {
          return { ...b, order: sortedBlocks[index + 1].order }
        }
        if (b.id === sortedBlocks[index + 1].id) {
          return { ...b, order: sortedBlocks[index].order }
        }
        return b
      })
      setBlocks(newBlocks)
    }
  }

  const beforeUpload = async (file: File) => {
    // Validar tamanho (max 2MB para não sobrecarregar o banco)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('A imagem deve ter no máximo 2MB!')
      return false
    }

    // Validar tipo
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Apenas imagens são permitidas!')
      return false
    }

    // Converter para Base64 e salvar automaticamente
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setPreviewImage(base64)
      
      // Salvar automaticamente no servidor
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3001/api/tenants/branding', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ heroImage: base64 }),
        })
        
        if (response.ok) {
          message.success('Foto atualizada!')
          // Aguarda um pouco para o servidor processar e atualiza o preview
          setTimeout(() => {
            phonePreviewRef.current?.refresh()
          }, 500)
        } else {
          const error = await response.json()
          console.error('Erro ao salvar foto:', error)
          message.error('Erro ao salvar foto')
        }
      } catch (error) {
        console.error('Erro ao salvar foto:', error)
        message.error('Erro ao conectar com o servidor')
      }
    }
    reader.readAsDataURL(file)
    
    // Retorna false para não fazer upload automático (vamos salvar via API de branding)
    return false
  }

  const handleSave = async (values: any) => {
    if (!tenant?.id) {
      message.error('Erro: Estabelecimento não identificado')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      console.log('Salvando conteúdo, tema e blocos...')
      console.log('Blocos a salvar:', blocks)
      console.log('Tema selecionado:', selectedTheme)
      console.log('Cores do tema:', themeColors)
      
      // Salvar conteúdo (foto, descrição e tema)
      const payload = {
        description: values.aboutUs,
        heroImage: previewImage,
        // Cores do tema
        themeTemplate: selectedTheme,
        backgroundColor: themeColors.backgroundColor,
        textColor: themeColors.textColor,
        buttonColorPrimary: themeColors.buttonColor,
        buttonTextColor: themeColors.buttonTextColor,
      }

      const response = await fetch(`http://localhost:3001/api/tenants/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log('Resposta PUT /branding:', response.status)

      if (response.ok) {
        // Também salvar blocos
        const blocksPayload = { blocks }
        console.log('Enviando blocos:', blocksPayload)
        
        const blocksResponse = await fetch(`http://localhost:3001/api/tenants/landing-blocks`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(blocksPayload),
        })

        console.log('Resposta PUT /landing-blocks:', blocksResponse.status)

        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json()
          console.log('Blocos salvos com sucesso:', blocksData)
          message.success('Conteúdo e seções atualizadas com sucesso!')
          // Atualizar o preview após salvar
          setTimeout(() => {
            phonePreviewRef.current?.refresh()
          }, 500)
        } else {
          const error = await blocksResponse.json()
          console.error('Erro ao salvar blocos:', error)
          message.success('Conteúdo atualizado! (Erro ao salvar seções: ' + error.error + ')')
        }
      } else {
        const error = await response.json()
        console.error('Erro ao salvar conteúdo:', error)
        message.error(error.message || 'Erro ao salvar conteúdo')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin />
      </div>
    )
  }

  const renderBlock = (blockId: string) => {
    if (blockId === 'sobre-nos') {
      return (
        <div key="sobre-nos" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>SOBRE NÓS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'sobre-nos')?.enabled ?? true}
                onChange={() => toggleBlock('sobre-nos')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('sobre-nos') === 0}
                  onClick={() => moveBlockUp('sobre-nos')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('sobre-nos') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('sobre-nos')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <Form.Item
            name="aboutUs"
            label={null}
            rules={[
              { max: 500, message: 'Máximo 500 caracteres' },
            ]}
          >
            <TextArea
              placeholder="Conte a história do seu negócio..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
          <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0 0' }}>
            Texto que aparece na seção Sobre nós do site.
          </p>
        </div>
      )
    }

    if (blockId === 'equipe') {
      return (
        <div key="equipe" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>PROFISSIONAIS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'equipe')?.enabled ?? true}
                onChange={() => toggleBlock('equipe')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('equipe') === 0}
                  onClick={() => moveBlockUp('equipe')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('equipe') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('equipe')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            marginBottom: '12px',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#666' }}>
              ℹ️ Exibe os membros da sua equipe no site.
            </p>
            <a 
              onClick={() => setProfessionalsModalVisible(true)} 
              style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}
            >
              ✏️ Gerenciar Profissionais
            </a>
          </div>
        </div>
      )
    }

    if (blockId === 'horarios') {
      return (
        <div key="horarios" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>HORÁRIO DE FUNCIONAMENTO</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'horarios')?.enabled ?? true}
                onChange={() => toggleBlock('horarios')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('horarios') === 0}
                  onClick={() => moveBlockUp('horarios')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('horarios') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('horarios')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            marginBottom: '12px',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#666' }}>
              ℹ️ Exibe os horários de funcionamento no site.
            </p>
            <a 
              onClick={() => setHorariosModalVisible(true)} 
              style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}
            >
              ✏️ Configurar Horários
            </a>
          </div>
        </div>
      )
    }

    if (blockId === 'contato') {
      return (
        <div key="contato" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>CONTATO</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'contato')?.enabled ?? true}
                onChange={() => toggleBlock('contato')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('contato') === 0}
                  onClick={() => moveBlockUp('contato')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('contato') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('contato')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            marginBottom: '12px',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#666' }}>
              ℹ️ Exibe telefone e email de contato no site.
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <Row gutter={[32, 32]}>
      {/* Coluna Esquerda - Formulário */}
      <Col xs={24} lg={14}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
          onValuesChange={() => {
            // Força re-render para atualizar preview
            setPreviewImage(previewImage)
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Tema da Landing Page */}
            <Card 
              title="🎨 Tema da Landing Page" 
              size="small"
            >
              {/* Presets de Temas */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 13 }}>
                  Temas Prontos
                </label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {THEME_PRESETS.map((preset) => (
                    <Tooltip key={preset.id} title={preset.name}>
                      <div
                        onClick={() => handleSelectTheme(preset.id)}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: selectedTheme === preset.id ? '3px solid #1890ff' : '2px solid #d9d9d9',
                          overflow: 'hidden',
                          position: 'relative',
                          transition: 'all 0.2s',
                          boxShadow: selectedTheme === preset.id ? '0 0 0 2px rgba(24,144,255,0.2)' : 'none',
                        }}
                      >
                        {/* Mini preview do tema */}
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: preset.backgroundColor,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 4,
                          }}
                        >
                          {preset.id === 'custom' ? (
                            <span style={{ fontSize: 20 }}>🎨</span>
                          ) : (
                            <>
                              <div
                                style={{
                                  width: 24,
                                  height: 6,
                                  backgroundColor: preset.textColor,
                                  borderRadius: 2,
                                  marginBottom: 4,
                                  opacity: 0.8,
                                }}
                              />
                              <div
                                style={{
                                  width: 30,
                                  height: 12,
                                  backgroundColor: preset.buttonColor,
                                  borderRadius: 3,
                                }}
                              />
                            </>
                          )}
                        </div>
                        {/* Check de selecionado */}
                        {selectedTheme === preset.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              backgroundColor: '#1890ff',
                              borderRadius: '50%',
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CheckOutlined style={{ color: '#fff', fontSize: 10 }} />
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Color Pickers - sempre visíveis, mas mais destaque quando custom */}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ 
                opacity: selectedTheme === 'custom' ? 1 : 0.7,
                transition: 'opacity 0.2s',
              }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 13 }}>
                  Cores {selectedTheme !== 'custom' && '(clique em Personalizado para editar)'}
                </label>
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ColorPicker
                        value={themeColors.backgroundColor}
                        onChange={(color) => setThemeColors(prev => ({ ...prev, backgroundColor: color.toHexString() }))}
                        disabled={selectedTheme !== 'custom'}
                        size="small"
                      />
                      <span style={{ fontSize: 12 }}>Fundo</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ColorPicker
                        value={themeColors.textColor}
                        onChange={(color) => setThemeColors(prev => ({ ...prev, textColor: color.toHexString() }))}
                        disabled={selectedTheme !== 'custom'}
                        size="small"
                      />
                      <span style={{ fontSize: 12 }}>Texto</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ColorPicker
                        value={themeColors.buttonColor}
                        onChange={(color) => setThemeColors(prev => ({ ...prev, buttonColor: color.toHexString() }))}
                        disabled={selectedTheme !== 'custom'}
                        size="small"
                      />
                      <span style={{ fontSize: 12 }}>Botão</span>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ColorPicker
                        value={themeColors.buttonTextColor}
                        onChange={(color) => setThemeColors(prev => ({ ...prev, buttonTextColor: color.toHexString() }))}
                        disabled={selectedTheme !== 'custom'}
                        size="small"
                      />
                      <span style={{ fontSize: 12 }}>Texto do Botão</span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
            {/* Foto da Landing Page */}
            <Card size="small" title="📷 Foto da Landing Page">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <Upload
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    accept="image/*"
                    listType="picture"
                    showUploadList={false}
                  >
                    <Button>Selecionar Foto</Button>
                  </Upload>
                  <p style={{ fontSize: 12, color: '#666', margin: '8px 0 0 0' }}>
                    Recomendado: 1080x1080px (1:1) | Máximo: 2MB
                  </p>
                </div>
                {previewImage && (
                  <Image
                    src={previewImage}
                    alt="Prévia"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'contain',
                      borderRadius: 8,
                      background: '#f5f5f5',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            </Card>

            {/* Configuração do Banner */}
            <Card 
              size="small" 
              title="⚙️ Configurações da Imagem"
              extra={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    Degradê de transparência
                  </span>
                  <Switch 
                    checked={showBannerOverlay} 
                    onChange={(checked) => {
                      setShowBannerOverlay(checked)
                      setTimeout(() => phonePreviewRef.current?.refresh(), 100)
                    }}
                  />
                </div>
              }
            >
              <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                Ativa ou desativa o degradê de transparência no rodapé da imagem, criando um efeito de transição suave para o fundo.
              </p>
            </Card>

            {/* Renderizar blocos em ordem */}
            {getSortedBlocks().map((block) => renderBlock(block.id))}

            {/* Botão Salvar */}
            <Row justify="end">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ minWidth: 120 }}
              >
                Salvar
              </Button>
            </Row>
          </Space>
        </Form>
      </Col>

      {/* Coluna Direita - Preview do Celular */}
      <Col xs={24} lg={10}>
        <div style={{ position: 'sticky', top: 24 }}>
          <h3 style={{ marginBottom: 16, textAlign: 'center' }}>
            📱 Preview em Tempo Real
          </h3>
          <PhonePreview ref={phonePreviewRef} showBannerOverlay={showBannerOverlay} />
        </div>
      </Col>

      {/* CSS Global para Modais Slide-out */}
      <style>{`
        .slideout-modal-wrap .ant-modal {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
        }
        .slideout-modal-wrap .ant-modal-content {
          height: 100vh !important;
          border-radius: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .slideout-modal-wrap .ant-modal-body {
          flex: 1 !important;
          overflow: auto !important;
        }
        .slideout-modal-content-scaled {
          transform: scale(0.85);
          transform-origin: top left;
          width: 117.65%;
        }
      `}</style>

      {/* Modal de Gerenciamento de Profissionais - Slide-out sem sidebar */}
      <Modal
        title="Gerenciar Profissionais"
        open={professionalsModalVisible}
        onCancel={() => setProfessionalsModalVisible(false)}
        footer={
          <Button onClick={() => setProfessionalsModalVisible(false)}>
            Fechar
          </Button>
        }
        width="60%"
        wrapClassName="slideout-modal-wrap"
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
          body: {
            height: 'calc(100vh - 120px)',
            overflow: 'auto',
            padding: '16px',
          },
          header: {
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
            marginBottom: 0,
          },
          footer: {
            borderTop: '1px solid #f0f0f0',
            padding: '16px 24px',
          },
        }}
        destroyOnClose
      >
        <div className="slideout-modal-content-scaled">
          <OptimizedProfessionalsList />
        </div>
      </Modal>

      {/* Modal de Configuração de Horários - Slide-out sem sidebar */}
      <Modal
        title="Configurar Horários de Funcionamento"
        open={horariosModalVisible}
        onCancel={() => setHorariosModalVisible(false)}
        footer={
          <Button onClick={() => setHorariosModalVisible(false)}>
            Fechar
          </Button>
        }
        width="60%"
        wrapClassName="slideout-modal-wrap"
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
          body: {
            height: 'calc(100vh - 120px)',
            overflow: 'auto',
            padding: '16px',
          },
          header: {
            borderBottom: '1px solid #f0f0f0',
            padding: '16px 24px',
            marginBottom: 0,
          },
          footer: {
            borderTop: '1px solid #f0f0f0',
            padding: '16px 24px',
          },
        }}
        destroyOnClose
      >
        <div className="slideout-modal-content-scaled">
          <HorariosTab
            onSaveSuccess={() => {
              setHorariosModalVisible(false)
              phonePreviewRef.current?.refresh()
            }}
          />
        </div>
      </Modal>
    </Row>
  )
}
