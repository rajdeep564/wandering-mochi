export interface MochiOptions {
  /** Rename the cat. */
  name?: string;
  /** Your name, for her loving remarks. */
  owner?: string;
  /** CSS selector for an image she naps under. */
  photo?: string;
}

/** Adds Mochi to the page and returns a function that removes her. */
export function adoptMochi(options?: MochiOptions): () => void;
