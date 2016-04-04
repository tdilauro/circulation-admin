import * as React from "react";
import { connect } from "react-redux";
import DataFetcher from "opds-browser/lib/DataFetcher";
import ActionCreator from "../actions";
import editorAdapter from "../editorAdapter";
import ButtonForm from "./ButtonForm";
import EditForm from "./EditForm";
import ErrorMessage from "./ErrorMessage";

export class Editor extends React.Component<EditorProps, any> {
  render(): JSX.Element {
    let refresh = () => {
      this.props.fetchBook(this.props.bookAdminUrl);
      this.props.refreshBook();
    };

    return (
      <div>
        { this.props.bookData && !this.props.fetchError &&
          (<div>
            <h2>
              {this.props.bookData.title}
            </h2>
            <div style={{ height: "35px" }}>
              { this.props.isFetching &&
                <h4>
                  Updating
                  <i className="fa fa-spinner fa-spin" style={{ marginLeft: "10px" }}></i>
                </h4>
              }
            </div>
            { this.props.editError &&
              <ErrorMessage error={this.props.editError} />
            }
            { this.props.bookData.hideLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Hide"
                link={this.props.bookData.hideLink.href}
                csrfToken={this.props.csrfToken}
                submit={this.props.editBook}
                refresh={refresh} />
            }
            { this.props.bookData.restoreLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Restore"
                link={this.props.bookData.restoreLink.href}
                csrfToken={this.props.csrfToken}
                submit={this.props.editBook}
                refresh={refresh} />
            }
            { this.props.bookData.refreshLink &&
              <ButtonForm
                disabled={this.props.isFetching}
                label="Refresh Metadata"
                link={this.props.bookData.refreshLink.href}
                csrfToken={this.props.csrfToken}
                submit={this.props.editBook}
                refresh={refresh} />
            }
            { this.props.bookData.editLink &&
              <EditForm
                {...this.props.bookData}
                csrfToken={this.props.csrfToken}
                disabled={this.props.isFetching}
                editBook={this.props.editBook}
                refresh={refresh} />
            }
          </div>)
        }
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} tryAgain={refresh} />
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.bookUrl) {
      let bookAdminUrl = this.props.bookUrl.replace("works", "admin/works");
      this.props.fetchBook(bookAdminUrl);
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookAdminUrl: state.editor.book.url,
    bookData: state.editor.book.data || ownProps.bookData,
    isFetching: state.editor.book.isFetching,
    fetchError: state.editor.book.fetchError,
    editError: state.editor.book.editError
  };
}

function mapDispatchToProps(dispatch) {
  let fetcher = new DataFetcher(null, editorAdapter);
  let actions = new ActionCreator(fetcher);
  return {
    editBook: (url, data) => dispatch(actions.editBook(url, data)),
    fetchBook: (url: string) => dispatch(actions.fetchBookAdmin(url))
  };
}

const ConnectedEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);

export default ConnectedEditor;
