import React from 'react'
import './lx-switch.css'

export interface LxSwitchProps {
  isSelected?: boolean
  defaultSelected?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  onValueChange?: (selected: boolean) => void | Promise<void>
  className?: string
  'aria-label'?: string
  children?: React.ReactNode
  size?: string
  color?: string
  value?: string
  classNames?: Record<string, unknown>
}

const LxSwitch: React.FC<LxSwitchProps> = (props) => {
  const {
    isSelected,
    defaultSelected = false,
    isDisabled = false,
    isReadOnly = false,
    onValueChange,
    className = '',
    children,
    'aria-label': ariaLabel
  } = props
  const [innerSelected, setInnerSelected] = React.useState(defaultSelected)
  const selected = typeof isSelected === 'boolean' ? isSelected : innerSelected

  const toggle = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault()
    event?.stopPropagation()
    if (isDisabled || isReadOnly) return
    const next = !selected
    if (typeof isSelected !== 'boolean') setInnerSelected(next)
    await onValueChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'switch')}
      disabled={isDisabled}
      className={`lx-native-switch app-nodrag ${selected ? 'is-on' : 'is-off'} ${isDisabled ? 'is-disabled' : ''} ${className}`.trim()}
      onClick={toggle}
    >
      <span className="lx-native-switch-track" />
      <span className="lx-native-switch-thumb" />
      <span className="lx-native-switch-label">{selected ? 'ON' : 'OFF'}</span>
      {children ? <span className="lx-native-switch-children">{children}</span> : null}
    </button>
  )
}

export default LxSwitch
