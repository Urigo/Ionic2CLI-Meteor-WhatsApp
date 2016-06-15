export class Model {
  constructor() {
    const ctor = this.constructor;
    ctor.idCounter = ctor.idCounter || 0;
    this._id = (ctor.idCounter++).toString();
    this.createdAt = new Date();
  }
}