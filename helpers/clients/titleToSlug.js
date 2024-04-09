export default function titleToSlug(title) {
  return title.toLowerCase().replace(/ /g, "-");
}
