import { Button, Card, CardBody, Tooltip } from '@heroui/react'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import { TbDeviceIpadHorizontalBolt } from 'react-icons/tb'
import { useLocation, useNavigate } from 'react-router-dom'
import { updateTrayIconImmediate } from '@renderer/utils/ipc'
import React from 'react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useTranslation } from 'react-i18next'

interface Props {
  iconOnly?: boolean
}

const TunSwitcher: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { iconOnly } = props
  const location = useLocation()
  const navigate = useNavigate()
  const match = location.pathname.includes('/tun') || false
  const { appConfig } = useAppConfig()
  const { tunCardStatus = 'col-span-1', disableAnimations = false } = appConfig || {}
  const sysProxyEnabled = appConfig?.sysProxy?.enable ?? false
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const { tun } = controledMihomoConfig || {}
  const { enable = false } = tun || {}

  const onChange = async (nextEnable: boolean): Promise<void> => {
    updateTrayIconImmediate(sysProxyEnabled, nextEnable)
    if (nextEnable) {
      try {
        const hasPermissions = await window.electron.ipcRenderer.invoke(
          'checkMihomoCorePermissions'
        )

        if (!hasPermissions) {
          if (window.electron.process.platform === 'win32') {
            const confirmed = await window.electron.ipcRenderer.invoke('showTunPermissionDialog')
            if (confirmed) {
              try {
                const notification = new Notification(t('tun.permissions.restarting'))
                await window.electron.ipcRenderer.invoke('restartAsAdmin')
                notification.close()
                return
              } catch (error) {
                console.error('Failed to restart as admin:', error)
                await window.electron.ipcRenderer.invoke(
                  'showErrorDialog',
                  t('tun.permissions.failed'),
                  String(error)
                )
                updateTrayIconImmediate(sysProxyEnabled, false)
                return
              }
            } else {
              updateTrayIconImmediate(sysProxyEnabled, false)
              return
            }
          } else {
            try {
              await window.electron.ipcRenderer.invoke('requestTunPermissions')
            } catch (error) {
              console.warn('Permission grant failed:', error)
              await window.electron.ipcRenderer.invoke(
                'showErrorDialog',
                t('tun.permissions.failed'),
                String(error)
              )
              updateTrayIconImmediate(sysProxyEnabled, false)
              return
            }
          }
        }
      } catch (error) {
        console.warn('Permission check failed:', error)
      }

      await patchControledMihomoConfig({ tun: { enable: nextEnable }, dns: { enable: true } })
      const autoRunEnabled = await window.electron.ipcRenderer.invoke('checkAutoRun')
      if (autoRunEnabled) {
        await window.electron.ipcRenderer.invoke('enableAutoRun')
      }
    } else {
      await patchControledMihomoConfig({ tun: { enable: nextEnable } })
    }
    window.electron.ipcRenderer.send('updateFloatingWindow')
    window.electron.ipcRenderer.send('updateTrayMenu')
  }

  if (iconOnly) {
    return (
      <div className={`${tunCardStatus} flex justify-center`}>
        <Tooltip content={t('sider.cards.tun')} placement="right">
          <Button
            size="sm"
            isIconOnly
            color={match ? 'primary' : 'default'}
            variant={match ? 'solid' : 'light'}
            onPress={() => navigate('/tun')}
          >
            <TbDeviceIpadHorizontalBolt className="text-[20px]" />
          </Button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className={`${tunCardStatus} tun-card lx-quick-card-wrap`}>
      <Card
        fullWidth
        isPressable
        onPress={() => navigate('/tun')}
        className={`lx-toggle-card ${match ? 'is-active' : ''} ${enable ? 'is-enabled' : ''} ${disableAnimations ? '' : 'transition-transform-background'}`}
      >
        <CardBody className="lx-toggle-card-body">
          <div className="lx-toggle-icon">
            <TbDeviceIpadHorizontalBolt />
          </div>
          <div className="lx-toggle-text">
            <h3>{t('sider.cards.tun')}</h3>
            <p>{enable ? '已开启' : '已关闭'}</p>
          </div>
          <button
            type="button"
            className={`lx-pill-switch app-nodrag ${enable ? 'is-on' : 'is-off'}`}
            aria-pressed={enable}
            aria-label={`${t('sider.cards.tun')} ${enable ? '已开启' : '已关闭'}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              void onChange(!enable)
            }}
          >
            <span className="lx-pill-switch-label lx-pill-switch-label-off">OFF</span>
            <span className="lx-pill-switch-label lx-pill-switch-label-on">ON</span>
            <span className="lx-pill-switch-thumb" />
          </button>
        </CardBody>
      </Card>
    </div>
  )
}

export default TunSwitcher
