const timeZone = process.env.NEXT_PUBLIC_TIME_ZONE;
export default function IsoDateString(dateStr) {
  const options = {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString("en-US", options);
  const parts = formattedDate.split("/");
  return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(
    2,
    "0"
  )}`;
}
