'use client'

import React, { useState, ReactNode } from 'react'
import { Modal, Menu, Button, Divider } from 'antd'

// Estilo para o Modal como slide-out panel
const modalStyle = `
  .sidebar-modal .ant-modal {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 100vh !important;
    border-radius: 0 !important;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
    max-width: none !important;
  }
  
  .sidebar-modal .ant-modal-content {
    height: 100vh !important;
    padding: 0 !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    margin: 0 !important;
  }
  
  .sidebar-modal .ant-modal-wrap {
    overflow: hidden !important;
    padding: 0 !important;
  }
  
  .sidebar-modal .ant-modal-centered {
    padding: 0 !important;
  }
  
  .sidebar-modal .ant-modal-header {
    border-bottom: 1px solid #f0f0f0 !important;
    padding: 16px 24px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
  }
  
  .sidebar-modal .ant-modal-body {
    height: calc(100vh - 140px) !important;
    overflow-y: hidden !important;
    padding: 0 !important;
    flex: 1 !important;
    display: flex !important;
    width: 100% !important;
  }
  
  .sidebar-modal .ant-modal-footer {
    padding: 16px 24px !important;
    border-top: 1px solid #f0f0f0 !important;
    flex-shrink: 0 !important;
  }
  
  .sidebar-modal-sidebar {
    width: 180px;
    min-width: 180px;
    border-right: 1px solid #f0f0f0;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-modal-sidebar .ant-menu {
    border: none;
    flex: 1;
    margin-top: 8px;
  }
  
  .sidebar-modal-sidebar .ant-menu-item {
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow: visible !important;
    height: auto !important;
    line-height: 1.5;
    padding: 8px 12px !important;
  }
  
  .sidebar-modal-sidebar .ant-menu-item-label {
    overflow: visible !important;
    text-overflow: unset !important;
    white-space: normal !important;
  }
  
  .sidebar-modal-content {
    flex: 1;
    padding: 24px;
    padding-right: 8px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    margin-right: 0 !important;
  }
  
  .sidebar-modal-content > * {
    padding-right: 32px;
  }
  
  .sidebar-modal-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .sidebar-modal-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .sidebar-modal-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  .sidebar-modal-content::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .sidebar-modal-content form {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .sidebar-modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
  
  @media (max-width: 768px) {
    .sidebar-modal .ant-modal {
      width: 100% !important;
    }
    
    .sidebar-modal-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #f0f0f0;
      padding: 16px;
    }
    
    .sidebar-modal .ant-modal-body {
      flex-direction: column;
    }
  }
`

export interface SidebarTab {
  key: string
  label: string
}

export interface ModalWithSidebarProps {
  title: string
  open: boolean
  onClose: () => void
  onCancel?: () => void
  onSave?: () => void
  tabs: SidebarTab[]
  activeTab?: string
  onTabChange?: (key: string) => void
  isLoading?: boolean
  isSaving?: boolean
  width?: string | number
  children: ReactNode
  footer?: ReactNode
  sidebarContent?: ReactNode
  defaultActiveKey?: string
}

/**
 * Componente wrapper para modais com sidebar menu
 * Fornece layout consistente com abas na lateral esquerda
 * 
 * @example
 * <ModalWithSidebar
 *   title="Editar Cliente"
 *   open={open}
 *   onClose={onClose}
 *   onSave={handleSave}
 *   tabs={[
 *     { key: 'dados', label: 'Dados' },
 *     { key: 'endereco', label: 'Endereço' },
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   isSaving={isSaving}
 * >
 *   {activeTab === 'dados' && <DadosTab />}
 *   {activeTab === 'endereco' && <EnderecoTab />}
 * </ModalWithSidebar>
 */
export function ModalWithSidebar({
  title,
  open,
  onClose,
  onCancel,
  onSave,
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  isLoading = false,
  isSaving = false,
  width = '60%',
  children,
  footer,
  sidebarContent,
  defaultActiveKey,
}: ModalWithSidebarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultActiveKey || tabs[0]?.key || '')

  // Usar tab controlada se fornecida, senão usar interna
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabChange = (key: string) => {
    setInternalActiveTab(key)
    onTabChange?.(key)
  }

  const defaultFooter = (
    <div className="sidebar-modal-buttons">
      <Button onClick={onClose || onCancel}>Cancelar</Button>
      {onSave && (
        <Button type="primary" loading={isSaving} onClick={onSave}>
          Salvar
        </Button>
      )}
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <Modal
        title={title}
        open={open}
        onCancel={onClose || onCancel}
        footer={footer !== undefined ? footer : defaultFooter}
        width={width}
        bodyStyle={{ padding: 0, height: 'calc(100vh - 140px)' }}
        wrapClassName="sidebar-modal"
        styles={{
          content: { padding: 0, borderRadius: 0 },
        }}
        loading={isLoading}
      >
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
          {/* Sidebar */}
          <div className="sidebar-modal-sidebar">
            {sidebarContent}
            {tabs.length > 1 && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <Menu
                  selectedKeys={[activeTab]}
                  onSelect={({ key }) => handleTabChange(key)}
                  items={tabs.map((tab) => ({
                    key: tab.key,
                    label: tab.label,
                  }))}
                  style={{ border: 'none' }}
                  theme="light"
                />
              </>
            )}
          </div>

          {/* Conteúdo */}
          <div className="sidebar-modal-content">{children}</div>
        </div>
      </Modal>
    </>
  )
}
