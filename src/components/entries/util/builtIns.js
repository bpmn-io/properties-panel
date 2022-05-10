export default [
  {
    name: 'Absolute',
    value: 'abs()',
    description: 'Returns the absolute value of a number.',
  },
  {
    name: 'Minimum',
    value: 'min()',
    description: 'Returns the lowest value in a set of values.',
  },
  {
    name: 'Maximum',
    value: 'max()',
    description: 'Returns the highest value in a set of values.',
  },
  {
    name: 'Round',
    value: 'round()',
    description: 'Rounds a number to the nearest integer.',
  },
  {
    name: 'Floor',
    value: 'floor()',
    description: 'Rounds a number down to the nearest integer.',
  },
  {
    name: 'Ceil',
    value: 'ceil()',
    description: 'Rounds a number up to the nearest integer.',
  },
  {
    name: 'Sum',
    value: 'sum()',
    description: 'Returns the sum of a set of values.',
  },
  {
    name: 'Substring',
    value: 'substring()',
    description: 'Returns a substring of a string.',
    parameters: [
      {
        name: 'string',
        type: 'string'
      },
      {
        name: 'start position',
        type: 'number'
      },
      {
        name: 'length',
        type: 'number',
        optional: true
      }
    ],
    result: 'string'
  },
  {
    name: 'Date',
    value: 'date()',
    description: 'Returns a date value.',
  },
  {
    name: 'Date and Time',
    value: 'date and time()',
    description: 'Returns a date-time value.',
  },
];