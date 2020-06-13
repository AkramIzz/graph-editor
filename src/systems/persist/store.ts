export abstract class Store<DataType> {
  abstract open(name: string): Promise<StoreData<DataType>>;
}

export abstract class StoreData<DataType> {
  abstract put(key: string, value: DataType): Promise<boolean>;
  abstract remove(key: string): Promise<boolean>;
  abstract get(key: string): Promise<DataType | undefined>;
  abstract close(): void;
}

export abstract class Parser<DataType> {
  abstract parse(text: string): DataType;
  abstract stringify(value: DataType): string;
}

export class MemoryStore<DataType> implements Store<DataType> {
  private _stores = new Map<string, StoreData<DataType>>();

  constructor(private parser: Parser<DataType>) { }

  async open(name: string): Promise<StoreData<DataType>> {
    let storeData = this._stores.get(name);
    if (storeData === undefined) {
      storeData = new MemoryStoreData<DataType>(this.parser);
      this._stores.set(name, storeData);
    }

    return storeData;
  }
}

export class MemoryStoreData<DataType> implements StoreData<DataType> {
  private data: Map<string, string> = new Map<string, string>();

  constructor(private parser: Parser<DataType>) { }

  async put(key: string, value: DataType): Promise<boolean> {
    this.data.set(key, this.parser.stringify(value));
    return true;
  }

  async remove(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async get(key: string): Promise<DataType | undefined> {
    let value = this.data.get(key);
    if (value !== undefined) {
      return this.parser.parse(value);
    } else {
      return undefined;
    }
  }

  close(): void { }
}

export class LocalStorageStore<DataType> implements Store<DataType> {
  private _stores = new Map<string, StoreData<DataType>>();

  constructor(private parser: Parser<DataType>) { }

  async open(name: string): Promise<StoreData<DataType>> {
    let storeData = this._stores.get(name);
    if (storeData === undefined) {
      storeData = new LocalStorageStoreData<DataType>(this.parser, name);
      this._stores.set(name, storeData);
    }

    return storeData;
  }
}

export class LocalStorageStoreData<DataType> implements StoreData<DataType> {
  private data: any;

  constructor(private parser: Parser<DataType>, private name: string) {
    let storedData = localStorage.getItem(name);
    if (storedData !== null) {
      this.data = JSON.parse(storedData);
    } else {
      this.data = {};
    }
  }

  async put(key: string, value: DataType): Promise<boolean> {
    this.data[key] = this.parser.stringify(value);
    return true;
  }

  async remove(key: string): Promise<boolean> {
    return delete this.data[key];
  }

  async get(key: string): Promise<DataType | undefined> {
    let value = this.data[key];
    if (value !== undefined) {
      return this.parser.parse(value);
    } else {
      return undefined;
    }
  }

  close(): void {
    localStorage.setItem(this.name, JSON.stringify(this.data));
  }
}
