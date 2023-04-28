import { FREQUENCY } from "cybersafepolicy-core";

export class TierUtility {
  public static t1 = 'T1';
  public static t2 = 'T2';
  public static t3 = 'T3';
  /* ************************************ Public Methods ************************************ */
  public static getTier(tier: string): TierDto {
    switch (tier) {
      case TierUtility.t1:
        return TierUtility._getTierDto(TierUtility.t1, FREQUENCY.ONE_TIME, 49900, 0);
      case TierUtility.t2:
        return TierUtility._getTierDto(TierUtility.t2, FREQUENCY.MONTHLY, 49900, 999);
      case TierUtility.t3:
        return TierUtility._getTierDto(TierUtility.t3, FREQUENCY.MONTHLY, 49900, 100);
      default:
        return {} as TierDto;
    }
  }

  private static _getTierDto(type: string, frequency: string, price: number, frequencyPrice: number): TierDto {
    const dto = {} as TierDto;
    dto.type = type;
    dto.frequency = frequency;
    dto.price = price;
    dto.frequencyPrice = frequencyPrice;
    return dto;
  }
}

export interface TierDto {
  type: string;
  frequency: string;
  price: number;
  frequencyPrice: number;
}