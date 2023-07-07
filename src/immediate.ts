import { Component } from "react";
import { html } from "htm/react";

function compareArrays(a: any[], b: any[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

type HTML = any[];

export abstract class Immediate extends Component {
  #__previousValues: any[] = [];
  #__hasMounted = false;

  #mountCallbacks: Set<() => void> = new Set();
  public onMount(callback: () => void) {
    this.#mountCallbacks.add(callback);
    return () => {
      this.#mountCallbacks.delete(callback);
    };
  }

  #unmountCallbacks: Set<() => void> = new Set();
  public onUnmount(callback: () => void) {
    this.#unmountCallbacks.add(callback);
    return () => {
      this.#unmountCallbacks.delete(callback);
    };
  }

  componentDidMount() {
    this.#__hasMounted = true;
    if (this.mount && typeof this.mount === "function") {
      this.mount();
    }
    for (const callback of this.#mountCallbacks) {
      callback();
    }
  }

  componentWillUnmount() {
    this.#__hasMounted = false;
    if (this.unmount && typeof this.unmount === "function") {
      this.unmount();
    }
    for (const callback of this.#unmountCallbacks) {
      callback();
    }
  }

  protected html = (strings: TemplateStringsArray, ...values: any[]): HTML => {
    this.render = () => html(strings, ...values);
    return values;
  };

  constructor(props: any) {
    super(props);
    this.view();
    const render = () => {
      const values = this.view();
      if (!Array.isArray(values)) {
        throw new Error(
          "If you're using JSX for your view, it needs to be compiled to HTM.",
        );
      }
      if (!compareArrays(values, this.#__previousValues)) {
        this.#__previousValues = values;
        this.#__hasMounted && this.forceUpdate();
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  mount?(): void;
  unmount?(): void;
  abstract view(): HTML | React.ReactNode;
}
