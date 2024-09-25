import React from "react";
import { Button, Card } from "react-bootstrap";
import dynamic from "next/dynamic";
import { toHuman } from "@/helpers/clients";

// Dynamically import the Chart component with no SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Transform data for the chart

function Bar({ data: sampleData }) {
  function useChartOptions() {
    return {
      chart: {
        type: "bar",
        stacked: true, // Enable stacking
        background: "transparent",
        toolbar: { show: false },
      },
      colors: ["#7367F0", "#FF5733", "#28C76F", "#FF9F43"], // Customize colors for each series
      dataLabels: { enabled: false },
      fill: { opacity: 1, type: "solid" },
      grid: {
        borderColor: "#EBEBEB",
        strokeDashArray: 2,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      legend: { show: true },
      plotOptions: { bar: { columnWidth: "40px", horizontal: false } }, // Ensure vertical bars
      stroke: { colors: ["transparent"], show: true, width: 1 },
      theme: { mode: "light" },
      xaxis: {
        axisBorder: { color: "#EBEBEB", show: true },
        axisTicks: { color: "#EBEBEB", show: true },
        categories: chartData.categories,
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
    <Card className="mb-4">
      <Card.Header
        action={
          <Button color="inherit" size="small">
            Sync
          </Button>
        }
        title="Sales"
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
  );
}

export default Bar;
