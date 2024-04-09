// const timeZone = process.env.NEXT_PUBLIC_TIME_ZONE;

export default function IsoDateString(dateStr) {
  const options = {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(dateStr).toLocaleString("en-US", options);
}
