/**
 * ============================================================
 * 本地便携版 —— API 上游接口配置（唯一的配置入口）
 * ============================================================
 * 说明：
 *  - 本文件为“本地便携版”的设置源头，不再提供界面设置入口。
 *  - 如需修改生图 API 上游接口，请直接编辑下方配置后重新构建。
 *  - baseUrl / apiKey / model 等即为保存生图上游接口的“设置”。
 *
 * 提示：
 *  - 修改 apiKey 后请勿把本文件提交到公开仓库，避免密钥泄露。
 *  - 该配置在运行时始终优先于浏览器本地缓存中的旧设置。
 * ============================================================
 */
import type { AppSettings } from './types'

export const LOCAL_APP_CONFIG: AppSettings = {
  // 生图 API 上游接口地址（默认 OpenAI）
  baseUrl: 'https://api.openai.com',

  // 上游接口的 API Key（必填）
  apiKey: '',

  // Images API 使用的模型
  model: 'gpt-image-2',

  // Responses API 使用的图片模型
  responsesImageModel: 'gpt-image-2',

  // Responses API 传输模式：auto | stream | json
  responsesTransport: 'auto',

  // Responses API 图片输入模式：auto | file_id
  responsesImageInputMode: 'auto',

  // Responses 提示词改写模式：allow | compat
  responsesPromptRevisionMode: 'allow',

  // 请求超时时间（秒）
  timeout: 900,

  // 协议：images | responses
  apiProtocol: 'images',

  // 请求模式：direct（直接请求）/ local_proxy（本地代理，仅开发模式可用）
  requestMode: 'direct',
}
