import 'normalize.css/normalize.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import 'github-fork-ribbon-css/gh-fork-ribbon.css'
import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SWRConfig } from 'swr'
import { Intent, Toaster } from '@blueprintjs/core'

const GA_MEASUREMENT_ID = 'UA-145009360-1'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    // https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications
    router.events.on('routeChangeComplete', (...args) => {
      // console.log(args)
      const { gtag } = window as any
      if (gtag) {
        gtag('config', GA_MEASUREMENT_ID, {
          page_path: location.pathname + location.search,
        })
      }
    })
  }, [])

  return (
    <SWRConfig
      value={{
        onError(err, key) {
          Toaster.create().show({
            message: err.message,
            intent: Intent.DANGER,
          })
        },
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  )
}

export default App
