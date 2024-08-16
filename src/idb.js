export const idb = {
  db: new Promise((resolve, reject) => {
    const openreq = indexedDB.open("kvs", 1)
    openreq.onerror = () => reject(openreq.error)
    openreq.onsuccess = () => resolve(openreq.result)
    openreq.onupgradeneeded = () => openreq.result.createObjectStore("kv")
  }).then((db) => {
    db.onversionchange = () => db.close()
    return db
  }),
  transaction(type, fn) {
    return this.db
      .then(
        (db) =>
          new Promise((resolve, reject) => {
            const transaction = db.transaction("kv", type)
            transaction.oncomplete = () => resolve(request)
            transaction.onabort = transaction.onerror = () => reject(transaction.error)
            const request = fn(transaction.objectStore("kv"))
          })
      )
      .then((req) => req.result)
  },
  get(key) {
    return this.transaction("readonly", (store) => store.get(key))
  },
  set(key, value) {
    return this.transaction("readwrite", (store) => store.put(value, key))
  },
  del(key) {
    return this.transaction("readwrite", (store) => store.delete(key))
  },
  clear() {
    return this.transaction("readwrite", (store) => store.clear())
  },
  keys() {
    // store.getAllKeys()
    const keys = []
    return this.transaction(
      "readonly",
      (store) =>
        ((store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
          if (!this.result) return
          keys.push(this.result.key)
          this.result.continue()
        })
    ).then(() => keys)
  },
}
export const idbStorage = {
  async getItem(key) {
    idbStorage.cache[key] = await idb.get(key)
    return idbStorage.cache[key]
  },
  async setItem(key, value) {
    idbStorage.cache[key] = await idb.set(key, value)
  },
  async removeItem(key) {
    await idb.del(key)
    delete idbStorage.cache[key]
  },
  cache: {}, // HACK
}
window.idb = idb
window.idbStorage = idbStorage
