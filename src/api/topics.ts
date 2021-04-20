import { Topics, Topic } from '../types/search';
import api from './api';

export const getTopics = async (mapId: string) =>
  api.fetchJson<Array<Topics>>(
    `https://doc.fluidtopics.com/api/khub/maps/${mapId}/topics`,
    'GET'
  );

export const getTopic = async (mapId: string, topicId: string) =>
  api.fetchJson<Topic>(
    `https://doc.fluidtopics.com//api/khub/maps/${mapId}/topics/${topicId}`,
    'GET'
  );
