import { Component } from "react";
import { html as htm } from "htm/react";
import { deepEqual } from "fast-equals";

function compareTwo(a: any, b: any): boolean {
  // check if both are functions -> if so, we don't care (prevents inline functions from causing renders)
  if (typeof a === "function" && typeof b === "function") return true;
  // check strict equality
  if (a !== b) {
    // if both are objects
    if (typeof a === "object" && typeof b === "object") {
      if("$$typeof" in a && "$$typeof" in b){
        if(a.type.name === b.type.name){
          return true;
        } else {
          return false;
        }
      }
      // check deep equality
      if (!deepEqual(a, b)){
        console.log(a)
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
  #__renderValues: any[] = [];
  #__hasMounted = false;
  #__mountCallback: void | (() => void) = void 0;

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
      this.#__mountCallback = this.mount();
    }
    for (const callback of this.#mountCallbacks) {
      callback();
    }
  }

  componentWillUnmount() {
    this.#__hasMounted = false;
    if (this.unmount && typeof this.unmount === "function") {
      this.#__mountCallback && this.#__mountCallback();
      this.unmount();
    }
    for (const callback of this.#unmountCallbacks) {
      callback();
    }
  }

  protected html = (strings: TemplateStringsArray, ...values: any[]) => {
    this.#__renderValues = values;
    return htm(strings, ...values);
  };

  constructor(props: any) {
    super(props);
    let previous, cache = 0;
    const update = () => {
      previous = this.#__renderValues;
      this.render();
      if (!compare(previous, this.#__renderValues, cache)) {
        console.log("rerendering")
        this.#__hasMounted && this.forceUpdate();
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  mount?(): void | (() => void);
  unmount?(): void;
}
