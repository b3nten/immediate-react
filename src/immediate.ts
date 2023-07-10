import { Component, createRef } from "react";
import { html as htm } from "htm/react";
import { deepEqual } from "fast-equals";

function compareTwo(a: any, b: any): boolean {
  // check if both are functions -> if so, we don't care (prevents inline functions from causing renders)
  if (typeof a === "function" && typeof b === "function") return true;
  // check strict equality
  if (a !== b) {
    // if both are objects
    if (typeof a === "object" && typeof b === "object") {
      // check if they're react nodes
      if ("$$typeof" in a && "$$typeof" in b && "type" in a && "type" in b) {
        if (a.type.name === b.type.name) {
          return true;
        } else {
          return false;
        }
      }
      // check deep equality
      if (!deepEqual(a, b)) {
        console.log(a);
        return false;
      }
      return true;
    }
    // not objects, thus return false
    return false;
  }
  // they're equal, return true
  return true;
}

function compare(a: any[], b: any[], cache?: number) {
  // unequal lengths, return false early
  if (a.length !== b.length) return false;
  // check the most commonly changing index
  if (typeof cache === "number") {
    if (!compareTwo(a[cache], b[cache])) return false;
  }
  // check values
  for (let i = 0; i < a.length; i++) {
    if (!compareTwo(a[i], b[i])) {
      // cache the value to check first next time
      cache = i;
      return false;
    }
  }
  return true;
}

export class Immediate extends Component {
  #internalRender: () => any;
  #previousRenderValues: any[] = [];

  #hasMounted = false;
  #mountCallbacks: Set<() => void> = new Set();
  #unmountCallbacks: Set<() => void> = new Set();
  #mountCleanupCallback: void | (() => void) = void 0;

  #intersectionObserver: IntersectionObserver | undefined = void 0;
  #isVisible = true;

  protected OnlyRenderWhenInViewportRef = createRef<any>();

  constructor(props: any) {
    super(props);
    // assign render function to internal #__render
    this.#internalRender = this.render;
    // call render function to assign public render function to initial result
    this.#internalRender();
    // start update loop
    const update = () => {
      // if not visible, don't update
      if (!this.#isVisible) return requestAnimationFrame(update);
      // call render function to diff
      this.#internalRender();
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  protected html = (strings: TemplateStringsArray, ...values: any[]) => {
    if (!compare(this.#previousRenderValues, values)) {
      this.#previousRenderValues = values;
      this.render = () => htm(strings, ...values);
      this.#hasMounted && this.forceUpdate();
    }
  };

  shouldComponentUpdate(): boolean {
    return false;
  }

  public onMount(callback: () => void) {
    this.#mountCallbacks.add(callback);
    return () => {
      this.#mountCallbacks.delete(callback);
    };
  }

  public onUnmount(callback: () => void) {
    this.#unmountCallbacks.add(callback);
    return () => {
      this.#unmountCallbacks.delete(callback);
    };
  }

  componentDidMount() {
    if (this.#hasMounted) {
      return void console.warn("Immediate component has already mounted");
    }
    this.#hasMounted = true;
    if (typeof this.mount === "function") {
      this.#mountCleanupCallback = this.mount();
    }
    for (const callback of this.#mountCallbacks) {
      callback();
    }
    if (this.OnlyRenderWhenInViewportRef.current instanceof HTMLElement) {
      this.#intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.#isVisible = true;
          } else {
            this.#isVisible = false;
          }
        });
      }, {
        rootMargin: "100px",
      });
      this.#intersectionObserver.observe(
        this.OnlyRenderWhenInViewportRef.current,
      );
    }
  }

  componentWillUnmount() {
    this.#hasMounted = false;
    if (typeof this.unmount === "function") {
      this.#mountCleanupCallback && this.#mountCleanupCallback();
      this.unmount();
    }
    for (const callback of this.#unmountCallbacks) {
      callback();
    }
    this.#intersectionObserver?.disconnect();
  }

  mount?(): void | (() => void);

  unmount?(): void;
}
