import { UNPKG_URL } from '@/components/utils'
import { useRouter } from 'next/router'

export const useInfo = () => {
  const { query } = useRouter()
  if (!query.slug) return null

  let [scope, name] = query.slug as [string, string]
  if (!name) {
    name = scope
    scope = ''
  }

  let [fullName, version] = name.split('@')
  if (scope) {
    fullName = scope + '/' + fullName
  }

  const unpkgPath = version ? `${fullName}@${version}` : fullName
  const unpkgPrefix = `${UNPKG_URL}/${unpkgPath}`

  return {
    name: fullName,
    version,
    unpkgPrefix,
    unpkgPkgUrl: unpkgPrefix + '/package.json',
    unpkgMetaUrl: unpkgPrefix + '/?meta',
    registryUrl: '/npmjs/' + fullName,
  }
}
