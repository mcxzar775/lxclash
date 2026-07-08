import { createHash } from 'crypto'
import { hostname, userInfo } from 'os'
import { readFile, rm, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { dataDir } from '../utils/dirs'
import { addProfileItem, changeCurrentProfile } from '../config/profile'

const API_BASE = 'https://lxkj.x11.pp.ua'
const AUTH_PATH = '/api/client/subscription/resolve/'
const AUTH_PROFILE_ID = 'longxing-authorized-profile'
const AUTH_FILE = 'longxing-auth.json'

interface StoredAuth {
  accessKey: string
  subscriptionUrl: string
  verifiedAt: number
}

export interface LongXingAuthState {
  authorized: boolean
  accessKey?: string
  subscriptionUrl?: string
  deviceId: string
  message?: string
}

interface ResolveResponse {
  success?: boolean
  message?: string
  subscriptionUrl?: string
}

function authPath(): string {
  return path.join(dataDir(), AUTH_FILE)
}

export function getLongXingDeviceId(): string {
  const source = `${process.platform}|${process.arch}|${hostname()}|${userInfo().username}`
  const digest = createHash('sha256').update(source).digest('hex').slice(0, 16).toUpperCase()
  return `LX-${digest}`
}

async function readStoredAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await readFile(authPath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<StoredAuth>
    if (!parsed.accessKey || !parsed.subscriptionUrl) return null
    return {
      accessKey: String(parsed.accessKey),
      subscriptionUrl: String(parsed.subscriptionUrl),
      verifiedAt: Number(parsed.verifiedAt || 0)
    }
  } catch {
    return null
  }
}

async function writeStoredAuth(auth: StoredAuth): Promise<void> {
  await writeFile(authPath(), JSON.stringify(auth, null, 2), 'utf8')
}

async function resolveAuthorization(accessKey: string): Promise<ResolveResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${API_BASE}${AUTH_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ accessKey, deviceId: getLongXingDeviceId() }),
      signal: controller.signal
    })

    const text = await response.text()
    let data: ResolveResponse
    try {
      data = JSON.parse(text) as ResolveResponse
    } catch {
      return { success: false, message: `授权后台返回异常，HTTP ${response.status}` }
    }

    if (!response.ok || !data.success || !data.subscriptionUrl) {
      return {
        success: false,
        message: data.message || `授权验证失败，HTTP ${response.status}`
      }
    }

    return data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: message.toLowerCase().includes('abort')
        ? '授权后台连接超时'
        : `授权后台连接失败：${message}`
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function syncAuthorizedProfile(subscriptionUrl: string): Promise<void> {
  await addProfileItem({
    id: AUTH_PROFILE_ID,
    name: '龙行科技专属订阅',
    type: 'remote',
    url: subscriptionUrl,
    interval: 60,
    autoUpdate: true,
    allowFixedInterval: false,
    useProxy: false
  })
  await changeCurrentProfile(AUTH_PROFILE_ID)
}

export async function verifyLongXingAuthorization(payload: {
  accessKey?: string
}): Promise<LongXingAuthState> {
  const accessKey = String(payload?.accessKey || '').trim()
  if (!accessKey) {
    return {
      authorized: false,
      deviceId: getLongXingDeviceId(),
      message: '请输入客户授权码'
    }
  }

  const result = await resolveAuthorization(accessKey)
  if (!result.success || !result.subscriptionUrl) {
    return {
      authorized: false,
      deviceId: getLongXingDeviceId(),
      message: result.message || '授权验证失败'
    }
  }

  try {
    await syncAuthorizedProfile(result.subscriptionUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      authorized: false,
      deviceId: getLongXingDeviceId(),
      message: `授权成功，但专属订阅导入失败：${message}`
    }
  }

  await writeStoredAuth({
    accessKey,
    subscriptionUrl: result.subscriptionUrl,
    verifiedAt: Date.now()
  })

  return {
    authorized: true,
    accessKey,
    subscriptionUrl: result.subscriptionUrl,
    deviceId: getLongXingDeviceId(),
    message: result.message || '授权验证成功'
  }
}

export async function getLongXingAuthState(): Promise<LongXingAuthState> {
  const stored = await readStoredAuth()
  if (!stored) {
    return { authorized: false, deviceId: getLongXingDeviceId() }
  }

  // 每次启动重新向授权后台确认，避免到期或禁用后仍可使用。
  return await verifyLongXingAuthorization({ accessKey: stored.accessKey })
}

export async function logoutLongXingAuthorization(): Promise<LongXingAuthState> {
  if (existsSync(authPath())) {
    await rm(authPath(), { force: true })
  }
  return {
    authorized: false,
    deviceId: getLongXingDeviceId(),
    message: '已退出当前授权'
  }
}
