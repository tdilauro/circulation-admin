import { RequestError } from "opds-web-client/lib/DataFetcher";
import { IndividualAdminsData } from "../interfaces";
import ActionCreator from "../actions";

export interface IndividualAdminsState {
  data: IndividualAdminsData;
  isFetching: boolean;
  isEditing: boolean;
  fetchError: RequestError;
  isLoaded: boolean;
}

const initialState: IndividualAdminsState = {
  data: null,
  isFetching: false,
  isEditing: false,
  fetchError: null,
  isLoaded: false
};

export default(state: IndividualAdminsState = initialState, action) => {
  switch (action.type) {
    case ActionCreator.INDIVIDUAL_ADMINS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        fetchError: null
      });

    case ActionCreator.INDIVIDUAL_ADMINS_LOAD:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.INDIVIDUAL_ADMINS_FAILURE:
      return Object.assign({}, state, {
        fetchError: action.error,
        isFetching: false,
        isLoaded: true
      });

    case ActionCreator.EDIT_INDIVIDUAL_ADMIN_REQUEST:
      return Object.assign({}, state, {
        isEditing: true,
        fetchError: null
      });

    case ActionCreator.EDIT_INDIVIDUAL_ADMIN_SUCCESS:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: null
      });

    case ActionCreator.EDIT_INDIVIDUAL_ADMIN_FAILURE:
      return Object.assign({}, state, {
        isEditing: false,
        fetchError: action.error
      });

    default:
      return state;
  }
};