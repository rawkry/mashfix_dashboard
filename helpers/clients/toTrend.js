const timeZone = process.env.NEXT_PUBLIC_TIME_ZONE;
export default function toTrend(dateStr) {
  const options = {
    timeZone,
    year: "numeric",
    month: "long",
    day: "2-digit",
  };
  return new Date(dateStr).toLocaleDateString("en-US", options);
}
