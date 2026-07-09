import React, { useRef, useState, useCallback } from 'react'
import { FaSearch } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5'

interface CollapseInputProps {
  title: string
  value?: string | number | readonly string[]
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * LongXing proxy group search control.
 *
 * We intentionally do not use HeroUI Input here. In the proxy group toolbar,
 * HeroUI's hidden input/wrapper can be affected by global switch styles and
 * render like a tiny switch/track on macOS Electron. This native control keeps
 * the original behavior: a search icon button that expands into a text box.
 */
const CollapseInput: React.FC<CollapseInputProps> = (props) => {
  const { title, value = '', onValueChange, placeholder, className = '' } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const isComposingRef = useRef(false)
  const [expanded, setExpanded] = useState(Boolean(String(value || '').length))
  const [localValue, setLocalValue] = useState(String(value || ''))

  React.useEffect(() => {
    if (!isComposingRef.current) {
      const next = String(value || '')
      setLocalValue(next)
      if (next) setExpanded(true)
    }
  }, [value])

  const open = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setExpanded(true)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const close = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setLocalValue('')
    onValueChange?.('')
    setExpanded(false)
  }, [onValueChange])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      setLocalValue(next)
      if (!isComposingRef.current) onValueChange?.(next)
    },
    [onValueChange]
  )

  const handleBlur = useCallback(() => {
    if (!localValue) setExpanded(false)
  }, [localValue])

  if (!expanded) {
    return (
      <button
        type="button"
        title={title}
        aria-label={title}
        className={`app-nodrag inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-500 transition hover:bg-content2 hover:text-primary ${className}`.trim()}
        onClick={open}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <FaSearch className="text-base" />
      </button>
    )
  }

  return (
    <div
      className={`app-nodrag flex h-8 w-[180px] shrink-0 items-center rounded-lg border border-primary/35 bg-content2/70 px-2 shadow-sm ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <FaSearch className="mr-2 shrink-0 text-sm text-primary" />
      <input
        ref={inputRef}
        value={localValue}
        placeholder={placeholder || title}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-400"
        onChange={handleChange}
        onBlur={handleBlur}
        onCompositionStart={() => {
          isComposingRef.current = true
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false
          onValueChange?.(e.currentTarget.value)
        }}
      />
      <button
        type="button"
        title="清空"
        aria-label="清空搜索"
        className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground-500 transition hover:bg-content3 hover:text-danger"
        onMouseDown={(e) => e.preventDefault()}
        onClick={close}
      >
        <IoClose className="text-base" />
      </button>
    </div>
  )
}

export default CollapseInput
