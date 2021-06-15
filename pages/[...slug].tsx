import React, { useState, FC, useRef } from 'react'
import path from 'path'
import {
  Tree,
  ITreeNode,
  Divider,
  Navbar,
  NavbarGroup,
  NavbarDivider,
  Dialog,
  Classes,
  Spinner,
  Toaster,
  Button,
} from '@blueprintjs/core'
import { useRouter } from 'next/router'
import numeral from 'numeral'
// import GitHubButton from 'react-github-btn'
import {
  getRepositoryUrl,
  PackageMetaDirectory,
  PackageMetaItem,
  centerStyles,
  HEADER_HEIGHT,
  UNPKG_URL,
} from '@/components/utils'
import { Preview } from '@/components/preview'
import { Entry } from '@/components/entry'
import useSWR from 'swr'
import { useInfo } from '@/hooks/unpkg'

const Package: FC = () => {
  const { isReady } = useRouter()
  const info = useInfo()

  const toastRef = useRef<Toaster>(null)
  const [expandedMap, setExpandedMap] = useState<{ [key: string]: boolean }>({})
  const [selected, setSelected] = useState<string>()
  const [filePath, setFilePath] = useState<string>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const packageJson = useSWR<any>(info?.unpkgPkgUrl ?? null)
  const meta = useSWR<PackageMetaDirectory>(info?.unpkgMetaUrl ?? null)
  const registryInfo = useSWR<any>(info?.registryUrl ?? null)
  console.log(registryInfo.data)

  const handleClick = async (node: ITreeNode<PackageMetaItem>) => {
    if (!node.nodeData) return

    const id = node.id as string

    switch (node.nodeData.type) {
      case 'directory':
        setSelected(id)
        setExpandedMap((old) => ({ ...old, [node.id]: !old[node.id] }))
        break
      case 'file':
        if (selected === node.id) return
        setSelected(id)
        setFilePath(id)
        break
    }
  }

  const convertMetaToTreeNode = (
    file: PackageMetaItem
  ): ITreeNode<PackageMetaItem> => {
    switch (file.type) {
      case 'directory':
        file.files.sort((a, b) => {
          // Directory first
          if (a.type === 'directory' && b.type === 'file') {
            return -1
          } else if (a.type === 'file' && b.type === 'directory') {
            return 1
          } else {
            // Then sorted by first char
            return (
              path.basename(a.path).charCodeAt(0) -
              path.basename(b.path).charCodeAt(0)
            )
          }
        })
        return {
          id: file.path,
          nodeData: file,
          icon: 'folder-close',
          label: path.basename(file.path),
          childNodes: file.files.map(convertMetaToTreeNode),
          isExpanded: !!expandedMap[file.path],
          isSelected: selected === file.path,
        }
      case 'file':
        return {
          id: file.path,
          nodeData: file,
          icon: 'document',
          label: path.basename(file.path),
          secondaryLabel: numeral(file.size).format(
            file.size < 1024 ? '0b' : '0.00b'
          ),
          isSelected: selected === file.path,
        }
    }
  }

  if (!isReady) return null

  if (packageJson.isValidating || meta.isValidating) {
    return (
      <div style={{ ...centerStyles, height: '100vh' }}>
        <Spinner />
      </div>
    )
  }

  if (!meta.data) return null

  const files = convertMetaToTreeNode(meta.data).childNodes
  if (!files) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* FIXME: Type */}
      <Toaster ref={toastRef as any} />
      <Navbar style={{ height: HEADER_HEIGHT }}>
        <NavbarGroup style={{ height: HEADER_HEIGHT }}>
          <Button
            onClick={() => {
              setDialogOpen(true)
            }}
          >
            {packageJson.data.name}@{packageJson.data.version}
          </Button>

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

          <NavbarDivider />
          <a
            href={`https://www.npmjs.com/package/${packageJson.data.name}/v/${packageJson.data.version}`}
          >
            npm
          </a>

          {packageJson.data.homepage && (
            <>
              <NavbarDivider />
              <a href={packageJson.data.homepage}>homepage</a>
            </>
          )}

          {packageJson.data.repository && (
            <>
              <NavbarDivider />
              <a href={getRepositoryUrl(packageJson.data.repository)}>
                repository
              </a>
            </>
          )}

          {packageJson.data.license && (
            <>
              <NavbarDivider />
              <div>{packageJson.data.license}</div>
            </>
          )}

          {packageJson.data.description && (
            <>
              <NavbarDivider />
              <div>{packageJson.data.description}</div>
            </>
          )}
        </NavbarGroup>
        <NavbarGroup
          align="right"
          style={{ height: HEADER_HEIGHT, fontSize: 0 }}
        >
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
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <div
          style={{
            flexBasis: 300,
            flexShrink: 0,
            overflow: 'auto',
            paddingTop: 5,
          }}
        >
          <Tree
            contents={files}
            onNodeClick={handleClick}
            onNodeExpand={handleClick}
            onNodeCollapse={handleClick}
          />
        </div>
        <Divider />
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <Preview filePath={filePath} />
        </div>
      </div>
    </div>
  )
}

export default Package
