import { useCallback, useEffect, type ComponentType, type ReactElement } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Button } from '@heroui/react'
import {
  IoHomeOutline,
  IoGitNetworkOutline,
  IoCloudDownloadOutline,
  IoSwapHorizontalOutline,
  IoListOutline,
  IoTerminalOutline,
  IoSettingsOutline,
  IoShieldCheckmarkOutline,
  IoServerOutline,
  IoGlobeOutline,
  IoSpeedometerOutline,
  IoLayersOutline,
  IoExtensionPuzzleOutline,
  IoPulseOutline,
  IoChevronForward,
  IoSparklesOutline
} from 'react-icons/io5'
import routes from '@renderer/routes'
import OutboundModeSwitcher from '@renderer/components/sider/outbound-mode-switcher'
import SysproxySwitcher from '@renderer/components/sider/sysproxy-switcher'
import TunSwitcher from '@renderer/components/sider/tun-switcher'
import ProxyCard from '@renderer/components/sider/proxy-card'
import ProfileCard from '@renderer/components/sider/profile-card'
import UpdaterButton from '@renderer/components/updater/updater-button'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useTrafficLogger } from '@renderer/hooks/use-traffic-logger'
import { applyTheme, setNativeTheme, setTitleBarOverlay } from '@renderer/utils/ipc'
import { platform } from '@renderer/utils/init'
import { DEFAULT_ENABLE_TRAFFIC_LOGGER } from '../../shared/appConfig'
import bgVideo from './assets/longxing-bg.mp4'

interface NavigationItem {
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
}

const primaryNavigation: NavigationItem[] = [
  { label: '控制中心', path: '/network', icon: IoHomeOutline },
  { label: '节点', path: '/proxies', icon: IoGitNetworkOutline },
  { label: '订阅', path: '/profiles', icon: IoCloudDownloadOutline },
  { label: '连接', path: '/connections', icon: IoSwapHorizontalOutline },
  { label: '规则', path: '/rules', icon: IoListOutline },
  { label: '日志', path: '/logs', icon: IoTerminalOutline },
  { label: '设置', path: '/settings', icon: IoSettingsOutline }
]

const advancedNavigation: NavigationItem[] = [
  { label: '系统代理', path: '/sysproxy', icon: IoShieldCheckmarkOutline },
  { label: 'TUN 模式', path: '/tun', icon: IoServerOutline },
  { label: 'DNS', path: '/dns', icon: IoGlobeOutline },
  { label: '嗅探', path: '/sniffer', icon: IoSpeedometerOutline },
  { label: '覆写', path: '/override', icon: IoLayersOutline },
  { label: '外部资源', path: '/resources', icon: IoExtensionPuzzleOutline },
  { label: 'Sub-Store', path: '/substore', icon: IoCloudDownloadOutline },
  { label: '网络拓扑', path: '/network', icon: IoGitNetworkOutline },
  { label: '流量统计', path: '/traffic', icon: IoPulseOutline },
  { label: '内核管理', path: '/mihomo', icon: IoServerOutline }
]

const pathTitles: Record<string, string> = {
  '/proxies': '节点控制中心',
  '/profiles': '订阅管理',
  '/connections': '实时连接',
  '/rules': '规则管理',
  '/logs': '运行日志',
  '/settings': '系统设置',
  '/sysproxy': '系统代理',
  '/tun': 'TUN 虚拟网卡',
  '/dns': 'DNS 配置',
  '/sniffer': '流量嗅探',
  '/override': '配置覆写',
  '/resources': '外部资源',
  '/substore': 'Sub-Store',
  '/network': '网络拓扑',
  '/traffic': '流量统计',
  '/mihomo': 'Mihomo 内核'
}

