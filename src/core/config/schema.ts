import {z} from 'zod'

export const CONFIG_VERSION = 3

const id = z.string().min(1)

export const searchEngineSchema = z.object({
  id,
  name: z.string().min(1),
  /** URL template where `{query}` is replaced by the encoded search terms. */
  urlTemplate: z.string().includes('{query}'),
  /** Optional icon: data URL or http(s) URL. Filled automatically with the site favicon when absent. */
  icon: z.string().optional(),
})

export const weatherBlockConfigSchema = z.object({
  city: z
    .object({
      name: z.string().min(1),
      country: z.string().optional(),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .nullable(),
  forecastDays: z.number().int().min(1).max(7),
  unit: z.enum(['celsius', 'fahrenheit']),
  refreshMinutes: z.number().int().min(5).max(1440).default(30),
})

export const todayBlockConfigSchema = z.object({
  showDate: z.boolean().default(true),
  showTime: z.boolean().default(true),
  /** IANA time zone names (e.g. `America/New_York`) of the additional clocks. */
  timezones: z.array(z.string().min(1)).default([]),
  showEvents: z.boolean().default(false),
  /** iCal (.ics) calendar URL. */
  icalUrl: z.string().default(''),
  eventCount: z.number().int().min(1).max(50).default(5),
})

export const newsBlockConfigSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'object' || value === null) return value
    let config = value as Record<string, unknown>
    // Legacy configs stored a boolean `showThumbnails`.
    if ('showThumbnails' in config) {
      const {showThumbnails, ...rest} = config
      config = {itemIcon: showThumbnails === false ? 'none' : 'thumbnail', ...rest}
    }
    // Early builds stored a single `filterTerms` list.
    if ('filterTerms' in config) {
      const {filterTerms, ...rest} = config
      config = {includeTerms: filterTerms, ...rest}
    }
    return config
  },
  z.object({
    title: z.string().default(''),
    feeds: z.array(z.object({ id, url: z.url(), title: z.string().optional() })),
    /** Total number of items loaded. */
    maxItems: z.number().int().min(1).max(50),
    /** Items visible without scrolling; defaults to `maxItems` when absent (legacy configs). */
    visibleItems: z.number().int().min(1).max(50).optional(),
    /** Keep only items whose title contains at least one term. Empty = no restriction. */
    includeTerms: z.array(z.string()).default([]),
    /** Drop items whose title contains at least one term. */
    excludeTerms: z.array(z.string()).default([]),
    itemIcon: z.enum(['thumbnail', 'favicon', 'none']).default('thumbnail'),
  }),
)

export const bookmarkSchema = z.object({
  id,
  title: z.string().min(1),
  url: z.url(),
  /** Custom icon (data URL). When absent the favicon is resolved automatically. */
  icon: z.string().optional(),
})

export const bookmarksBlockConfigSchema = z.object({
  title: z.string(),
  display: z.enum(['list', 'tiles']).default('list'),
  tileSize: z.enum(['small', 'normal']).default('normal'),
  links: z.array(bookmarkSchema),
})

const blockBase = {
  id,
  /** Height in pixels, `null` means automatic. */
  height: z.number().int().min(40).nullable(),
}

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ ...blockBase, type: z.literal('weather'), config: weatherBlockConfigSchema }),
  z.object({...blockBase, type: z.literal('today'), config: todayBlockConfigSchema}),
  z.object({ ...blockBase, type: z.literal('news'), config: newsBlockConfigSchema }),
  z.object({ ...blockBase, type: z.literal('bookmarks'), config: bookmarksBlockConfigSchema }),
])

export const columnSchema = z.object({
  id,
  /** Relative width (flex-grow weight). */
  width: z.number().positive(),
  blocks: z.array(blockSchema),
})

export const workspaceSchema = z.object({
  id,
  name: z.string().trim().min(1),
  search: z.object({
    defaultEngineId: id,
    engines: z.array(searchEngineSchema).min(1),
  }),
  layout: z.object({
    columns: z.array(columnSchema).min(1).max(8),
    /** Left and right margin of the grid (same on both sides, so it stays centered), in % of the viewport width. */
    margin: z.number().min(0).max(30).optional(),
  }),
})

export const appConfigSchema = z
  .object({
    version: z.literal(CONFIG_VERSION),
    /** Workspace displayed when the page opens; restored across sessions. */
    activeWorkspaceId: id,
    workspaces: z.array(workspaceSchema).min(1),
    settings: z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      locale: z.enum(['en', 'fr']),
    }),
  })
  .refine((config) => config.workspaces.some((w) => w.id === config.activeWorkspaceId), {
    message: 'activeWorkspaceId does not match any workspace',
  })

export type SearchEngine = z.infer<typeof searchEngineSchema>
export type WeatherBlockConfig = z.infer<typeof weatherBlockConfigSchema>
export type TodayBlockConfig = z.infer<typeof todayBlockConfigSchema>
export type NewsBlockConfig = z.infer<typeof newsBlockConfigSchema>
export type Bookmark = z.infer<typeof bookmarkSchema>
export type BookmarksBlockConfig = z.infer<typeof bookmarksBlockConfigSchema>
export type Block = z.infer<typeof blockSchema>
export type BlockType = Block['type']
export type Column = z.infer<typeof columnSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type AppConfig = z.infer<typeof appConfigSchema>
