import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

type PageResponse<T> = {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
};

function jsonResponse<T>(body: T, status = 200): HttpResponse<T> {
  return new HttpResponse<T>({ status, body });
}

function isUrlMatch(url: string, needle: string) {
  return url.includes(needle);
}

function extractTrailingId(url: string): number | null {
  const clean = url.split('?')[0];
  const m = clean.match(/\/(\d+)(\/)?$/);
  return m ? Number(m[1]) : null;
}

@Injectable({ providedIn: 'root' })
export class MockApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.MOCK_API) {
      return next.handle(req);
    }

    const url = req.url ?? '';
    const method = (req.method ?? 'GET').toUpperCase();

    // ---- Auth / token ----
    if (method === 'POST' && (isUrlMatch(url, '/oauth/token') || isUrlMatch(url, '/auth/login'))) {
      return of(
        jsonResponse({
          token_type: 'Bearer',
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
        }),
      ).pipe(delay(250));
    }

    // ---- "me" / userinfo (used by AuthoritiesResolverService) ----
    if (method === 'GET' && (isUrlMatch(url, '/auth/me') || isUrlMatch(url, '/auth/userinfo') || isUrlMatch(url, '/me'))) {
      return of(
        jsonResponse({
          userAuthentication: {
            principal: {
              id: 1,
              username: 'mock.user',
              fullName: 'Mock User',
              mustChangePassword: false,
              roles: [
                {
                  code: 'MOCK_ADMIN',
                  name: 'Mock Admin',
                  menus: [],
                },
              ],
              voAuthentication: '',
            },
          },
        }),
      ).pipe(delay(200));
    }

    if (method === 'POST' && isUrlMatch(url, '/auth/refresh-token')) {
      return of(
        jsonResponse({
          token_type: 'Bearer',
          access_token: 'mock-access-token-refreshed',
          refresh_token: 'mock-refresh-token-refreshed',
          expires_in: 3600,
        }),
      ).pipe(delay(250));
    }

    // ---- Common lookup: languages ----
    if (method === 'GET' && isUrlMatch(url, '/api/v1/mdm/language')) {
      return of(
        jsonResponse<PageResponse<any>>({
          content: [{ id: 1, code: 'vi', name: 'Tiếng Việt', status: 'APPROVED' }],
          totalElements: 1,
          totalPages: 1,
          pageNumber: 1,
          pageSize: 10,
        }),
      ).pipe(delay(200));
    }

    // ---- Dashboard (project-information): overview ----
    if (method === 'GET' && isUrlMatch(url, '/api/v1/dashboard/overall/cards')) {
      return of(
        jsonResponse([
          { title: 'Dự án', amount: 82, unitOfMeasure: '' },
          { title: 'Tổng mức đầu tư', amount: 5678, unitOfMeasure: 'tỷ đồng' },
          { title: 'Đã giải ngân', amount: 567, unitOfMeasure: 'tỷ đồng' },
          { title: 'Tổng doanh thu', amount: 82, unitOfMeasure: 'tỷ đồng' },
          { title: 'Tổng chi phí', amount: 82, unitOfMeasure: 'tỷ đồng' },
        ]),
      ).pipe(delay(200));
    }

    if (method === 'GET' && isUrlMatch(url, '/api/v1/dashboard/overall/doughnuts')) {
      // UI code treats response as an object keyed by title -> chart data
      return of(
        jsonResponse({
          'Doanh thu': {
            labels: ['Đạt tiến độ', 'Chậm tiến độ', 'Vượt tiến độ'],
            datasets: [{ data: [27.8, 27.8, 44.4], backgroundColor: ['#2e7d32', '#c62828', '#f9a825'] }],
          },
          'Chi phí': {
            labels: ['Đạt tiến độ', 'Chậm tiến độ', 'Vượt tiến độ'],
            datasets: [{ data: [27.8, 27.8, 44.4], backgroundColor: ['#2e7d32', '#c62828', '#f9a825'] }],
          },
          'Giải ngân': {
            labels: ['Đạt tiến độ', 'Chậm tiến độ', 'Vượt tiến độ'],
            datasets: [{ data: [27.8, 27.8, 44.4], backgroundColor: ['#2e7d32', '#c62828', '#f9a825'] }],
          },
        }),
      ).pipe(delay(200));
    }

    if (method === 'GET' && isUrlMatch(url, '/api/v1/dashboard/overall/chart')) {
      return of(
        jsonResponse({
          labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          datasets: [
            {
              type: 'bar',
              label: 'Doanh thu thực tế',
              data: [62, 50, 45, 95, 62, 48, 30, 52, 36, 12, 30, 31],
              backgroundColor: '#2e7d32', // xanh lá tươi
            },
            {
              type: 'bar',
              label: 'Chi phí thực tế',
              data: [10, 13, 74, 45, 19, 36, 32, 46, 72, 54, 37, 56],
              backgroundColor: '#f57c00', // cam
            },
            {
              type: 'line',
              label: 'Giải ngân thực tế',
              data: [83, 86, 78, 81, 49, 40, 44, 68, 22, 12, 60, 56],
              borderColor: '#d32f2f', // đỏ
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              fill: false,
              tension: 0.35,
            },
            {
              type: 'line',
              label: 'Doanh thu kế hoạch',
              data: [58, 55, 52, 90, 65, 55, 38, 60, 40, 20, 35, 36],
              borderColor: '#f9a825', // vàng nhạt
              backgroundColor: 'rgba(249, 168, 37, 0.08)',
              fill: false,
              borderDash: [6, 4],
              tension: 0.35,
            },
            {
              type: 'line',
              label: 'Chi phí kế hoạch',
              data: [12, 18, 70, 42, 22, 34, 35, 44, 68, 50, 40, 52],
              borderColor: '#66bb6a', // xanh lá nhạt / mint
              backgroundColor: 'rgba(102, 187, 106, 0.08)',
              fill: false,
              borderDash: [6, 4],
              tension: 0.35,
            },
            {
              type: 'line',
              label: 'Giải ngân kế hoạch',
              data: [78, 82, 80, 79, 55, 45, 48, 62, 28, 18, 58, 54],
              borderColor: '#ec407a', // hồng
              backgroundColor: 'rgba(236, 64, 122, 0.08)',
              fill: false,
              borderDash: [6, 4],
              tension: 0.35,
            },
          ],
        }),
      ).pipe(delay(250));
    }

    if (
      method === 'GET' &&
      (isUrlMatch(url, '/api/v1/dashboard/overall/ranking-table') || isUrlMatch(url, '/dashboard/overall/ranking-table'))
    ) {
      return of(
        jsonResponse([
          {
            title: 'Doanh thu (theo quý) tốt',
            dataTables: [
              { projectName: 'Dự án A', amountActual: 8200000000 },
              { projectName: 'Dự án B', amountActual: 6400000000 },
              { projectName: 'Dự án C', amountActual: 5100000000 },
              { projectName: 'Dự án D', amountActual: 4200000000 },
              { projectName: 'Dự án E', amountActual: 3500000000 },
            ],
          },
          {
            title: 'Doanh thu (theo quý) chưa tốt',
            dataTables: [
              { projectName: 'Dự án F', amountActual: 1200000000 },
              { projectName: 'Dự án G', amountActual: 980000000 },
              { projectName: 'Dự án H', amountActual: 760000000 },
              { projectName: 'Dự án I', amountActual: 540000000 },
              { projectName: 'Dự án J', amountActual: 320000000 },
            ],
          },
          {
            title: 'Chi phí (theo quý) tốt',
            dataTables: [
              { projectName: 'Dự án A', amountActual: 2100000000 },
              { projectName: 'Dự án C', amountActual: 1900000000 },
              { projectName: 'Dự án D', amountActual: 1700000000 },
              { projectName: 'Dự án E', amountActual: 1500000000 },
              { projectName: 'Dự án B', amountActual: 1400000000 },
            ],
          },
          {
            title: 'Chi phí (theo quý) chưa tốt',
            dataTables: [
              { projectName: 'Dự án F', amountActual: 3800000000 },
              { projectName: 'Dự án G', amountActual: 3500000000 },
              { projectName: 'Dự án H', amountActual: 3200000000 },
              { projectName: 'Dự án I', amountActual: 2900000000 },
              { projectName: 'Dự án J', amountActual: 2600000000 },
            ],
          },
          {
            title: 'Giải ngân tốt',
            dataTables: [
              { projectName: 'Dự án B', amountActual: 4800000000 },
              { projectName: 'Dự án A', amountActual: 4500000000 },
              { projectName: 'Dự án D', amountActual: 4200000000 },
              { projectName: 'Dự án C', amountActual: 3900000000 },
              { projectName: 'Dự án E', amountActual: 3600000000 },
            ],
          },
        ]),
      ).pipe(delay(200));
    }

    if (method === 'GET' && isUrlMatch(url, '/api/v1/dashboard/dashboard-tab-config/chart/')) {
      // /api/v1/dashboard/dashboard-tab-config/chart/:tabId
      const tabId = extractTrailingId(url) ?? 0;

      const labels = ['T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
      const seriesByTab: Record<
        number,
        {
          plan: number[];
          actual: number[];
          labelPlan: string;
          labelActual: string;
        }
      > = {
        1: {
          labelActual: 'Hoàn vốn thực tế (%)',
          labelPlan: 'Hoàn vốn kế hoạch (%)',
          plan: [62, 64, 66, 67, 68, 70],
          actual: [58, 60, 63, 64, 66, 69],
        },
        2: {
          labelActual: 'Doanh thu thực tế (tỷ)',
          labelPlan: 'Doanh thu kế hoạch (tỷ)',
          plan: [6.5, 6.8, 7.1, 7.4, 7.6, 7.9],
          actual: [6.2, 6.6, 6.9, 7.3, 7.1, 7.7],
        },
        3: {
          labelActual: 'Hoàn vốn theo dự án (tỷ)',
          labelPlan: 'Mục tiêu hoàn vốn (tỷ)',
          plan: [3.2, 3.4, 3.6, 3.8, 4.0, 4.2],
          actual: [2.8, 3.1, 3.3, 3.7, 3.6, 4.0],
        },
        4: {
          labelActual: 'Chi phí thực tế (tỷ)',
          labelPlan: 'Chi phí kế hoạch (tỷ)',
          plan: [3.4, 3.3, 3.6, 3.5, 3.7, 3.6],
          actual: [3.6, 3.5, 3.9, 4.1, 4.0, 3.8],
        },
        5: {
          labelActual: 'Dòng tiền lũy kế thực tế (tỷ)',
          labelPlan: 'Dòng tiền lũy kế kế hoạch (tỷ)',
          plan: [1.2, 2.6, 3.9, 5.4, 6.8, 8.0],
          actual: [1.0, 2.2, 3.6, 4.9, 6.1, 7.5],
        },
        6: {
          labelActual: 'Năng suất thực tế (bill/h/người)',
          labelPlan: 'Năng suất kế hoạch (bill/h/người)',
          plan: [92, 93, 92, 92, 93, 96],
          actual: [95, 92, 90, 90, 92, 94],
        },
        7: {
          labelActual: 'Sản lượng thực tế (bưu phẩm)',
          labelPlan: 'Sản lượng kế hoạch (bưu phẩm)',
          plan: [1200, 1350, 1500, 1650, 1700, 1800],
          actual: [1100, 1280, 1420, 1600, 1580, 1750],
        },
      };

      const series = seriesByTab[tabId] ?? {
        labelActual: 'Thực tế',
        labelPlan: 'Kế hoạch',
        plan: [70, 72, 68, 65, 66, 70],
        actual: [80, 75, 62, 52, 60, 82],
      };
      return of(
        jsonResponse({
          labels,
          datasets: [
            {
              label: series.labelActual,
              data: series.actual,
              borderColor: '#2e7d32',
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              fill: false,
              tension: 0.35,
            },
            {
              label: series.labelPlan,
              data: series.plan,
              borderColor: '#c62828',
              backgroundColor: 'rgba(198, 40, 40, 0.08)',
              fill: false,
              borderDash: [6, 4],
              tension: 0.35,
            },
          ],
        }),
      ).pipe(delay(250));
    }

    if (method === 'GET' && isUrlMatch(url, '/api/v1/dashboard/dashboard-tab-config/table/')) {
      // /api/v1/dashboard/dashboard-tab-config/table/:tabId
      const tabId = extractTrailingId(url) ?? 0;
      const rowsByTab: Record<number, any[]> = {
        1: [
          { index: 1, projectName: 'Dự án A', amountPlanned: 3_200_000_000, amountActual: 2_800_000_000, amountAccumulated: 12_500_000_000 },
          { index: 2, projectName: 'Dự án B', amountPlanned: 2_700_000_000, amountActual: 2_550_000_000, amountAccumulated: 10_900_000_000 },
          { index: 3, projectName: 'Dự án C', amountPlanned: 2_100_000_000, amountActual: 1_950_000_000, amountAccumulated: 8_400_000_000 },
        ],
        2: [
          { index: 1, projectName: 'Dự án A', amountPlanned: 6_500_000_000, amountActual: 6_200_000_000, amountAccumulated: 28_900_000_000 },
          { index: 2, projectName: 'Dự án B', amountPlanned: 5_800_000_000, amountActual: 5_600_000_000, amountAccumulated: 24_300_000_000 },
          { index: 3, projectName: 'Dự án C', amountPlanned: 5_200_000_000, amountActual: 4_900_000_000, amountAccumulated: 20_700_000_000 },
        ],
        3: [
          { index: 1, projectName: 'Dự án A', amountPlanned: 3_800_000_000, amountActual: 3_600_000_000, amountAccumulated: 15_200_000_000 },
          { index: 2, projectName: 'Dự án B', amountPlanned: 3_100_000_000, amountActual: 2_900_000_000, amountAccumulated: 12_800_000_000 },
          { index: 3, projectName: 'Dự án C', amountPlanned: 2_600_000_000, amountActual: 2_450_000_000, amountAccumulated: 10_100_000_000 },
        ],
        4: [
          { index: 1, projectName: 'Dự án A', amountPlanned: 3_400_000_000, amountActual: 3_600_000_000, amountAccumulated: 17_800_000_000 },
          { index: 2, projectName: 'Dự án B', amountPlanned: 3_300_000_000, amountActual: 3_500_000_000, amountAccumulated: 16_900_000_000 },
          { index: 3, projectName: 'Dự án C', amountPlanned: 3_600_000_000, amountActual: 3_900_000_000, amountAccumulated: 18_500_000_000 },
        ],
        5: [
          { index: 1, projectName: 'Dự án A', amountPlanned: 1_200_000_000, amountActual: 1_000_000_000, amountAccumulated: 7_500_000_000 },
          { index: 2, projectName: 'Dự án B', amountPlanned: 1_400_000_000, amountActual: 1_200_000_000, amountAccumulated: 6_900_000_000 },
          { index: 3, projectName: 'Dự án C', amountPlanned: 1_300_000_000, amountActual: 1_150_000_000, amountAccumulated: 6_100_000_000 },
        ],
        6: [
          { index: 1, projectName: 'Khối Nghiệp vụ', amountPlanned: 92, amountActual: 95, amountAccumulated: 94 },
          { index: 2, projectName: 'Khối Kỹ thuật', amountPlanned: 90, amountActual: 92, amountAccumulated: 91 },
          { index: 3, projectName: 'Khối Văn phòng', amountPlanned: 88, amountActual: 90, amountAccumulated: 89 },
        ],
        7: [
          { index: 1, projectName: 'Đơn vị A', amountPlanned: 1200, amountActual: 1100, amountAccumulated: 7100 },
          { index: 2, projectName: 'Đơn vị B', amountPlanned: 1350, amountActual: 1280, amountAccumulated: 7680 },
          { index: 3, projectName: 'Đơn vị C', amountPlanned: 1500, amountActual: 1420, amountAccumulated: 8040 },
        ],
      };

      const content = rowsByTab[tabId] ?? [
        {
          index: 1,
          projectName: 'Tiềm lực, trình độ khoa học, công nghệ và đổi mới sáng tạo',
          amountPlanned: 5_000_000_000,
          amountActual: 5_000_000_000,
          amountAccumulated: 5_000_000_000,
        },
        {
          index: 2,
          projectName: 'Tiềm lực, trình độ khoa học, công nghệ và đổi mới sáng tạo',
          amountPlanned: 5_000_000_000,
          amountActual: 5_000_000_000,
          amountAccumulated: 5_000_000_000,
        },
        {
          index: 3,
          projectName: 'Tiềm lực, trình độ khoa học, công nghệ và đổi mới sáng tạo',
          amountPlanned: 5_000_000_000,
          amountActual: 5_000_000_000,
          amountAccumulated: 5_000_000_000,
        },
      ];
      return of(
        jsonResponse({
          content,
          page: {
            size: 10,
            number: 0,
            totalElements: content.length,
          },
        }),
      ).pipe(delay(250));
    }

    if (method === 'GET' && isUrlMatch(url, '/api/v1/dashboard/dashboard-tab-config')) {
      return of(
        jsonResponse<PageResponse<any>>({
          content: [
            { id: 1, code: 'TAB_1', name: 'Hoàn vốn dự án theo thời gian', status: 'APPROVED' },
            { id: 2, code: 'TAB_2', name: 'Doanh thu thực tế và kế hoạch theo tháng', status: 'APPROVED' },
            { id: 3, code: 'TAB_3', name: 'Biểu đồ hoàn vốn theo dự án tại thời điểm', status: 'APPROVED' },
            { id: 4, code: 'TAB_4', name: 'Biểu đồ chi phí thực tế và kế hoạch theo tháng', status: 'APPROVED' },
            { id: 5, code: 'TAB_5', name: 'Biểu đồ dòng tiền lũy kế thực tế và kế hoạch theo tháng', status: 'APPROVED' },
            { id: 6, code: 'TAB_6', name: 'Năng suất bill/h/người', status: 'APPROVED' },
            { id: 7, code: 'TAB_7', name: 'Sản lượng (Bưu phẩm)', status: 'APPROVED' },
          ],
          totalElements: 7,
          totalPages: 1,
          pageNumber: 1,
          pageSize: 10,
        }),
      ).pipe(delay(200));
    }

    // ---- Generic detail endpoints (GET .../:id) ----
    if (method === 'GET' && isUrlMatch(url, '/api/v1/')) {
      const id = extractTrailingId(url);
      if (id != null) {
        // return a minimal object that forms can bind to
        return of(
          jsonResponse({
            id,
            code: `MOCK-${id}`,
            name: `Mock item ${id}`,
            status: 'APPROVED',
          }),
        ).pipe(delay(150));
      }
    }

    // ---- Generic "page" response for combobox/search APIs ----
    // Many screens call ApiService.get(modulePath, params) and expect { content: [] }.
    // If backend isn't available, we return an empty page (or a small demo set for known patterns).
    if (method === 'GET' && (isUrlMatch(url, environment.PATH_API_V1) || isUrlMatch(url, '/api/'))) {
      const demoItems = this.getDemoContentForUrl(url);
      const body: PageResponse<any> = {
        content: demoItems,
        totalElements: demoItems.length,
        totalPages: 1,
        pageNumber: 1,
        pageSize: demoItems.length || 10,
      };

      return of(jsonResponse(body)).pipe(delay(200));
    }

    // ---- Generic create/update actions ----
    if (method === 'POST' && isUrlMatch(url, '/api/v1/')) {
      return of(jsonResponse({ success: true }, 200)).pipe(delay(200));
    }

    // ---- Dashboard (project-information) ----
    if (method === 'GET' && isUrlMatch(url, '/sos-tracking/get-information-chart')) {
      return of(
        jsonResponse({
          sosTrackingClickCallCharts: {
            labels: ['01', '02', '03', '04', '05'],
            datasets: [
              { label: 'Click', data: [10, 22, 15, 30, 18], backgroundColor: '#1976d2' },
              { label: 'Call', data: [3, 6, 4, 8, 5], backgroundColor: '#9c27b0' },
            ],
          },
          sosTrackingClickAndCustomerCharts: {
            labels: ['01', '02', '03', '04', '05'],
            datasets: [
              { type: 'bar', label: 'Click', data: [10, 22, 15, 30, 18], backgroundColor: '#1976d2' },
              { type: 'line', label: 'Customer', data: [2, 5, 3, 7, 4], borderColor: '#ff9800' },
            ],
          },
        }),
      ).pipe(delay(250));
    }

    if (method === 'GET' && isUrlMatch(url, '/sos-tracking/number-click')) {
      return of(
        jsonResponse({
          totalClick: 120,
          totalCall: 35,
          totalCustomer: 18,
        }),
      ).pipe(delay(200));
    }

    if (method === 'GET' && isUrlMatch(url, '/sos-tracking/order-status-search')) {
      return of(
        jsonResponse({
          totalDetailOrderStatus: [
            { ordinalNumber: 1, title: 'Đã tiếp nhận', total: 12 },
            { ordinalNumber: 2, title: 'Đang xử lý', total: 7 },
            { ordinalNumber: 3, title: 'Hoàn thành', total: 5 },
          ],
          detailtOrderStatusDtos: [
            {
              customerPhone: '0901xxxx01',
              amountCustomerClick: 5,
              amountCustomerRequested: 2,
              amountRequestedGarage: 2,
              amountConfirmCustomer: 1,
              amountCustomerCancel: 0,
              amountGarageReject: 0,
            },
            {
              customerPhone: '0901xxxx02',
              amountCustomerClick: 3,
              amountCustomerRequested: 1,
              amountRequestedGarage: 1,
              amountConfirmCustomer: 1,
              amountCustomerCancel: 0,
              amountGarageReject: 0,
            },
          ],
        }),
      ).pipe(delay(250));
    }

    // Default: pass through (so you can mix mock + real APIs if needed)
    return next.handle(req);
  }

  private getDemoContentForUrl(url: string): any[] {
    // Heuristics for typical master-data endpoints
    if (isUrlMatch(url.toLowerCase(), 'organization')) {
      return [
        { id: 1, code: 'ORG001', name: 'Khối Nghiệp vụ', status: 'APPROVED' },
        { id: 2, code: 'ORG002', name: 'Khối Kỹ thuật', status: 'APPROVED' },
      ];
    }

    if (isUrlMatch(url.toLowerCase(), 'project-type')) {
      return [
        { id: 11, code: 'PT01', name: 'Nhóm dự án A', status: 'APPROVED' },
        { id: 12, code: 'PT02', name: 'Nhóm dự án B', status: 'APPROVED' },
      ];
    }

    if (isUrlMatch(url.toLowerCase(), '/project/project')) {
      return [
        { id: 201, code: 'PRJ-001', name: 'Dự án A', status: 'APPROVED' },
        { id: 202, code: 'PRJ-002', name: 'Dự án B', status: 'APPROVED' },
        { id: 203, code: 'PRJ-003', name: 'Dự án C', status: 'APPROVED' },
      ];
    }

    if (isUrlMatch(url.toLowerCase(), '/mdm/target') || isUrlMatch(url.toLowerCase(), 'target')) {
      return [
        { id: 301, code: 'TG01', name: 'Khoản mục 1', status: 'APPROVED' },
        { id: 302, code: 'TG02', name: 'Khoản mục 2', status: 'APPROVED' },
      ];
    }

    if (isUrlMatch(url.toLowerCase(), 'account') || isUrlMatch(url.toLowerCase(), 'user')) {
      return [
        { id: 100, code: 'u100', name: 'Nguyễn Văn A', status: 'APPROVED' },
        { id: 101, code: 'u101', name: 'Trần Thị B', status: 'APPROVED' },
      ];
    }

    return [];
  }
}

