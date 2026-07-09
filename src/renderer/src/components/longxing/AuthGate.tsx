import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, Spinner } from '@heroui/react'
import bgVideo from '../../assets/longxing-bg.mp4'
import logoMark from '../../assets/longxing-logo-mark.png'

interface AuthState {
  authorized: boolean
  accessKey?: string
  subscriptionUrl?: string
  deviceId: string
  message?: string
}

interface AuthGateProps {
  children: ReactNode
}

function maskKey(value: string): string {
  if (value.length <= 8) return value
  return `${value.slice(0, 4)}••••${value.slice(-4)}`
}

async function invokeAuth<T>(channel: string, ...args: unknown[]): Promise<T> {
  const response = await window.electron.ipcRenderer.invoke(channel, ...args)
  if (response && typeof response === 'object' && 'invokeError' in response) {
    throw (response as { invokeError: unknown }).invokeError
  }
  return response as T
}

function getAuthState(): Promise<AuthState> {
  return invokeAuth<AuthState>('getLongXingAuthState')
}

function verifyAuth(accessKey: string): Promise<AuthState> {
  return invokeAuth<AuthState>('verifyLongXingAuthorization', { accessKey })
}

function logoutAuth(): Promise<AuthState> {
  return invokeAuth<AuthState>('logoutLongXingAuthorization')
}

export default function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<AuthState | null>(null)
  const [accessKey, setAccessKey] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAuthState()
      .then((result) => {
        setState(result)
        if (result.message && !result.authorized) setMessage(result.message)
      })
      .catch((error) => {
        setState({ authorized: false, deviceId: 'LX-UNKNOWN' })
        setMessage(error instanceof Error ? error.message : String(error))
      })
  }, [])

  const deviceId = useMemo(() => state?.deviceId || '正在读取…', [state?.deviceId])

  const submit = async (): Promise<void> => {
    const key = accessKey.trim()
    if (!key || loading) return
    setLoading(true)
    setMessage('')
    try {
      const result = await verifyAuth(key)
      setState(result)
      setMessage(result.message || '')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const result = await logoutAuth()
      setState(result)
      setAccessKey('')
      setMessage(result.message || '')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error))
    }
  }

  if (!state) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050b14] text-white">
        <div className="flex items-center gap-3">
          <Spinner size="sm" />正在验证龙行科技授权…
        </div>
      </div>
    )
  }

  if (!state.authorized) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#050b14] text-white relative">
        <video className="absolute inset-0 h-full w-full object-cover opacity-55" autoPlay muted loop playsInline preload="auto">
          <source src={bgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,8,18,.94),rgba(4,16,31,.58),rgba(2,8,18,.88))] backdrop-blur-[2px]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(32,139,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(32,139,255,.12) 1px,transparent 1px)',
            backgroundSize: '42px 42px'
          }}
        />
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-cyan-500/25 bg-[#081827]/95 p-8 shadow-2xl shadow-blue-950/60">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/25 bg-white/8 shadow-[0_0_34px_rgba(56,189,248,.16)]">
              <img src={logoMark} alt="龙行科技" className="h-16 w-16 object-contain" />
            </div>
            <div className="text-center tracking-[.28em] text-xs text-cyan-300 mb-2">LONGXING CONTROL CENTER</div>
            <h1 className="text-center text-2xl font-bold mb-2">龙行科技授权登录</h1>
            <p className="text-center text-sm text-slate-400 mb-7">验证成功后自动导入并启用专属订阅，随后进入完整客户端。</p>
            <label className="lx-auth-field app-nodrag">
              <span className="lx-auth-label">客户授权码</span>
              <input
                className="lx-auth-input"
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                placeholder="请输入客户授权码，例如 LX-XXXX-XXXX"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void submit()
                }}
              />
            </label>
            <div className="mt-4 rounded-xl bg-black/25 px-4 py-3 text-xs text-slate-400">
              <div className="mb-1">设备编号</div>
              <code className="text-cyan-300 select-all">{deviceId}</code>
            </div>
            {message && <div className="mt-4 text-sm text-amber-300 break-words">{message}</div>}
            <Button color="primary" className="mt-6 w-full font-semibold" isLoading={loading} onPress={() => void submit()}>
              验证授权并进入
            </Button>
            <div className="mt-5 text-center text-xs text-slate-500">授权服务：lxkj.x11.pp.ua</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <div className="fixed right-3 bottom-3 z-[9999] flex items-center gap-2 rounded-xl border border-white/10 bg-black/65 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
        <span className="text-emerald-400">授权有效</span>
        <code>{maskKey(state.accessKey || '')}</code>
        <button className="text-rose-300 hover:text-rose-200" onClick={() => void logout()}>退出</button>
      </div>
    </>
  )
}
