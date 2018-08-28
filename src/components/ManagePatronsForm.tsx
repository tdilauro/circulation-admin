import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { PatronData } from "../interfaces";
import ButtonForm from "./ButtonForm";
import EditableInput from "./EditableInput";
import ErrorMessage from "./ErrorMessage";
import { Alert } from "react-bootstrap";

export interface ManagePatronsFormStateProps {
  patron?: PatronData;
  fetchError?: FetchErrorData;
}

export interface ManagePatronsFormDispatchProps {
  patronLookup?: (data: FormData) => Promise<void>;
  resetPatronData?: () => Promise<void>;
}

export interface ManagePatronsFormOwnProps {
  store?: Store<State>;
  csrfToken?: string;
}

export interface ManagePatronsFormProps extends ManagePatronsFormStateProps, ManagePatronsFormDispatchProps, ManagePatronsFormOwnProps {}


export class ManagePatronsForm extends React.Component<ManagePatronsFormProps, void> {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  async submit(e) {
    e.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);

    await this.props.patronLookup(data);
  }

  componentWillUnmount() {
    this.props.resetPatronData();
  }

  render(): JSX.Element {
    const { patron, fetchError } = this.props;
    const patronExists = !!(patron);

    return (
      <div className="manage-patrons-form">
        { (fetchError && fetchError.status !== 200 && !patronExists) &&
          <ErrorMessage error={fetchError} />
        }
        { (!fetchError && patronExists) &&
          <Alert bsStyle="success">Patron found: {patron.authorization_identifier}</Alert>
        }
        <form onSubmit={this.submit} className="edit-form" ref="form">
          <EditableInput
            elementType="input"
            ref="identifier"
            name="identifier"
            label="Barcode"
            className="form-control"
            placeholder="Enter the patron's barcode">
          </EditableInput>
          <button
            type="submit"
            className="btn btn-default"
            >Submit</button>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const patronManager = state.editor.patronManager && state.editor.patronManager;
  return {
    patron: patronManager && patronManager.data,
    fetchError: patronManager && patronManager.fetchError,
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    patronLookup: (data: FormData) => dispatch(actions.patronLookup(data)),
    resetPatronData: () => dispatch(actions.resetPatronData()),
  };
};

const ConnectedManagePatronsForm = connect<ManagePatronsFormStateProps, ManagePatronsFormDispatchProps, ManagePatronsFormOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ManagePatronsForm);

export default ConnectedManagePatronsForm;
