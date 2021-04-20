export interface Suggestion {
  type: 'MAP' | 'TOPIC' | 'DOCUMENT';
  editorialType?: 'BOOK' | 'ARTICLE';
  filenameExtension?: string;
  mimeType?: string;
  value: string;
}

export interface SuggestBody {
  input: string;
  contentLocale: string;
  filters?: Array<Filter>;
  sort?: Array<Sort>;
  maxCount?: number;
}

export interface SuggestResponse {
  suggestions: Array<Suggestion>;
}

export interface Toc {
  tocId: string;
  contentId: string;
  title: string;
  children: Array<Toc>;
}

interface Metadata {
  key: string;
  label: string;
  values: Array<string>;
}

export interface Map {
  title: string;
  lang: string;
  id: string;
  baseId: string;
  lastEdition: string;
  lastPublication: string;
  clusterId: string;
  description?: string;
  editorialType: string;
  khubVersion?: string;
  openMode: string;
  prettyURL?: string;
  originURL?: string;
  readerUrl: string;
  rightsApiEndpoint: string;
  topicsApiEndpoint: string;
  attachmentsApiEndpoint: string;
  metadata: Array<Metadata>;
}

export interface Topics {
  id: string;
  title: string;
  metadata: Array<Metadata>;
  breadcrumb: Array<string>;
  readerUrl: string;
  contentApiEndpoint: string;
}

export interface Topic {
  id: string;
  title: string;
  contentApiEndpoint: string;
  metadata: Array<Metadata>;
}

interface Filter {
  key: string;
  values: Array<string>;
}

interface Sort {
  key: string;
  order: 'ASC' | 'DESC';
}

interface Node {
  value: string;
  label: string;
  selected: boolean;
  totalResultsCount: number;
  childNodes: Array<Node>;
  descendantSelected?: boolean;
}

interface Facet {
  key: string;
  label: string;
  hierarchical: boolean;
  multiSelectionable: boolean;
  rootNodes: Array<Node>;
}

export interface TopicOutput {
  type: 'TOPIC';
  topic: {
    mapId: string;
    contentId: string;
    tocId: string;
    title: string;
    htmlTitle: string;
    mapTitle: string;
    breadcrumb: Array<string>;
    htmlExcerpt: string;
    metadata: Array<Metadata>;
    resources: Array<{
      id: string;
      filename: string;
      mimeType: string;
      viewerUrl: string;
      resourceUrl: string;
      resourceContentUrl: string;
    }>;
    source: {
      id: string;
      name: string;
      type: string;
      description: string;
    };
    lastEditionDate: string;
    openMode: 'fluidtopics' | 'external';
    topicUrl: string;
    contentUrl: string;
    readerUrl: string;
  };
}

export interface MapOutput {
  type: 'MAP';
  map: {
    mapId: string;
    mapUrl: string;
    readerUrl: string;
    title: string;
    htmlTitle: string;
    htmlExcerpt: string;
    metadata: Array<Metadata>;
    editorialType: 'BOOK' | 'ARTICLE';
    source: {
      id: string;
      name: string;
      type: string;
      description: string;
    };
    lastEditionDate: string;
    openMode: 'fluidtopics' | 'external';
    originUrl?: string;
  };
}

export interface DocumentOutput {
  type: 'DOCUMENT';
  document: {
    documentId: string;
    title: string;
    htmlTitle: string;
    htmlExcerpt: string;
    filename: string;
    mimeType: string;
    metadata: Array<Metadata>;
    openMode: 'fluidtopics' | 'external';
    originUrl: string;
    documentUrl: string;
    contentUrl: string;
    viewerUrl: string;
  };
}

export interface ClusteredSearchBody {
  query: string;
  contentLocale: string;
  filters?: Array<Filter>;
  sort?: Array<Sort>;
  facets?: Array<{
    id: string;
    maxDepth: number;
  }>;
  paging?: { page: number; perPage: number };
}

export interface ClusteredSearchResponse {
  spellcheck: { suggestedQuery: string; htmlSuggestedQuery: string };
  facets: Array<Facet>;
  results: Array<{
    metadataVariableAxis?: string;
    entries: Array<TopicOutput | MapOutput | DocumentOutput>;
  }>;
  paging: {
    currentPage: number;
    totalResultsCount: number;
    totalClustersCount: number;
    isLastPage: boolean;
  };
}
