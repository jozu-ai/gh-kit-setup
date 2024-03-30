export function getToken(): string {
  const token = process.env['GITHUB_TOKEN'] || ''
  if (!token) {
    /* eslint-disable-next-line no-console */
    console.warn(
      'Skipping GitHub tests. Set $GITHUB_TOKEN to run GitHub tests.'
    )
  }

  return token
}