const App: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const page = useRoutes(routes)
  const { appConfig } = useAppConfig()
  const { setTheme, systemTheme } = useTheme()
  const {
    enableTrafficLogger = DEFAULT_ENABLE_TRAFFIC_LOGGER,
    appTheme = 'dark',
    customTheme,
    useWindowFrame = false
  } = appConfig || {}

  useTrafficLogger(enableTrafficLogger)

  const setTitlebar = useCallback((): void => {
    if (!useWindowFrame && platform !== 'darwin') {
      try {
        setTitleBarOverlay({
          height: 52,
          color: '#07111f',
          symbolColor: '#e8f4ff'
        })
      } catch {
        // Ignore titlebar overlay failures.
      }
    }
  }, [useWindowFrame])

  useEffect(() => {
    setNativeTheme(appTheme)
    setTheme(appTheme)
    setTitlebar()
  }, [appTheme, systemTheme, setTheme, setTitlebar])

  useEffect(() => {
    applyTheme(customTheme || 'default.css').then(setTitlebar).catch(() => undefined)
  }, [customTheme, setTitlebar])

  const isActive = (path: string): boolean => {
    if (path === '/proxies') return location.pathname === '/' || location.pathname === '/proxies'
    return location.pathname.startsWith(path)
  }

  const NavItem = ({ item }: { item: NavigationItem }): ReactElement => {
    const Icon = item.icon
    const active = isActive(item.path)
    return (
      <button
        type="button"
        className={`lx-nav-item app-nodrag ${active ? 'is-active' : ''}`}
        onClick={() => navigate(item.path)}
      >
        <Icon className="lx-nav-icon" />
        <span>{item.label}</span>
        {active && <IoChevronForward className="lx-nav-arrow" />}
      </button>
    )
  }

  return (
    <div className="lx-app-shell">
      <video className="lx-video-background" autoPlay muted loop playsInline preload="auto">
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="lx-video-overlay" />
      <div className="lx-ambient lx-ambient-one" />
      <div className="lx-ambient lx-ambient-two" />

      <aside className="lx-sidebar">
        <div className={`lx-brand app-drag ${platform === 'darwin' && !useWindowFrame ? 'lx-brand-mac' : ''}`}>
          <div className="lx-brand-mark">龍</div>
          <div>
            <div className="lx-brand-name">龙行科技</div>
            <div className="lx-brand-subtitle">LONGXING CONTROL CENTER</div>
          </div>
        </div>

        <div className="lx-side-scroll no-scrollbar">
          <div className="lx-section-label">主功能</div>
          <nav className="lx-nav-group">
            {primaryNavigation.map((item) => <NavItem item={item} key={`${item.label}-${item.path}`} />)}
          </nav>

          <div className="lx-section-label lx-section-label-spaced">高级功能</div>
          <nav className="lx-nav-group">
            {advancedNavigation.map((item) => <NavItem item={item} key={item.path} />)}
          </nav>
        </div>

        <div className="lx-sidebar-footer">
          <div className="lx-core-badge">
            <span className="lx-core-dot" />
            <div>
              <strong>Mihomo Core</strong>
              <small>服务已载入</small>
            </div>
          </div>
          <div className="lx-version">龙行科技 v2.3 · Full Engine</div>
        </div>
      </aside>

      <main className="lx-main">
        <header className="lx-topbar app-drag">
          <div>
            <div className="lx-page-kicker"><IoSparklesOutline /> LONGXING NETWORK ENGINE</div>
            <h1>{pathTitles[location.pathname] || '龙行科技'}</h1>
          </div>
          <div className="lx-top-actions app-nodrag">
            <div className="lx-mode-control"><OutboundModeSwitcher /></div>
            <UpdaterButton />
            <Button
              size="sm"
              isIconOnly
              variant="flat"
              className="lx-settings-button"
              onPress={() => navigate('/settings')}
            >
              <IoSettingsOutline className="text-xl" />
            </Button>
          </div>
        </header>

        <section className="lx-command-strip app-nodrag">
          <div className="lx-command-card"><SysproxySwitcher /></div>
          <div className="lx-command-card"><TunSwitcher /></div>
          <div className="lx-command-card lx-command-wide"><ProfileCard /></div>
          <div className="lx-command-card lx-command-wide"><ProxyCard /></div>
        </section>

        <section className="lx-page-stage">
          <div className="lx-page-glass">{page}</div>
        </section>
      </main>
    </div>
  )
}

export default App
