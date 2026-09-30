// Sample data from the source cost database spreadsheet.
// Covers Building construction > Reinforcement work, items 100-165 (66 rows).

import type {
  CostDbMasters,
  CostItem,
  LocationDef,
  MajorCategory,
  MiddleCategory,
  OrderHistoryEntry,
  PriceHistoryEntry,
  Supplier,
  YearDef,
  YearKey,
} from "../../domain/types";
import { PREFECTURES } from "../../domain/prefectures";

const DISPLAY_TEXT: Record<string, string> = {
  "共通仮設費": "Common temporary works",
  "建築工事": "Building construction",
  "設備工事": "Building services",
  "直接仮設工事": "Temporary works",
  "土工事": "Earthwork",
  "山留工事": "Earth retaining work",
  "地業工事": "Groundwork",
  "鉄筋工事": "Reinforcement work",
  "コンクリート工事": "Concrete work",
  "型枠工事": "Formwork",
  "異形鉄筋": "Deformed reinforcing bar",
  "鉄筋加工組立": "Rebar fabrication and assembly",
  "鉄筋運搬費": "Rebar transport",
  "ガス圧接費": "Gas-pressure welding",
  "ワイヤーメッシュ": "Wire mesh",
  "ワイヤーメッシュ敷き": "Wire mesh installation",
  "フープ筋": "Hoop reinforcement",
  "高強度せん断補強筋": "High-strength shear reinforcement",
  "ガス圧接継手": "Gas-pressure welded joint",
  "圧接引張試験費": "Tensile test for welded joints",
  "機械式継手": "Mechanical splice",
  "定着板": "Anchor plate",
  "ＳＤ２９５Ａ　Ｄ１０": "SD295A D10",
  "ＳＤ２９５Ａ　Ｄ１３": "SD295A D13",
  "ＳＤ２９５Ａ　Ｄ１６": "SD295A D16",
  "ＳＤ３４５　Ｄ１９": "SD345 D19",
  "ＳＤ３４５　Ｄ２２": "SD345 D22",
  "ＳＤ３４５　Ｄ２５": "SD345 D25",
  "ＳＤ３４５　Ｄ２９": "SD345 D29",
  "ＳＤ３４５　Ｄ３２": "SD345 D32",
  "ＳＤ３４５　Ｄ３５": "SD345 D35",
  "ＳＤ３４５　Ｄ３８": "SD345 D38",
  "ＳＤ３４５　Ｄ４１": "SD345 D41",
  "ＳＤ３９０　Ｄ２５": "SD390 D25",
  "ＳＤ３９０　Ｄ２９": "SD390 D29",
  "ＳＤ３９０　Ｄ３２": "SD390 D32",
  "ＳＤ３９０　Ｄ３５": "SD390 D35",
  "ＳＤ３９０　Ｄ３８": "SD390 D38",
  "ＳＤ３９０　Ｄ４１": "SD390 D41",
  "ＳＤ４９０　Ｄ２５": "SD490 D25",
  "ＳＤ４９０　Ｄ２９": "SD490 D29",
  "ＳＤ４９０　Ｄ３２": "SD490 D32",
  "ＳＤ４９０　Ｄ３５": "SD490 D35",
  "ＳＤ４９０　Ｄ３８": "SD490 D38",
  "ＳＤ４９０　Ｄ４１": "SD490 D41",
  "ＲＣ造": "Reinforced concrete (RC)",
  "ＳＲＣ造": "Steel-reinforced concrete (SRC)",
  "壁式": "Wall-type construction",
  "スパイラル": "Spiral",
  "溶接閉鎖形": "Welded closed type",
  "１０Ｔ車　片道３０ＫＭ": "10-ton truck, one-way 30 km",
  "Ｄ２２×Ｄ２２（旧ﾊﾞｰｼﾞｮﾝの互換用です）": "D22 x D22 (compatibility with an older version)",
  "φ6-100×100": "6 mm dia., 100 x 100",
  "φ6-150×150": "6 mm dia., 150 x 150",
  "SD295A　D10　スパイラルフープ": "SD295A D10 spiral hoop",
  "SD295A　D13　スパイラルフープ": "SD295A D13 spiral hoop",
  "SD295A　D10　溶接閉鎖形フープ": "SD295A D10 welded closed hoop",
  "SD295A　D13　溶接閉鎖形フープ": "SD295A D13 welded closed hoop",
  "径10　785N/mm2　溶接閉鎖型フープ": "10 mm dia., 785 N/mm2, welded closed hoop",
  "径13　785N/mm2　溶接閉鎖型フープ": "13 mm dia., 785 N/mm2, welded closed hoop",
  "径10　685N/mm2　溶接閉鎖型フープ": "10 mm dia., 685 N/mm2, welded closed hoop",
  "径13　685N/mm2　溶接閉鎖型フープ": "13 mm dia., 685 N/mm2, welded closed hoop",
  "Ｄ２２×Ｄ２２": "D22 x D22",
  "D16 取付手間共": "D16, including installation labor",
  "D19 取付手間共": "D19, including installation labor",
  "D22 取付手間共": "D22, including installation labor",
  "D25 取付手間共": "D25, including installation labor",
  "D29 取付手間共": "D29, including installation labor",
  "D32 取付手間共": "D32, including installation labor",
  "D35 取付手間共": "D35, including installation labor",
  "D38 取付手間共": "D38, including installation labor",
  "D41 取付手間共": "D41, including installation labor",
  "ｔ": "t",
  "か所": "points",
  "組": "sets",
  "㎡": "m2",
};

