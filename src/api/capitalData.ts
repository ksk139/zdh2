import axios from 'axios'

// 主力合约详情接口
const MAIN_CONTRACT_URL = 'https://ftapi.10jqka.com.cn/futgwapi/api/market/v1/contract/getMainContractDetailList'

// 行情快照接口
const SNAPSHOT_URL = 'https://quota-h.10jqka.com.cn/fuyao/futures_common_hq/quote/v1/multi_last_snapshot'

// 板块数据接口
const PLATE_URL = 'https://ftapi.10jqka.com.cn/futgwapi/api/market/variety/v1/futures_plate_agg'

// 主力合约详情项
export interface MainContractItem {
  market: string
  variety: string
  varietyShortName: string
  varietyCode: string
  varietyName: string
  contractCode: string
  ifindCode: string
  unitNum: string
  dealUnit: string
  minChange: string
  marginRate: string
  contractMultiple: string | null
  placeCode: string
  marketCode: string
  startDate: string
  endDate: string
  newMarketId: string
  contractName: string
}

// 行情快照响应
export interface SnapshotResponse {
  status_code: number
  status_msg: string
  data: {
    quote_data: {
      market: string
      code: string
      data_fields: string[]
      value: number[][]
    }[]
  }
}

// 处理后的快照数据格式
export interface ProcessedSnapshotData {
  [market: string]: {
    [code: string]: {
      67?: number   // 沉淀资金
      68?: number   // 资金流向
      199112?: number // 涨幅 (处理后为标准小数，如 0.0082 代表 0.82%)
    }
  }
}

// 板块数据项
export interface PlateItem {
  variety: string
  market_id: string
  variety_name: string
  plate_level: string
  plate_name: string
}

// 获取主力合约详情列表
export async function getMainContractDetailList(): Promise<MainContractItem[]> {
  const response = await axios.get<{
    code: number
    msg: string
    data: { result: MainContractItem[] }
  }>(MAIN_CONTRACT_URL)

  if (response.data.code !== 0) {
    throw new Error(response.data.msg || '获取主力合约失败')
  }

  return response.data.data.result
}

// 获取行情快照（沉淀资金、资金流向、涨幅）
export async function getMultiLastSnapshot(
  codeList: { market: string; codes: string[] }[]
): Promise<ProcessedSnapshotData> {
  // 支持的 market 列表
  const supportedMarkets = ['65', '66', '67', '129', 'UGFF']

  // 转换 market: -127 -> 129，并过滤不支持的 market
  const convertedCodeList = codeList
    .map(item => ({
      market: item.market === '-127' ? '129' : item.market,
      codes: item.codes
    }))
    .filter(item => supportedMarkets.includes(item.market) && item.codes.length > 0)

  console.log('请求行情快照，市场分组:', convertedCodeList)

  // 按市场拆分请求，并行发送
  const requests = convertedCodeList.map(async (marketGroup) => {
    const requestBody = {
      code_list: [marketGroup],
      trade_date: -1,
      trade_class: 'post_market',
      time_period: 'day_1',
      begin_time: '-1',
      end_time: '0',
      adjust_type: 'forward',
      data_fields: [68, 67, 199112]
    }

  console.log(`市场 ${marketGroup.market} 请求参数:`, JSON.stringify(requestBody))

    const fetchResponse = await fetch(SNAPSHOT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fuyao-Auth': 'basecomponent'
      },
      body: JSON.stringify(requestBody)
    })

    const result = await fetchResponse.json() as SnapshotResponse

    if (result.status_code !== 0) {
      console.warn(`市场 ${marketGroup.market} 请求失败:`, result.status_msg)
      return null
    }

    return { market: marketGroup.market, data: result.data }
  })

  const results = await Promise.all(requests)

  // 合并所有市场的数据，并转换为 ProcessedSnapshotData 格式
  const mergedData: ProcessedSnapshotData = {}

  for (const result of results) {
    if (result && result.data && result.data.quote_data) {
      for (const quote of result.data.quote_data) {
        const { market, code, data_fields, value } = quote

        if (!mergedData[market]) {
          mergedData[market] = {}
        }

        // 根据 data_fields 顺序解析 value
        const values = value[0] || []
        const codeData: { 67?: number; 68?: number; 199112?: number } = {}

        data_fields.forEach((field, index) => {
          const fieldNum = parseInt(field)
          if (fieldNum === 67) {
            codeData[67] = values[index]  // 沉淀资金
          } else if (fieldNum === 68) {
            codeData[68] = values[index]  // 资金流向
          } else if (fieldNum === 199112) {
            // 【核心修复】将接口返回的百分比数值统一除以 100，规避下游可视化组件二次渲染放大
            codeData[199112] = values[index] !== undefined ? values[index] / 100 : undefined
          }
        })

        mergedData[market][code] = codeData
      }
    }
  }

  console.log('行情快照合并结果:', mergedData)

  return mergedData
}

// 获取板块数据
export async function getFuturesPlateAgg(): Promise<{
  exchange_list: any[]
  variety_plate_list: PlateItem[]
}> {
  const response = await axios.get<{
    code: number
    msg: string
    data: {
      exchange_list: any[]
      variety_plate_list: PlateItem[]
    }
  }>(PLATE_URL)

  if (response.data.code !== 0) {
    throw new Error(response.data.msg || '获取板块数据失败')
  }

  return response.data.data
}
