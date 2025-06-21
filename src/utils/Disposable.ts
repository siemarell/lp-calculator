export default class Disposable {
  private disposers: (() => void)[] = [];
  protected addDisposer(disposer: () => void) {
    this.disposers.push(disposer);
  }
  protected removeDisposer(disposer: () => void) {
    const index = this.disposers.findIndex((d) => d === disposer);
    if (index > -1) {
      this.disposers.splice(index, 1);
    }
  }

  dispose = () => {
    for (const disposer of this.disposers) {
      disposer();
    }
    this.disposers = [];
  };
}
