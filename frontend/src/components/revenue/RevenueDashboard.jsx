import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Segmented,
  Table,
  Typography,
  Statistic,
  Skeleton,
  Space,
  Button,
  Empty,
  theme,
  Tooltip,
  message,
  Tag,
} from "antd";
import { Area } from "@ant-design/plots";
import moment from "moment";
import { bookingApi } from "../../api/modules/booking.api.js";
import {
  DownloadOutlined,
  RiseOutlined,
  LineChartOutlined,
  CalendarOutlined,
  TagsOutlined,
  DollarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const DEBUG = true;
const log = (...args) => DEBUG && console.log("[RevenueDashboard]", ...args);
const warn = (...args) => DEBUG && console.warn("[RevenueDashboard]", ...args);
const table = (data, label = "table") =>
  DEBUG && console.table ? console.table(data) : log(label, data);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const nf = new Intl.NumberFormat("vi-VN");

const RevenueDashboard = () => {
  const { token } = theme.useToken();

  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, "days"),
    moment(),
  ]);
  const [viewType, setViewType] = useState("daily");

  useEffect(() => log("mounted, baseURL =", import.meta.env?.VITE_API_URL), []);
  useEffect(() => log("viewType changed ->", viewType), [viewType]);
  useEffect(() => {
    const human = (dateRange || []).map((d) => d?.format?.("YYYY-MM-DD"));
    log("dateRange changed ->", human);
  }, [dateRange]);

  // === Derived metrics
  const avgPerBucket = useMemo(
    () => (revenueData.length ? totalRevenue / revenueData.length : 0),
    [totalRevenue, revenueData.length]
  );

  // simple trend vs. previous bucket
  const last2 = revenueData.slice(-2);
  const trendAbs =
    last2.length === 2 ? (last2[1].revenue || 0) - (last2[0].revenue || 0) : 0;
  const trendPct =
    last2.length === 2 && (last2[0].revenue || 0)
      ? (trendAbs / Math.max(1, last2[0].revenue)) * 100
      : 0;

  // === Fetch
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [startDate, endDate] = dateRange || [];
        const payload = {
          startDate: startDate?.format("YYYY-MM-DD"),
          endDate: endDate?.format("YYYY-MM-DD"),
          viewType,
          // _t: Date.now(), // uncomment nếu muốn bust cache phía client
        };

        const t0 = performance.now();
        log("fetchRevenueData -> payload", payload);
        const res = await bookingApi.getRevenueStats(payload);
        log("fetchRevenueData <- raw response", res);

        const list = Array.isArray(res?.data) ? res.data : [];
        setRevenueData(list);
        setTotalRevenue(Number(res?.totalRevenue) || 0);
        setTotalTickets(Number(res?.totalTickets) || 0);

        const t1 = performance.now();
        log(`fetchRevenueData done in ${(t1 - t0).toFixed(1)}ms`, {
          buckets: list.length,
          totalRevenue: res?.totalRevenue,
          totalTickets: res?.totalTickets,
        });

        if (!list.length) warn("No data returned for current filters.");
        else table(list.slice(0, 5), "first rows");
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        console.error("[RevenueDashboard] fetch error", {
          status,
          data,
          error,
        });
        message.error("Không thể tải dữ liệu doanh thu");
        setRevenueData([]);
        setTotalRevenue(0);
        setTotalTickets(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [dateRange, viewType]);

  // === Columns
  const revenueColumns = [
    {
      title: "Thời gian",
      dataIndex: "date",
      key: "date",
      render: (t) =>
        t
          ? moment(t).format(viewType === "monthly" ? "MM/YYYY" : "DD/MM/YYYY")
          : "—",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      width: 160,
      fixed: "left",
    },
    {
      title: "Số vé bán được",
      dataIndex: "ticketCount",
      key: "ticketCount",
      align: "right",
      render: (v) => nf.format(Number(v) || 0),
      sorter: (a, b) => (a.ticketCount || 0) - (b.ticketCount || 0),
      width: 160,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (v) => <Text strong>{nf.format(Number(v) || 0)} đ</Text>,
      sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
      width: 180,
    },
  ];

  // === Chart data & config
  const chartData = revenueData.map((d) => ({
    ...d,
    date: moment(d.date).toDate(),
  }));
  const xMask = viewType === "monthly" ? "MM/YYYY" : "DD/MM";

  const chartConfig = {
    data: chartData,
    xField: "date",
    yField: "revenue",

    // scale thời gian & định dạng trục X
    meta: {
      date: { type: "timeCat", mask: xMask },
      revenue: { alias: "Doanh thu (đ)" },
    },

    xAxis: { tickCount: 6 },
    yAxis: { label: { formatter: (val) => nf.format(Number(val)) } },

    // Tránh tooltip bị 2 dòng và giá trị null
    tooltip: {
      shared: false,
      showCrosshairs: true,
      customItems: (items) =>
        items.map((it) => ({
          ...it,
          name: "Doanh thu",
          value: `${nf.format(Number(it.data?.revenue) || 0)} đ`,
        })),
    },

    areaStyle: () => ({ fill: "l(270) 0:#ffffff 0.5:#91d5ff 1:#1677ff" }),
    line: { color: token.colorPrimary, size: 2 },
    point: false, // tắt point để tooltip không bị “đúp”
    smooth: true,
    padding: [16, 12, 32, 56],

    // Có nhiều điểm thì mới bật slider
    slider: chartData.length > 15 ? { start: 0, end: 1 } : undefined,
  };

  const presets = {
    "7 ngày": [moment().subtract(6, "days"), moment()],
    "30 ngày": [moment().subtract(29, "days"), moment()],
    "Quý này": [moment().startOf("quarter"), moment().endOf("quarter")],
  };

  const handleExport = () => {
    log(
      "export CSV clicked. rows =",
      revenueData.length,
      "viewType =",
      viewType
    );
    if (!revenueData.length) return;
    const headers = ["date", "ticketCount", "revenue"];
    const rows = revenueData.map((r) => [
      moment(r.date).format("YYYY-MM-DD"),
      r.ticketCount,
      r.revenue,
    ]);
    const csv = [headers.join(","), ...rows.map((x) => x.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue_${viewType}_${moment().format("YYYYMMDD_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToday = () => setDateRange([moment().startOf("day"), moment()]);

  // === Small UI helpers
  const Glass = ({ children, style }) => (
    <div
      style={{
        borderRadius: 16,
        padding: 16,
        background: `linear-gradient(135deg, ${token.colorBgElevated} 0%, ${token.colorFillSecondary} 100%)`,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: `0 2px 12px ${token.colorFillQuaternary}`,
        backdropFilter: "blur(6px)",
        ...style,
      }}
    >
      {children}
    </div>
  );

  const KpiCard = ({ title, value, suffix, icon, extra }) => (
    <Card
      hoverable
      styles={{ body: { padding: 16 } }}
      style={{ borderRadius: 16, height: "100%" }}
    >
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Space
          align="center"
          style={{ justifyContent: "space-between", width: "100%" }}
        >
          <Text type="secondary">{title}</Text>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              background: `linear-gradient(135deg, ${token.colorPrimary}, #69b1ff)`,
              color: "#fff",
            }}
          >
            {icon}
          </div>
        </Space>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {nf.format(Number(value) || 0)} {suffix}
          </Title>
          {extra}
        </div>
      </Space>
    </Card>
  );

  return (
    <div className="revenue-dashboard" style={{ padding: 16 }}>
      {/* Header */}
      <Glass style={{ marginBottom: 16 }}>
        <Space
          align="center"
          size={12}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Space size={10} align="center">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg,#1677ff,#69b1ff)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 2px 8px rgba(22,119,255,0.35)",
              }}
            >
              <LineChartOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>
              Phân tích doanh thu
            </Title>
          </Space>

          <Space wrap>
            <Tooltip title="Đặt hôm nay">
              <Button icon={<ReloadOutlined />} onClick={resetToday} />
            </Tooltip>
            <Tooltip title="Xuất CSV">
              <Button
                type="primary"
                ghost
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={!revenueData.length}
              >
                Xuất
              </Button>
            </Tooltip>
          </Space>
        </Space>
      </Glass>

      {/* Filters + KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 16 }}>
            <Row gutter={[12, 12]} align="middle">
              <Col flex="auto">
                <Space size={10} wrap>
                  <CalendarOutlined style={{ color: token.colorPrimary }} />
                  <RangePicker
                    allowClear={false}
                    value={dateRange}
                    onChange={(v) => {
                      const human = (v || []).map((d) =>
                        d?.format?.("YYYY-MM-DD")
                      );
                      log("RangePicker onChange ->", human);
                      setDateRange(v);
                    }}
                    format="DD/MM/YYYY"
                    presets={presets}
                    size="large"
                  />
                  <Segmented
                    size="large"
                    value={viewType}
                    onChange={(v) => setViewType(v)}
                    options={[
                      { label: "Ngày", value: "daily" },
                      { label: "Tuần", value: "weekly" },
                      { label: "Tháng", value: "monthly" },
                    ]}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Row gutter={[12, 12]}>
            <Col xs={12}>
              <KpiCard
                title="Tổng doanh thu"
                value={totalRevenue}
                suffix="đ"
                icon={<DollarOutlined />}
                extra={
                  <Tag
                    color={trendAbs >= 0 ? "success" : "error"}
                    style={{ marginTop: 8 }}
                  >
                    {trendAbs >= 0 ? "▲" : "▼"} {Math.abs(trendPct).toFixed(1)}%
                    so với kỳ trước
                  </Tag>
                }
              />
            </Col>
            <Col xs={12}>
              <KpiCard
                title="Số vé"
                value={totalTickets}
                suffix="vé"
                icon={<TagsOutlined />}
              />
            </Col>
            <Col span={24}>
              <KpiCard
                title={`Doanh thu TB/${
                  viewType === "monthly"
                    ? "tháng"
                    : viewType === "weekly"
                    ? "tuần"
                    : "ngày"
                }`}
                value={avgPerBucket}
                suffix="đ"
                icon={<RiseOutlined />}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Chart + Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Biểu đồ doanh thu"
            styles={{ header: { paddingBottom: 6 }, body: { minHeight: 320 } }}
            style={{ borderRadius: 16 }}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : revenueData.length ? (
              <Area {...chartConfig} />
            ) : (
              <Empty description="Không có dữ liệu trong khoảng đã chọn" />
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="Chi tiết doanh thu"
            style={{ borderRadius: 16 }}
            styles={{ body: { paddingTop: 12 } }}
          >
            <Table
              size="middle"
              sticky
              columns={revenueColumns}
              dataSource={revenueData}
              loading={loading}
              rowKey={(r) => `${new Date(r.date).toISOString()}-${viewType}`}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              scroll={{ x: 700, y: 420 }}
              onChange={(pagination, filters, sorter) => {
                log("Table onChange ->", {
                  page: pagination?.current,
                  pageSize: pagination?.pageSize,
                  sorterField: sorter?.field,
                  sorterOrder: sorter?.order,
                });
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row
                    style={{ background: token.colorFillAlter }}
                  >
                    <Table.Summary.Cell index={0}>
                      <Text strong>Tổng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{nf.format(totalTickets)} vé</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text strong>{nf.format(totalRevenue)} đ</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueDashboard;
