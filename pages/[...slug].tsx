import React, { useState, FC } from 'react'
import path from 'path'
import { Tree, ITreeNode, Divider, Spinner } from '@blueprintjs/core'
import { useRouter } from 'next/router'
import numeral from 'numeral'
import {
  PackageMetaDirectory,
  PackageMetaItem,
  centerStyles,
  HEADER_HEIGHT,
} from '@/components/utils'
import { Preview } from '@/components/preview'
import useSWR from 'swr'
import { useInfo } from '@/hooks/unpkg'
import { Header } from '@/components/header'

const Package: FC = () => {
  const { isReady } = useRouter()
  const [expandedMap, setExpandedMap] = useState<{ [key: string]: boolean }>({})
  const [selected, setSelected] = useState<string>()
  const [filePath, setFilePath] = useState<string>()
  const info = useInfo()
  const meta = useSWR<PackageMetaDirectory>(info?.unpkgMetaUrl ?? null)

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

  if (meta.isValidating) {
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
      <Header />
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
