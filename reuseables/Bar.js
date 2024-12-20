import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import dynamic from "next/dynamic";
import { toHuman } from "@/helpers/clients";

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function Bar({ data: sampleData, overallSales, showStats }) {
  function useChartOptions() {
    return {
      chart: {
        type: "bar",
        stacked: true,
        background: "transparent",
        toolbar: { show: true },
        zoom: { enabled: false },
      },
      colors: ["#7367F0", "#FF5733", "#28C76F", "#FF9F43"],
      dataLabels: { enabled: false },
      fill: { opacity: 1, type: "solid" },
      grid: {
        borderColor: "#EBEBEB",
        strokeDashArray: 2,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      legend: { show: true },
      plotOptions: { bar: { columnWidth: "40px", horizontal: false } },
      stroke: { colors: ["transparent"], show: true, width: 1 },
      theme: { mode: "light" },
      xaxis: {
        axisBorder: { color: "#EBEBEB", show: true },
        axisTicks: { color: "#EBEBEB", show: true },
        labels: { offsetY: 5, style: { colors: "#9E9E9E" } },
      },
      yaxis: {
        labels: {
          formatter: (value) => (value > 0 ? `${value}` : `${value}`),
          offsetX: -10,
          style: { colors: "#9E9E9E" },
        },
      },
    };
  }

  const chartData = {
    categories: sampleData.map((d) => toHuman(d.date, false).split(",")[0]),
    series: [
      {
        name: "Total Revenue",
        data: sampleData.map((d) => d.totalRevenue.toFixed(2)),
      },
      {
        name: "Total Discount",
        data: sampleData.map((d) => d.totalDiscount.toFixed(2)),
      },
      {
        name: "Total Profit",
        data: sampleData.map((d) => d.totalProfit.toFixed(2)),
      },
      {
        name: "Total Cost",
        data: sampleData.map((d) => d.totalCost.toFixed(2)),
      },
    ],
  };

  const revenueProfitChartData = {
    series: [
      {
        name: "Revenue",
        data: sampleData.map((d) => d.totalRevenue.toFixed(2)),
      },
      {
        name: "Profit",
        data: sampleData.map((d) => d.totalProfit.toFixed(2)),
      },
    ],
    categories: sampleData.map((d) => toHuman(d.date, false).split(",")[0]),
  };

  const revenueProfitChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: true },
      background: "transparent",
    },
    colors: ["#7367F0", "#28C76F"],
    dataLabels: { enabled: true },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: revenueProfitChartData.categories,
      labels: { style: { colors: "#9E9E9E" } },
    },
    yaxis: {
      labels: { style: { colors: "#9E9E9E" } },
    },
    grid: { borderColor: "#EBEBEB" },
    legend: { show: true },
  };

  const chartOptions = useChartOptions();

  return (
    <Container className="mb-4">
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm border-0 rounded-lg">
            <Card.Body className="text-center p-4">
              <h3 className="text-dark mb-3">Monthly Sales Summary</h3>
              <Row>
                <Col sm={6} md={3}>
                  <Card className="shadow border-0 rounded-lg p-3">
                    <Card.Body>
                      <h5 className="text-muted">Total Revenue</h5>
                      <h4 className="font-weight-bold text-primary">
                        ${" "}
                        {showStats
                          ? parseFloat(overallSales.totalRevenue).toFixed(2)
                          : "***"}{" "}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="shadow border-0 rounded-lg p-3">
                    <Card.Body>
                      <h5 className="text-muted">Total Cost</h5>
                      <h4 className="font-weight-bold text-danger">
                        ${" "}
                        {showStats
                          ? parseFloat(overallSales.totalCost).toFixed(2)
                          : "***"}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="shadow border-0 rounded-lg p-3">
                    <Card.Body>
                      <h5 className="text-muted">Total Discount</h5>
                      <h4 className="font-weight-bold text-danger">
                        ${" "}
                        {showStats
                          ? parseFloat(overallSales.totalDiscount).toFixed(2)
                          : "***"}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>

                <Col sm={6} md={3}>
                  <Card className="shadow border-0 rounded-lg p-3">
                    <Card.Body>
                      <h5 className="text-muted">Total Profit</h5>
                      <h4 className="font-weight-bold text-success">
                        ${" "}
                        {showStats
                          ? parseFloat(overallSales.totalProfit).toFixed(2)
                          : "***"}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Breakdown Chart */}
      <Card className="shadow-sm border-0 rounded-lg mb-4">
        <Card.Header>
          <h5>Sales Breakdown</h5>
        </Card.Header>
        <Card.Body>
          <Chart
            height={350}
            options={chartOptions}
            series={chartData.series}
            type="bar"
            width="100%"
          />
        </Card.Body>
      </Card>

      {/* Revenue and Profit Chart */}
      <Card className="shadow-sm border-0 rounded-lg">
        <Card.Header>
          <h5>Revenue and Profit Trends</h5>
        </Card.Header>
        <Card.Body>
          <Chart
            height={350}
            options={revenueProfitChartOptions}
            series={revenueProfitChartData.series}
            type="line"
            width="100%"
          />
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Bar;
