export class DashboardSosTrackingBottom {
  totalDetailOrderStatus: DashboardSosTrackingBottomLeft | undefined;
  detailtOrderStatusDtos: DashboardSosTrackingBottomRight | undefined;
}

export class DashboardSosTrackingBottomLeft {
  ordinalNumber: string | undefined;
  title: string | undefined;
  total: number | undefined;
}

export class DashboardSosTrackingBottomRight {
  customerPhone: string | undefined;
  amountCustomerClick: number | undefined;
  amountCustomerRequested: number | undefined;
  amountRequestedGarage: number | undefined;
  amountConfirmCustomer: number | undefined;
  amountCustomerCancel: number | undefined;
  amountGarageReject: number | undefined;
}

export class DashboardSosTrackingCenter {
  sosTrackingClickCallCharts: any;
  sosTrackingClickAndCustomerCharts: any;
}

export class DashboardSosTrackingLeft {
  totalClicks: number | undefined;
  clickCallGarage: number | undefined;
  clickCallSwitchboard: number | undefined;
  uniqueUserNumber: number | undefined;
  ratioClick: number | undefined;
  numberOfRescues: number | undefined;
  successRateOfCare: number | undefined;
}
