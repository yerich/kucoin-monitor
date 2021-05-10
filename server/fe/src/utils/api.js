export async function get(url, options = {}) {
  options.method = "GET";
  const result = await fetch(url, options);
  const json = await result.json();
  if (!json.success) {
    console.error("API error:", json);
  } else {
    console.log("API response", json.data);
    return json.data;
  }
}
