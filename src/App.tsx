import { Immediate } from "./immediate";

let count = 0;

export default class App extends Immediate {
  render() {
    return (
      <div
        ref={this.OnlyRenderWhenInViewportRef}
        className="is-center"
        style={{ flexDirection: "column" }}
      >
        <h1>Immediate Mode React</h1>
        <p>
          This is all the React code required to create the following
          interactive UI.
          <br />
          Notice the lack of state setters or imperative updates.
        </p>
        <pre style={{ borderRadius: "8px" }}>
          <code style={{color: 'forestgreen'}}>
            {`let count = 0;
export default class App extends Immediate {
  render() {
    return (
      <div>
        <button onClick={() => count++}>Click Me {count}</button>
        <div>{new Date().toLocaleTimeString()}</div>
        <div>{window.innerWidth} x {window.innerHeight}</div>
      </div>
    );
  }
}`}
          </code>
        </pre>
        <button onClick={() => count++}>Click Me {count}</button>
        <div>{new Date().toLocaleTimeString()}</div>
        <div>viewport: {window.innerWidth}px x {window.innerHeight}px</div>
      </div>
    );
  }
}
