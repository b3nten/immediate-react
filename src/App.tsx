import { Immediate } from "./immediate";

let count = 0;

export default class App extends Immediate {
  view() {
    return (
      <div className="is-center" style={{ flexDirection: "column" }}>
        <h1>Hello World</h1>
        <button onClick={() => count++}>Click Me {count}</button>
        <div>{new Date().toLocaleTimeString()}</div>
        <div>{window.innerWidth} x {window.innerHeight}</div>
      </div>
    );
  }
}
