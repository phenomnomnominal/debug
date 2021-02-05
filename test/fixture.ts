export class Fixture {
  constructor(private _a: number, private _b: Array<string>, private _c: (a: number) => number) {}

  public async func(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._func(this._a);
        resolve();
      }, Math.floor(Math.random() * 1000));
    });
  }

  private _func(a: number): Array<string> {
    this._c(a);
    return this._b;
  }
}
