var React = require("react");
var ReactDOM = require("react-dom");
var R = require("ramda");

var schema = {
  auto: "bool",
  errorCode: "int",
  type: "string"
};

var data = [
  {auto: true, errorCode: 0, type: "cash"},
  {auto: true, errorCode: 402, type: "cash"},
  {auto: false, errorCode: 403, type: "cash"},
  {auto: true, errorCode: 403, type: "card"},
  {auto: false, errorCode: 0, type: "loan"}
];

function updateWhere(find, update, data) {
  var index = R.findIndex(R.whereEq(find), data);
  return R.adjust(R.merge(R.__, update), index, data);
}

function getStringInput (name, value, onChange) {
  return (<input type="text" name={name} value={value} onChange={onChange.bind(this, name)} />);
}

function getIntInput (name, value, onChange) {
  return (<input type="number" name={name} value={value} onChange={onChange.bind(this, name)} />);
}
function getBoolInput (name, value, onChange) {
  return (
    <select name={name} value={value} onChange={onChange.bind(this, name)}>
      <option value="">NULL</option>
      <option value="true">TRUE</option>
      <option value="false">FALSE</option>
    </select>
  );
}

var typeMap = {
  string: getStringInput,
  int: getIntInput,
  bool: getBoolInput
};

var Main = React.createClass({
  getInitialState: function () {
    return {
      filters: []
    };
  },

  getFilterOptions: function () {
    var filterOptions = R.pipe(
      R.keys,
      R.without(R.pluck("name", this.state.filters))
    )(schema);

    return filterOptions.map(function (value) {
      return (
        <option value={value} key={value}>{value}</option>
      );
    });
  },

  onSelectChange: function (e) {
    this.setState({
      filters: R.append({name: e.target.value, value: ""}, this.state.filters)
    });
  },

  onDeleteFilter: function (e) {
    this.setState({
      filters: R.reject(R.propEq("name", e.target.dataset.name), this.state.filters)
    });
  },

  updateFilterValue: function (name, e) {
    this.setState({
      filters: updateWhere({name: name}, {value: e.target.value}, this.state.filters)
    });
  },

  getInputControlByType: function (type, name, value) {
    if (typeMap[type]) {
      return typeMap[type].bind(this)(name, value, this.updateFilterValue);
    } else {
      return "Invalid Type"
    }
  },

  getFilterRows: function () {
    return this.state.filters.map(function (filter) {
      return (
        <div key={filter.name}>
          <span>{filter.name}</span>
          {this.getInputControlByType(schema[filter.name], filter.name, filter.value)}
          <button onClick={this.onDeleteFilter} data-name={filter.name}>Remove</button>
        </div>
      );
    }.bind(this));
  },

  getEmptyRow: function () {
    return (
      <div>
        <select onChange={this.onSelectChange}>
          <option></option>
          {this.getFilterOptions()}
        </select>
      </div>
    );
  },

  render: function () {
    return (
      <div>
        {this.getFilterRows()}
        {this.getEmptyRow()}
      </div>
    )
  }
});

ReactDOM.render(<Main />, document.body.querySelector(".main"));
