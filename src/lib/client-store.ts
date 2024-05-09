import { writable } from 'svelte/store';
import type { MatrixClient } from 'matrix-js-sdk';

export const clientStore = writable<MatrixClient | null>(null);
