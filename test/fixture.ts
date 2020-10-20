export class Fixture {
  constructor(private _a: number, private _b: Array<string>, private _c: (a: number) => number) {}

  public func(): void {
    this._func(this._a);
  }

  private _func(a: number): Array<string> {
    this._c(a);
    return this._b;
  }
}
