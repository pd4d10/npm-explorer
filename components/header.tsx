import { useInfo } from '@/hooks/unpkg'
import {
  Button,
  Classes,
  Dialog,
  MenuItem,
  Navbar,
  NavbarDivider,
  NavbarGroup,
} from '@blueprintjs/core'
import { Select } from '@blueprintjs/select'
import { FC, useState } from 'react'
// import GitHubButton from 'react-github-btn'
import useSWR from 'swr'
import { Entry } from './entry'
import { getRepositoryUrl, HEADER_HEIGHT } from './utils'

const VersionSelect = Select.ofType<string>()

export const Header: FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const info = useInfo()
  const { data } = useSWR<{
    name: string
    'dist-tags': { latest: string }
    versions: Record<string, unknown>
    description?: string
    license?: string
    homepage?: string
    repository?: string
  }>(info?.registryUrl ?? null)

  if (!data) return null

  return (
    <Navbar style={{ height: HEADER_HEIGHT }}>
      <NavbarGroup style={{ height: HEADER_HEIGHT }}>
        <Dialog
          isOpen={dialogOpen}
          title="Select package"
          icon="info-sign"
          onClose={() => {
            setDialogOpen(false)
          }}
        >
          <div className={Classes.DIALOG_BODY}>
            <Entry
              afterChange={() => {
                setDialogOpen(false)
              }}
            />
          </div>
        </Dialog>

        {data.name}
        <NavbarDivider />
        <VersionSelect
          filterable
          activeItem={'15.0.0'}
          items={Object.keys(data.versions)}
          itemRenderer={(v, { modifiers }) => (
            <MenuItem
              active={modifiers.active}
              disabled={modifiers.disabled}
              label={'a'}
              key={v}
              onClick={() => {
                debugger
              }}
              text={v}
            />
          )}
          onItemSelect={() => {
            //
          }}
        >
          <Button text={'15.0.0'} rightIcon="caret-down" />
        </VersionSelect>
        <NavbarDivider />
        <a
          href={`https://www.npmjs.com/package/${data.name}/v/${data['dist-tags'].latest}`}
        >
          npm
        </a>
        {data.homepage && (
          <>
            <NavbarDivider />
            <a href={data.homepage}>homepage</a>
          </>
        )}
        {data.repository && (
          <>
            <NavbarDivider />
            <a href={getRepositoryUrl(data.repository)}>repository</a>
          </>
        )}
        {data.license && (
          <>
            <NavbarDivider />
            <div>{data.license}</div>
          </>
        )}
        {data.description && (
          <>
            <NavbarDivider />
            <div>{data.description}</div>
          </>
        )}
      </NavbarGroup>
      <NavbarGroup align="right" style={{ height: HEADER_HEIGHT, fontSize: 0 }}>
        {/* <GitHubButton
            href="https://github.com/pd4d10/npmview"
            aria-label="Star pd4d10/npmview on GitHub"
            data-icon="octicon-star"
            data-show-count
            data-size="large"
          >
            Star
          </GitHubButton> */}
      </NavbarGroup>
    </Navbar>
  )
}
