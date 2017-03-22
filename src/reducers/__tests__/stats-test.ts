import { expect } from "chai";

import reducer, { StatsState } from "../stats";
import { StatsData } from "../../interfaces";

describe("stats reducer", () => {
  let statsData: StatsData = {
    patrons:  {
      total: 3456,
      with_active_loans: 55,
      with_active_loans_or_holds: 1234,
      loans: 100,
      holds: 2000
    },
    inventory: {
      titles: 54321,
      licenses: 123456,
      available_licenses: 100000
    },
    vendors: {
      overdrive: 500,
      bibliotheca: 400,
      axis360: 300,
      open_access: 1000
    }
  };

  let initState: StatsState = {
    data: null,
    isFetching: false,
    fetchError: null,
    isLoaded: false
  };

  let errorState: StatsState = {
    data: null,
    isFetching: false,
    fetchError: { status: 401, response: "test error", url: "test url" },
    isLoaded: true
  };

  it("returns initial state for unrecognized action", () => {
    expect(reducer(undefined, {})).to.deep.equal(initState);
  });

  it("handles FETCH_STATS_REQUEST", () => {
    let action = { type: "FETCH_STATS_REQUEST", url: "test url" };

    // start with empty state
    let newState = Object.assign({}, initState, {
      isFetching: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);

    // start with error state
    newState = Object.assign({}, errorState, {
      isFetching: true,
      fetchError: null
    });
    expect(reducer(errorState, action)).to.deep.equal(newState);
  });

  it("handles FETCH_STATS_FAILURE", () => {
    let action = { type: "FETCH_STATS_FAILURE", error: "test error" };
    let oldState = Object.assign({}, initState, { isFetching: true });
    let newState = Object.assign({}, oldState, {
      fetchError: "test error",
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(oldState, action)).to.deep.equal(newState);
  });

  it("handles LOAD_STATS", () => {
    let action = { type: "LOAD_STATS", data: statsData };
    let newState = Object.assign({}, initState, {
      data: statsData,
      isFetching: false,
      isLoaded: true
    });
    expect(reducer(initState, action)).to.deep.equal(newState);
  });
});