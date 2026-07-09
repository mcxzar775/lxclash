import React from 'react'
import LxSwitch, { LxSwitchProps } from './lx-switch'
import './lx-switch.css'

interface BorderSwitchProps extends LxSwitchProps {
  isShowBorder?: boolean
}

const BorderSwitch: React.FC<BorderSwitchProps> = (props) => {
  const { isShowBorder = false, className = '', ...switchProps } = props
  return (
    <LxSwitch
      {...switchProps}
      className={`${isShowBorder ? 'is-border-highlight' : ''} ${className}`.trim()}
    />
  )
}

export default BorderSwitch
