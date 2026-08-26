export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch");
  }

  return response.json() as Promise<T>;
}