function displayText(value: string): string {
  return DISPLAY_TEXT[value] ?? value;
}

// Major categories (excerpt).
export const majorCategories: MajorCategory[] = [
  { no: "I", name: displayText("共通仮設費"), enabled: false },
  { no: "II", name: displayText("建築工事"), enabled: true },
  { no: "III", name: displayText("設備工事"), enabled: false },
];

// Middle categories under Ⅱ 建築工事 (excerpt).
export const middleCategories: MiddleCategory[] = [
  { no: 1, name: displayText("直接仮設工事"), enabled: false },
  { no: 2, name: displayText("土工事"), enabled: false },
  { no: 3, name: displayText("山留工事"), enabled: false },
  { no: 4, name: displayText("地業工事"), enabled: false },
  { no: 5, name: displayText("鉄筋工事"), enabled: true },
  { no: 6, name: displayText("コンクリート工事"), enabled: false },
  { no: 7, name: displayText("型枠工事"), enabled: false },
];

// Four locations have prices; other prefectures have none.
export const locations: LocationDef[] = [
  { key: "tokyo", label: "Tokyo", pref: "Tokyo", registered: true },
  { key: "nagoya", label: "Nagoya", pref: "Aichi", registered: true },
  { key: "osaka", label: "Osaka", pref: "Osaka", registered: true },
  { key: "fukuoka", label: "Fukuoka", pref: "Fukuoka", registered: true },
];

export const prefectures: string[] = PREFECTURES;

// Rates derived from item No.105 (Tokyo) actual history.
export const years: YearDef[] = [
  { key: "current", label: "Current", factor: 104000 / 103800 },
  { key: "2025", label: "FY2025", factor: 1 },
  { key: "2024", label: "FY2024", factor: 103000 / 103800 },
  { key: "2023", label: "FY2023", factor: 102800 / 103800 },
];

/** X axis of the trend chart, oldest first. */
export const trendYears: YearKey[] = ["2023", "2024", "2025", "current"];

// priceRatio comes from item No.105 (Tokyo) order actuals.
export const suppliers: Supplier[] = [
  { name: "Supplier A", priceRatio: 103200 / 103800, shareSeed: 41 },
  { name: "Supplier B", priceRatio: 105000 / 103800, shareSeed: 23 },
  { name: "Supplier C", priceRatio: 103000 / 103800, shareSeed: 36 },
];

