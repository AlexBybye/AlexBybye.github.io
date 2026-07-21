export async function loadPublicJson<T>(fileName: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}profile/${fileName}`)
  if (!response.ok) throw new Error(`Failed to load profile config ${fileName}: ${response.status}`)
  return response.json() as Promise<T>
}
