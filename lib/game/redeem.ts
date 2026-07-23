// 순수 교환 산술. types에만 의존한다.

/** 잔액이 가격 이상인지 (INV-4: 잔액보다 비싼 보상은 교환 불가). */
export function canAfford(coins: number, price: number): boolean {
  return coins >= price;
}

/** 교환 차감. 잔액이 부족하면 변화 없이 그대로 반환한다 (음수 불가). */
export function applyRedeem(coins: number, price: number): number {
  if (!canAfford(coins, price)) return coins;
  return coins - price;
}
