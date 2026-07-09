import { Divider } from '@heroui/react'
import React from 'react'

interface Props {
  title: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
  divider?: boolean
}

const SettingItem: React.FC<Props> = (props) => {
  const { title, actions, children, divider = false } = props

  return (
    <>
      <div className="lx-setting-item select-text">
        <div className="lx-setting-title-wrap">
          <h4 className="lx-setting-title">{title}</h4>
          {actions && <div className="lx-setting-actions">{actions}</div>}
        </div>
        <div className="lx-setting-control app-nodrag">{children}</div>
      </div>
      {divider && <Divider className="lx-setting-divider" />}
    </>
  )
}

export default SettingItem
