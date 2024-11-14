import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import dynamic from "next/dynamic";
import { toHuman } from "@/helpers/clients";

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Transform data for the chart

function Bar({ data: sampleData, overallSales }) {
  function useChartOptions() {
    return {
      chart: {
        type: "bar",
        stacked: true,
        background: "transparent",
        toolbar: { show: true },
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
        // categories: sampleData.map((d) => d.date.split("-")[2]),
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
        name: "Total Issues Price",
        data: sampleData.map((d) => d.totalIssuesPrice),
      },
      {
        name: "Total Discount",
        data: sampleData.map((d) => d.totalDiscount),
      },

      {
        name: "Total Expected Service Charge",
        data: sampleData.map((d) => d.totalExpectedServiceCharge),
      },
    ],
  };

  const chartOptions = useChartOptions(sampleData);

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
                      <h5 className="text-muted">Total Issues Price</h5>
                      <h4 className="font-weight-bold text-primary">
                        $ {parseFloat(overallSales.totalIssuesPrice).toFixed(2)}{" "}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="shadow border-0 rounded-lg p-3">
                    <Card.Body>
                      <h5 className="text-muted">Total Discount</h5>
                      <h4 className="font-weight-bold text-danger">
                        $ {parseFloat(overallSales.totalDiscount).toFixed(2)}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="shadow border-0 rounded-lg p-3">
                    <Card.Body>
                      <h5 className="text-muted">Total Service Charge</h5>
                      <h4 className="font-weight-bold text-success">
                        ${" "}
                        {parseFloat(
                          overallSales.totalExpectedServiceCharge
                        ).toFixed(2)}
                      </h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0 rounded-lg">
        <Card.Header
          action={
            <Button variant="outline-primary" size="sm">
              Sync
            </Button>
          }
          title="Sales Breakdown"
        />
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
    </Container>
  );
}

export default Bar;
