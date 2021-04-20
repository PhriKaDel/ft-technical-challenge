import { Map, Toc } from '../types/search';
import api from './api';

export const getMap = async (mapId: string) =>
  api.fetchJson<Map>(
    `https://doc.fluidtopics.com/api/khub/maps/${mapId}`,
    'GET'
  );

export const getToc = async (mapId: string) =>
  api.fetchJson<Array<Toc>>(
    `https://doc.fluidtopics.com/api/khub/maps/${mapId}/toc`,
    'GET'
  );
