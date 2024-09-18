// const timeZone = process.env.NEXT_PUBLIC_TIME_ZONE;

export default function IsoDateString(dateStr, withTime = true) {
  const options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    // hour: "2-digit",
    // minute: "2-digit",
  };

  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }
  return new Date(dateStr).toLocaleString("en-US", options);
}
