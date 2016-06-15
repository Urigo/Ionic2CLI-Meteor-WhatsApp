export class CollectionService {
  add(modelData) {
    const model = this.collection.add(modelData);
    return this.get(model._id);
  }

  get(modelId) {
    return this.collection.get(modelId);
  }

  remove(modelId) {
    const model = this.get(modelId);
    this.collection.remove(modelId);
    return model;
  }

  setActive(modelId) {
    this._active = this.get(modelId);
    return { store: this::this.storeActive };
  }

  unsetActive() {
    delete this._active;
    return { dispose: this::this.disposeActive };
  }

  storeActive() {
    localStorage.setItem(this.activeKey, this._active._id);
  }

  disposeActive() {
    localStorage.removeItem(this.activeKey);
  }

  get active() {
    if (this._active) return this._active;

    const activeModelId = localStorage.getItem(this.activeKey);
    if (!activeModelId) return this.disposeActive();

    this._active = this.get(activeModelId);
    return this._active;
  }

  get activeKey() {
    return `${this.constructor.name}:active`;
  }

  get models() {
    return this.collection.models.map(model => this.get(model._id));
  }

  get first() {
    const model = this.collection.first;
    return model && this.get(model._id);
  }

  get last() {
    const model = this.collection.last;
    return model && this.get(model._id);
  }

  get length() {
    return this.collection.length;
  }
}