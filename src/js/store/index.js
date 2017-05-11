const R = require("ramda")
const uuid = require("uuid")

const createStore = require("./base")
const utils = require("../utils")

const defaults = {
  filters: [],
  groupings: [],
  sorters: [],
  schema: null,
  data: null,
  resultFields: null,
  showCounts: false,
  limit: null,
  sum: null,
  average: null,
}

const initialOperators = {
  string: "eq",
  number: "eq",
  date: "eq",
  bool: "nl",
  array: "cos",
}

const handlers = {
  saveJson: function(contents, payload) {
    const toUpdate = {
      filters: [],
      groupings: [],
      sorters: [],
      showCounts: false,
      limit: null,
      sum: null,
      average: null,
    }

    toUpdate[payload.name] = payload.data
    return R.merge(contents, toUpdate)
  },

  updateResultFields: function(contents, payload) {
    return R.merge(contents, {
      resultFields: payload.fields,
    })
  },

  addFilter: function(contents, payload) {
    const filterType = (contents.schema || {})[payload.name] || "string"
    const operator = initialOperators[filterType] || "eq"

    return R.merge(contents, {
      filters: R.append({id: uuid.v4(), name: payload.name, value: "", operator: operator, active: true}, contents.filters),
    })
  },

  deleteFilter: function(contents, payload) {
    return R.merge(contents, {
      filters: R.reject(R.propEq("id", payload.id), contents.filters),
    })
  },

  updateFilter: function(contents, payload) {
    return R.merge(contents, {
      filters: utils.updateWhere({id: payload.id}, payload.value, contents.filters),
    })
  },

  limit: function(contents, payload) {
    return R.merge(contents, {
      limit: payload.number,
    })
  },

  reset: function(contents) {
    return R.merge(contents, {
      filters: [],
      groupings: [],
      sorters: [],
      showCounts: false,
      limit: null,
      sum: null,
      average: null,
    })
  },

  addGrouping: function(contents, payload) {
    return R.merge(contents, {
      sum: null,
      average: null,
      groupings: R.append(payload.name, contents.groupings),
      resultFields: R.compose(R.uniq, R.append(payload.name))(contents.resultFields),
    })
  },

  removeGrouping: function(contents, payload) {
    const toMerge = {
      groupings: R.without([payload.name], contents.groupings || []),
    }

    if (!toMerge.groupings.length) toMerge.showCounts = false

    return R.merge(contents, toMerge)
  },

  sum: function(contents, payload) {
    return R.merge(contents, {
      sum: payload.name,
      average: null,
      groupings: [],
      showCounts: false,
    })
  },

  average: function(contents, payload) {
    return R.merge(contents, {
      average: payload.name,
      sum: null,
      groupings: [],
      showCounts: false,
    })
  },

  addSorter: function(contents, payload) {
    return R.merge(contents, {
      sorters: R.append(payload.sorter, contents.sorters),
    })
  },

  removeSorter: function(contents, payload) {
    return R.merge(contents, {
      sorters: R.reject(R.propEq("field", payload.name), contents.sorters),
    })
  },

  showCounts: function(contents, payload) {
    return R.merge(contents, {
      showCounts: payload.showCounts,
    })
  },

}

module.exports = createStore(defaults, handlers)