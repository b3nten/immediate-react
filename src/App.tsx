import { Immediate } from "./immediate";

let count = 0;

export default class App extends Immediate {
  view() {
    return (
      <div className="is-center" style={{ flexDirection: "column" }}>
        <h1>Immediate</h1>
        <p>This is all the React code required to create the following interactive UI.</p>
        <pre>
          {`let count = 0;

export default class App extends Immediate {
  view() {
    return (
      <div>
        <h1>Hello World</h1>
        <button onClick={() => count++}>Click Me {count}</button>
        <div>{new Date().toLocaleTimeString()}</div>
        <div>{window.innerWidth} x {window.innerHeight}</div>
      </div>
    );
  }
}`}
        </pre>
        <button onClick={() => count++}>Click Me {count}</button>
        <div>{new Date().toLocaleTimeString()}</div>
        <div>{window.innerWidth} x {window.innerHeight}</div>
      </div>
    );
  }
}
