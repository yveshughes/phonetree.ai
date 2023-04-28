export interface FetchOrderCriteriaDto {
    start: Date;
    end: Date;
    vehicleId: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    plate: string;
    excludeParking: boolean;
    name: string;
}