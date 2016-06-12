export class DataProvider {
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