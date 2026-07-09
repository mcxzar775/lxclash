import { Button, Card, CardBody, Tooltip } from '@heroui/react'
import { toast } from '@renderer/components/base/toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { triggerSysProxy, updateTrayIconImmediate } from '@renderer/utils/ipc'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import { AiOutlineGlobal } from 'react-icons/ai'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  iconOnly?: boolean
}

const SysproxySwitcher: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { iconOnly } = props
  const location = useLocation()
  const navigate = useNavigate()
  const match = location.pathname.includes('/sysproxy')
  const { appConfig, patchAppConfig } = useAppConfig()
  const { controledMihomoConfig } = useControledMihomoConfig()
  const { sysProxy, sysproxyCardStatus = 'col-span-1', disableAnimations = false } = appConfig || {}
  const { tun } = controledMihomoConfig || {}
  const { enable = false } = sysProxy || {}

  const onChange = async (nextEnable: boolean): Promise<void> => {
    const previousState = !nextEnable
    const tunEnabled = tun?.enable ?? false
    updateTrayIconImmediate(nextEnable, tunEnabled)

    try {
      await patchAppConfig({ sysProxy: { enable: nextEnable } })
      await triggerSysProxy(nextEnable)
      window.electron.ipcRenderer.send('updateFloatingWindow')
      window.electron.ipcRenderer.send('updateTrayMenu')
    } catch (e) {
      await patchAppConfig({ sysProxy: { enable: previousState } })
      updateTrayIconImmediate(previousState, tunEnabled)
      toast.error(String(e))
    }
  }

  if (iconOnly) {
    return (
      <div className={`${sysproxyCardStatus} flex justify-center`}>
        <Tooltip content={t('sider.cards.systemProxy')} placement="right">
          <Button
            size="sm"
            isIconOnly
            color={match ? 'primary' : 'default'}
            variant={match ? 'solid' : 'light'}
            onPress={() => navigate('/sysproxy')}
          >
            <AiOutlineGlobal className="text-[20px]" />
          </Button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className={`${sysproxyCardStatus} sysproxy-card lx-quick-card-wrap`}>
      <Card
        fullWidth
        isPressable
        onPress={() => navigate('/sysproxy')}
        className={`lx-toggle-card ${match ? 'is-active' : ''} ${enable ? 'is-enabled' : ''} ${disableAnimations ? '' : 'transition-transform-background'}`}
      >
        <CardBody className="lx-toggle-card-body">
          <div className="lx-toggle-icon">
            <AiOutlineGlobal />
          </div>
          <div className="lx-toggle-text">
            <h3>{t('sider.cards.systemProxy')}</h3>
            <p>{enable ? '已开启' : '已关闭'}</p>
          </div>
          <button
            type="button"
            className={`lx-clean-switch app-nodrag ${enable ? 'is-on' : 'is-off'}`}
            aria-pressed={enable}
            aria-label={`${t('sider.cards.systemProxy')} ${enable ? '已开启' : '已关闭'}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              void onChange(!enable)
            }}
          >
            <span className="lx-clean-switch-track" />
            <span className="lx-clean-switch-thumb" />
            <span className="lx-clean-switch-text">{enable ? 'ON' : 'OFF'}</span>
          </button>
        </CardBody>
      </Card>
    </div>
  )
}

export default SysproxySwitcher