// Price history. Real figures from the source spreadsheet.
export const priceHistory: PriceHistoryEntry[] = [
  {
    locationKey: "tokyo",
    no: 105,
    prices: { current: 104000, "2025": 103800, "2024": 103000, "2023": 102800 },
  },
];

// Order history. Supplier names are placeholders.
export const orderHistory: OrderHistoryEntry[] = [
  {
    locationKey: "tokyo",
    no: 105,
    standard: 100000,
    orders: [
      { project: "Project A", supplier: "Supplier A", price: 103200 },
      { project: "Project B", supplier: "Supplier B", price: 105000 },
      { project: "Project C", supplier: "Supplier C", price: 103000 },
    ],
  },
];

// Line items. Every row is under Building construction > Reinforcement work.
type ItemRow = [
  no: number,
  chuName: string,
  name: string,
  note: string,
  unit: string,
  costnavi: number,
  tokyo: number,
  nagoya: number,
  osaka: number,
  fukuoka: number,
];

const ITEM_ROWS: ItemRow[] = [
  [100, "異形鉄筋", "異形鉄筋", "ＳＤ２９５Ａ　Ｄ１０", "ｔ", 105848, 104800, 102704, 102704, 99560],
  [101, "異形鉄筋", "異形鉄筋", "ＳＤ２９５Ａ　Ｄ１３", "ｔ", 103828, 102800, 100744, 100744, 97660],
  [102, "異形鉄筋", "異形鉄筋", "ＳＤ２９５Ａ　Ｄ１６", "ｔ", 101909, 100900, 98882, 98882, 95855],
  [103, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ１９", "ｔ", 104838, 103800, 101724, 101724, 98610],
  [104, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ２２", "ｔ", 104838, 103800, 101724, 101724, 98610],
  [105, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ２５", "ｔ", 104838, 103800, 101724, 101724, 98610],
  [106, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ２９", "ｔ", 105848, 104800, 102704, 102704, 99560],
  [107, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ３２", "ｔ", 105848, 104800, 102704, 102704, 99560],
  [108, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ３５", "ｔ", 108777, 107700, 105546, 105546, 102315],
  [109, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ３８", "ｔ", 109686, 108600, 106428, 106428, 103170],
  [110, "異形鉄筋", "異形鉄筋", "ＳＤ３４５　Ｄ４１", "ｔ", 110696, 109600, 107408, 107408, 104120],
  [111, "異形鉄筋", "異形鉄筋", "ＳＤ３９０　Ｄ２５", "ｔ", 107767, 106700, 104566, 104566, 101365],
  [112, "異形鉄筋", "異形鉄筋", "ＳＤ３９０　Ｄ２９", "ｔ", 108777, 107700, 105546, 105546, 102315],
  [113, "異形鉄筋", "異形鉄筋", "ＳＤ３９０　Ｄ３２", "ｔ", 108777, 107700, 105546, 105546, 102315],
  [114, "異形鉄筋", "異形鉄筋", "ＳＤ３９０　Ｄ３５", "ｔ", 111706, 110600, 108388, 108388, 105070],
  [115, "異形鉄筋", "異形鉄筋", "ＳＤ３９０　Ｄ３８", "ｔ", 112716, 111600, 109368, 109368, 106020],
  [116, "異形鉄筋", "異形鉄筋", "ＳＤ３９０　Ｄ４１", "ｔ", 113625, 112500, 110250, 110250, 106875],
  [117, "異形鉄筋", "異形鉄筋", "ＳＤ４９０　Ｄ２５", "ｔ", 121503, 120300, 117894, 117894, 114285],
  [118, "異形鉄筋", "異形鉄筋", "ＳＤ４９０　Ｄ２９", "ｔ", 122513, 121300, 118874, 118874, 115235],
  [119, "異形鉄筋", "異形鉄筋", "ＳＤ４９０　Ｄ３２", "ｔ", 122513, 121300, 118874, 118874, 115235],
  [120, "異形鉄筋", "異形鉄筋", "ＳＤ４９０　Ｄ３５", "ｔ", 125442, 124200, 121716, 121716, 117990],
  [121, "異形鉄筋", "異形鉄筋", "ＳＤ４９０　Ｄ３８", "ｔ", 126351, 125100, 122598, 122598, 118845],
  [122, "異形鉄筋", "異形鉄筋", "ＳＤ４９０　Ｄ４１", "ｔ", 127361, 126100, 123578, 123578, 119795],
  [123, "鉄筋加工組立", "鉄筋加工組立", "ＲＣ造", "ｔ", 61711, 61100, 59878, 59878, 58045],
  [124, "鉄筋加工組立", "鉄筋加工組立", "ＳＲＣ造", "ｔ", 63731, 63100, 61838, 61838, 59945],
  [125, "鉄筋加工組立", "鉄筋加工組立", "壁式", "ｔ", 79386, 78600, 77028, 77028, 74670],
  [126, "鉄筋加工組立", "鉄筋加工組立", "スパイラル", "ｔ", 26967, 26700, 26166, 26166, 25365],
  [127, "鉄筋加工組立", "鉄筋加工組立", "溶接閉鎖形", "ｔ", 26967, 26700, 26166, 26166, 25365],
  [128, "鉄筋加工組立", "鉄筋加工組立", "高強度せん断補強筋", "ｔ", 26967, 26700, 26166, 26166, 25365],
  [129, "鉄筋加工組立", "鉄筋運搬費", "１０Ｔ車　片道３０ＫＭ", "ｔ", 4464.2, 4420, 4331.6, 4331.6, 4199],
  [130, "鉄筋加工組立", "鉄筋運搬費", "スパイラル", "ｔ", 4464.2, 4420, 4331.6, 4331.6, 4199],
  [131, "鉄筋加工組立", "鉄筋運搬費", "溶接閉鎖形", "ｔ", 4464.2, 4420, 4331.6, 4331.6, 4199],
  [132, "鉄筋加工組立", "鉄筋運搬費", "高強度せん断補強筋", "ｔ", 4464.2, 4420, 4331.6, 4331.6, 4199],
  [133, "鉄筋加工組立", "ガス圧接費", "Ｄ２２×Ｄ２２（旧ﾊﾞｰｼﾞｮﾝの互換用です）", "か所", 434.3, 430, 421.4, 421.4, 408.5],
  [134, "ワイヤーメッシュ", "ワイヤーメッシュ敷き", "", "㎡", 272.7, 270, 264.6, 264.6, 256.5],
  [135, "ワイヤーメッシュ", "ワイヤーメッシュ", "φ6-100×100", "㎡", 474.7, 470, 460.6, 460.6, 446.5],
  [136, "ワイヤーメッシュ", "ワイヤーメッシュ", "φ6-150×150", "㎡", 333.3, 330, 323.4, 323.4, 313.5],
  [137, "フープ筋", "異形鉄筋", "SD295A　D10　スパイラルフープ", "ｔ", 180790, 179000, 175420, 175420, 170050],
  [138, "フープ筋", "異形鉄筋", "SD295A　D13　スパイラルフープ", "ｔ", 171498, 169800, 166404, 166404, 161310],
  [139, "フープ筋", "異形鉄筋", "SD295A　D10　溶接閉鎖形フープ", "ｔ", 176346, 174600, 171108, 171108, 165870],
  [140, "フープ筋", "異形鉄筋", "SD295A　D13　溶接閉鎖形フープ", "ｔ", 166549, 164900, 161602, 161602, 156655],
  [141, "フープ筋", "高強度せん断補強筋", "径10　785N/mm2　溶接閉鎖型フープ", "ｔ", 220483, 218300, 213934, 213934, 207385],
  [142, "フープ筋", "高強度せん断補強筋", "径13　785N/mm2　溶接閉鎖型フープ", "ｔ", 215534, 213400, 209132, 209132, 202730],
  [143, "フープ筋", "高強度せん断補強筋", "径10　685N/mm2　溶接閉鎖型フープ", "t", 210686, 208600, 204428, 204428, 198170],
  [144, "フープ筋", "高強度せん断補強筋", "径13　685N/mm2　溶接閉鎖型フープ", "t", 205737, 203700, 199626, 199626, 193515],
  [145, "ガス圧接継手", "ガス圧接費", "Ｄ２２×Ｄ２２", "か所", 686.8, 680, 666.4, 666.4, 646],
  [146, "ガス圧接継手", "圧接引張試験費", "", "組", 7958.8, 7880, 7722.4, 7722.4, 7486],
  [147, "機械式継手", "機械式継手", "D13", "か所", 1050.4, 1040, 1019.2, 1019.2, 988],
  [148, "機械式継手", "機械式継手", "D16", "か所", 1111, 1100, 1078, 1078, 1045],
  [149, "機械式継手", "機械式継手", "D19", "か所", 1272.6, 1260, 1234.8, 1234.8, 1197],
  [150, "機械式継手", "機械式継手", "D22", "か所", 1272.6, 1260, 1234.8, 1234.8, 1197],
  [151, "機械式継手", "機械式継手", "D25", "か所", 1424.1, 1410, 1381.8, 1381.8, 1339.5],
  [152, "機械式継手", "機械式継手", "D29", "か所", 1888.7, 1870, 1832.6, 1832.6, 1776.5],
  [153, "機械式継手", "機械式継手", "D32", "か所", 2343.2, 2320, 2273.6, 2273.6, 2204],
  [154, "機械式継手", "機械式継手", "D35", "か所", 3262.3, 3230, 3165.4, 3165.4, 3068.5],
  [155, "機械式継手", "機械式継手", "D38", "か所", 4343, 4300, 4214, 4214, 4085],
  [156, "機械式継手", "機械式継手", "D41", "か所", 5736.8, 5680, 5566.4, 5566.4, 5396],
  [157, "定着板", "定着板", "D16 取付手間共", "か所", 1010, 1000, 980, 980, 950],
  [158, "定着板", "定着板", "D19 取付手間共", "か所", 1050.4, 1040, 1019.2, 1019.2, 988],
  [159, "定着板", "定着板", "D22 取付手間共", "か所", 1171.6, 1160, 1136.8, 1136.8, 1102],
  [160, "定着板", "定着板", "D25 取付手間共", "か所", 1302.9, 1290, 1264.2, 1264.2, 1225.5],
  [161, "定着板", "定着板", "D29 取付手間共", "か所", 1464.5, 1450, 1421, 1421, 1377.5],
  [162, "定着板", "定着板", "D32 取付手間共", "か所", 1757.4, 1740, 1705.2, 1705.2, 1653],
  [163, "定着板", "定着板", "D35 取付手間共", "か所", 2242.2, 2220, 2175.6, 2175.6, 2109],
  [164, "定着板", "定着板", "D38 取付手間共", "か所", 2626, 2600, 2548, 2548, 2470],
  [165, "定着板", "定着板", "D41 取付手間共", "か所", 3019.9, 2990, 2930.2, 2930.2, 2840.5],
];

export const items: CostItem[] = ITEM_ROWS.map(
  ([no, chuName, name, note, unit, costnavi, tokyo, nagoya, osaka, fukuoka]) => ({
    no,
    daiNo: "II",
    chuNo: 5,
    chuName: displayText(chuName),
    name: displayText(name),
    note: displayText(note),
    unit: displayText(unit),
    costnavi,
    prices: { tokyo, nagoya, osaka, fukuoka },
  }),
);

export const masters: CostDbMasters = {
  majorCategories,
  middleCategories,
  locations,
  prefectures,
  years,
  trendYears,
  suppliers,
};
