import {
  ClusteredSearchBody,
  ClusteredSearchResponse,
  SuggestBody,
  SuggestResponse,
} from '../types/search';
import api from './api';

export const suggestApi = async (data: SuggestBody) => {
  return api.fetchJson<SuggestResponse>(
    'https://doc.fluidtopics.com/api/khub/suggest',
    'POST',
    JSON.stringify(data)
  );
};

export const searchApi = async (data: ClusteredSearchBody) => {
  return api.fetchJson<ClusteredSearchResponse>(
    'https://doc.fluidtopics.com/api/khub/clustered-search',
    'POST',
    JSON.stringify(data)
  );
};
