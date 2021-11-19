const SKIP_TIME = 5000;

/**
 * The class of cache.
 * The cache will dispose of each value if the value has not been accessed
 * during 5 seconds.
 */
export class Cache<Key, Value> {
  #map: Map<Key, { value: Value | null; expire: number }>;

  /**
   * Initialize this cache instance.
   */
  constructor() {
    this.#map = new Map();
  }

  /**
   * Get the cached value of the given key.
   * @param {Key} key The key to get.
   * @returns {Value} The cached value or null.
   */
  get(key: Key): Value | null {
    const entry = this.#map.get(key);
    const now = Date.now();

    if (entry) {
      if (entry.expire > now) {
        entry.expire = now + SKIP_TIME;

        return entry.value;
      }

      this.#map.delete(key);
    }

    return null;
  }

  /**
   * Set the value of the given key.
   * @param {Key} key The key to set.
   * @param {Value} value The value to set.
   * @returns {void}
   */
  set(key: Key, value: Value | null): void {
    const entry = this.#map.get(key);
    const expire = Date.now() + SKIP_TIME;

    if (entry) {
      entry.value = value;
      entry.expire = expire;
    } else {
      this.#map.set(key, { value, expire });
    }
  }
}
