import axios from 'axios'

// 主力合约详情接口
const MAIN_CONTRACT_URL =
  'https://ftapi.10jqka.com.cn/futgwapi/api/market/v1/contract/getMainContractDetailList'

// 行情快照接口
const SNAPSHOT_URL =
  'https://quota-h.10jqka.com.cn/fuyao/futures_common_hq/quote/v1/multi_last_snapshot'

// 板块数据接口
const PLATE_URL =
  'https://ftapi.10jqka.com.cn/futgwapi/api/market/variety/v1/futures_plate_agg'

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
      data_fields: (string | number)[]
      value: number[][]
    }[]
  }
}

// 处理后的快照数据格式
export interface ProcessedSnapshotData {
  [market: string]: {
    [code: string]: {
      67?: number // 沉淀资金
      68?: number // 资金流向
      199112?: number // 涨幅
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
export async function getMainContractDetailList(): Promise<
  MainContractItem[]
> {
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
  // 暂时移除 129（中金所）
  // 因为同花顺接口当前会报：
  // 请求行情错误
  const supportedMarkets = ['65', '66', '67', 'UGFF']

  // 转换 market: -127 -> 129
  const convertedCodeList = codeList
    .map(item => ({
      market: item.market === '-127' ? '129' : item.market,
      codes: item.codes
    }))
    .filter(
      item =>
        supportedMarkets.includes(item.market) &&
        item.codes &&
        item.codes.length > 0
    )

  console.log('请求行情快照，市场分组:', convertedCodeList)

  // 按市场拆分请求
  const requests = convertedCodeList.map(async marketGroup => {
    const requestBody = {
      code_list: [marketGroup],
      trade_date: -1,

      // post_market 很多场景会失效
      // 改成 market 更稳定
      trade_class: 'market',

      time_period: 'day_1',
      begin_time: '-1',
      end_time: '0',
      adjust_type: 'forward',

      // 68:资金流向
      // 67:沉淀资金
      // 199112:涨跌幅
      data_fields: [68, 67, 199112]
    }

    console.log(
      `市场 ${marketGroup.market} 请求参数:`,
      JSON.stringify(requestBody)
    )

    try {
      const fetchResponse = await fetch(SNAPSHOT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fuyao-Auth': 'basecomponent'
        },
        body: JSON.stringify(requestBody)
      })

      const result =
        (await fetchResponse.json()) as SnapshotResponse

      console.log(
        `市场 ${marketGroup.market} 真实行情返回:`,
        JSON.stringify(result, null, 2)
      )

      if (result.status_code !== 0) {
        console.warn(
          `市场 ${marketGroup.market} 请求失败:`,
          result.status_msg
        )
        return null
      }

      return {
        market: marketGroup.market,
        data: result.data
      }
    } catch (error) {
      console.error(
        `市场 ${marketGroup.market} 请求异常:`,
        error
      )
      return null
    }
  })

  const results = await Promise.all(requests)

  // 合并数据
  const mergedData: ProcessedSnapshotData = {}

  for (const result of results) {
    if (
      result &&
      result.data &&
      result.data.quote_data
    ) {
      for (const quote of result.data.quote_data) {
        const {
          market,
          code,
          data_fields,
          value
        } = quote

        if (!mergedData[market]) {
          mergedData[market] = {}
        }

        // 防止 value 为空
        const values =
          Array.isArray(value) &&
          value.length > 0 &&
          Array.isArray(value[0])
            ? value[0]
            : []

        const codeData: {
          67?: number
          68?: number
          199112?: number
        } = {}

        data_fields.forEach((field, index) => {
          const fieldNum = Number(field)

          // 沉淀资金
          if (fieldNum === 67) {
            codeData[67] = values[index]
          }

          // 资金流向
          else if (fieldNum === 68) {
            codeData[68] = values[index]
          }

          // 涨跌幅
          else if (fieldNum === 199112) {
            let percentValue = values[index]

            // 防止 undefined/null
            if (
              percentValue === undefined ||
              percentValue === null ||
              isNaN(percentValue)
            ) {
              percentValue = 0
            }

            // 修复部分品种涨幅放大100倍问题
            // 正常期货日涨幅几乎不可能超过20%
            if (Math.abs(percentValue) > 20) {
              percentValue = percentValue / 100
            }

            // 极端异常值保护
            if (Math.abs(percentValue) > 1000) {
              percentValue = 0
            }

            codeData[199112] = Number(
              percentValue.toFixed(2)
            )
          }
        })

        mergedData[market][code] = codeData
      }
    }
  }

  console.log(
    '行情快照合并结果:',
    JSON.stringify(mergedData, null, 2)
  )

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
    throw new Error(
      response.data.msg || '获取板块数据失败'
    )
  }

  return response.data.data
}
