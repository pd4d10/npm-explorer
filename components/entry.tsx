import React, { useState, FC, useRef, useEffect } from 'react'
import { InputGroup, Button, Classes } from '@blueprintjs/core'
import Link from 'next/link'
import { useRouter } from 'next/router'

const examples = ['react', 'react@15', 'react@15.0.0']

export const Entry: FC<{ afterChange?: Function }> = ({ afterChange }) => {
  const router = useRouter()
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    // console.log(inputRef.current)
    inputRef.current && inputRef.current.focus()
  }, [])

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          afterChange && afterChange()
          router.push(`/${name}`)
        }}
      >
        <InputGroup
          inputRef={inputRef as any}
          large
          placeholder="package or package@version"
          leftIcon="search"
          rightElement={<Button icon="arrow-right" minimal type="submit" />}
          value={name}
          onChange={(e: any) => {
            setName(e.target.value)
          }}
          style={{ minWidth: 400 }}
        />
      </form>
      <div style={{ paddingTop: 10 }} className={Classes.TEXT_LARGE}>
        <span>e.g.</span>
        {examples.map((name) => (
          <Link
            href={{ pathname: '/[...slug]', query: { slug: [name] } }}
            key={name}
          >
            <a
              style={{ paddingLeft: 20 }}
              onClick={() => {
                afterChange && afterChange()
              }}
            >
              {name}
            </a>
          </Link>
        ))}
      </div>
    </>
  )
}
