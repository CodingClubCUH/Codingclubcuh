import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/payload/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/payload/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/payload/Card'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any = { docs: [] }

  try {
    const payload = await getPayload({ config: configPromise })

    posts = await payload.find({
      collection: 'search',
      depth: 1,
      limit: 12,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
      },
      // pagination: false reduces overhead if you don't need totalDocs
      pagination: false,
      ...(query
        ? {
            where: {
              or: [
                {
                  title: {
                    like: query,
                  },
                },
                {
                  'meta.description': {
                    like: query,
                  },
                },
                {
                  'meta.title': {
                    like: query,
                  },
                },
                {
                  slug: {
                    like: query,
                  },
                },
              ],
            },
          }
        : {}),
    })
  } catch (error) {
    console.error('Error during search query:', error)
  }

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts?.docs?.length > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Coding Club CUH - Search`,
  }
}
