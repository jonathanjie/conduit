import { Context } from 'grammy';
import type { DbUser } from '../types/index.js';

export interface ConduitContextFlavor {
  dbUser: DbUser | null; // Populated by auth middleware
}

export type ConduitContext = Context & ConduitContextFlavor;
