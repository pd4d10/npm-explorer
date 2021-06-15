import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useUnpkgPath = () => {
  const { query } = useRouter()
  const [fullName, version] = useMemo(() => {
    if (!query.slug) return ['', '']

    let [scope, name] = query.slug as [string, string]
    if (!name) {
      name = scope
      scope = ''
    }

    let [fullName, version] = name.split('@')
    if (scope) {
      fullName = scope + '/' + fullName
    }
    return [fullName, version]
  }, [query])

  return version ? `${fullName}@${version}` : fullName
}
