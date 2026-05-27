import {
  getMainContractDetailList,
  getMultiLastSnapshot,
  getFuturesPlateAgg,
  MainContractItem,
  PlateItem
} from '@/api/capitalData'

// 模板所需的数据格式
export interface MorningSessionReviewItem {
  stockName: string      // 期货品种名称
  limitRate: number      // 涨跌幅
  mainFundsFlow: number  // 资金流向
  lowerFundsFlow: number // 沉淀资金
  industry: string       // 所属板块
}

// 合并后的品种数据
interface CombinedVarietyData {
  variety: string
  varietyShortName: string
  market: string
  fundsFlow: number      // 资金流向
  depositFunds: number   // 沉淀资金
  changeRate: number     // 涨幅
  plateName: string      // 板块名称
}

// 获取并处理资金数据
export async function fetchAndProcessCapitalData(): Promise<{
  inflowTop20: MorningSessionReviewItem[]
  outflowTop20: MorningSessionReviewItem[]
}> {
  // Step 1: 获取主力合约详情
  const contracts = await getMainContractDetailList()

  // Step 2: 按 market 分组，构建行情请求参数
  const marketGroups = groupContractsByMarket(contracts)

  // Step 3: 获取行情快照
  // 注意：不同市场的 varietyCode 大小写不同，需要保持原始格式
  const snapshotData = await getMultiLastSnapshot(
    marketGroups.map(group => ({
      market: group.market,
      codes: group.varieties.map(v => `${v.varietyCode}8888`)
    }))
  )

  // Step 4: 获取板块数据
  const plateData = await getFuturesPlateAgg()
  const plateMap = buildPlateMap(plateData.variety_plate_list)

  // Step 5: 合并数据
  const combinedData = combineData(contracts, snapshotData, plateMap)

  // Step 6: 排序并取前20
  const sortedByFlow = [...combinedData].sort((a, b) => b.fundsFlow - a.fundsFlow)

  // 资金流入前20（流向值最大的20个）
  const inflowTop20 = sortedByFlow
    .filter(item => item.fundsFlow > 0)
    .slice(0, 20)
    .map(toTemplateFormat)

  // 资金流出前20（流向值最小的20个，即流出最多）
  const outflowTop20 = [...combinedData]
    .sort((a, b) => a.fundsFlow - b.fundsFlow)
    .filter(item => item.fundsFlow < 0)
    .slice(0, 20)
    .map(toTemplateFormat)

  return { inflowTop20, outflowTop20 }
}

// 按 market 分组合约
function groupContractsByMarket(contracts: MainContractItem[]): {
  market: string
  varieties: MainContractItem[]
}[] {
  const marketMap = new Map<string, MainContractItem[]>()

  // 去重，每个品种只保留一个
  const varietySet = new Set<string>()
  const uniqueContracts: MainContractItem[] = []

  for (const contract of contracts) {
    const key = `${contract.market}-${contract.variety}`
    if (!varietySet.has(key)) {
      varietySet.add(key)
      uniqueContracts.push(contract)
    }
  }

  for (const contract of uniqueContracts) {
    const market = contract.market
    if (!marketMap.has(market)) {
      marketMap.set(market, [])
    }
    marketMap.get(market)!.push(contract)
  }

  return Array.from(marketMap.entries()).map(([market, varieties]) => ({
    market,
    varieties
  }))
}

// 构建板块映射表（只取 plate_level=2）
function buildPlateMap(plateList: PlateItem[]): Map<string, string> {
  const plateMap = new Map<string, string>()

  for (const item of plateList) {
    if (item.plate_level === '2') {
      // 使用 variety 作为 key，优先保留第一个匹配的板块
      const key = item.variety.toUpperCase()
      if (!plateMap.has(key)) {
        plateMap.set(key, item.plate_name)
      }
    }
  }

  return plateMap
}

// 合并主力合约、行情快照和板块数据
function combineData(
  contracts: MainContractItem[],
  snapshotData: { [key: string]: { [code: string]: { 67?: number; 68?: number; 199112?: number } } },
  plateMap: Map<string, string>
): CombinedVarietyData[] {
  const result: CombinedVarietyData[] = []
  const processedVarieties = new Set<string>()

  for (const contract of contracts) {
    const varietyKey = `${contract.market}-${contract.variety}`
    if (processedVarieties.has(varietyKey)) continue
    processedVarieties.add(varietyKey)

    // market -127 需要转换为 129 来匹配快照数据
    const market = contract.market === '-127' ? '129' : contract.market
    // 保持 varietyCode 原始大小写
    const code = `${contract.varietyCode}8888`

    // 获取行情数据
    const marketData = snapshotData[market]
    if (!marketData) continue

    const quoteData = marketData[code]
    if (!quoteData) continue

    const fundsFlow = quoteData[68] || 0      // 资金流向
    const depositFunds = quoteData[67] || 0   // 沉淀资金
    const changeRate = quoteData[199112] || 0 // 涨幅

    // 获取板块名称
    const plateName = plateMap.get(contract.variety.toUpperCase()) || '其他'

    result.push({
      variety: contract.variety,
      varietyShortName: contract.varietyShortName,
      market,
      fundsFlow,
      depositFunds,
      changeRate,
      plateName
    })
  }

  return result
}

// 转换为模板所需格式
function toTemplateFormat(item: CombinedVarietyData): MorningSessionReviewItem {
  return {
    stockName: item.varietyShortName,
    limitRate: item.changeRate,
    mainFundsFlow: item.fundsFlow,
    lowerFundsFlow: item.depositFunds,
    industry: item.plateName
  }
}
