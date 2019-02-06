import * as React from "react";
import { TimestampData } from "../interfaces";
import Collapsible from "./Collapsible";

export interface TimestampProps {
  timestamp: TimestampData;
}

export default class Timestamp extends React.Component<TimestampProps, void> {
  render(): JSX.Element {
    let exception = <section className="well exception"><pre>{this.props.timestamp.exception}</pre></section>;
    let achievements = <section className="well"><pre>{this.props.timestamp.achievements}</pre></section>;

    let body = (
      <ul>
        <li>Duration: {this.props.timestamp.duration} seconds</li>
        {
          this.props.timestamp.achievements &&
          <li>{achievements}</li>
        }
        {
          this.props.timestamp.exception &&
          <li>{exception}</li>
        }
      </ul>
    );

    return (
      <Collapsible
        title={this.props.timestamp.start}
        style={this.props.timestamp.exception ? "danger" : "success"}
        body={body}
        openByDefault={!!this.props.timestamp.exception}
      />
    );
  }
}
