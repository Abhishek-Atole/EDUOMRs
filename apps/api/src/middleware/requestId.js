import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

export function requestIdMiddleware(req, _res, next) {
  req.requestId = `${env.REQUEST_ID_PREFIX}${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  next();
}
