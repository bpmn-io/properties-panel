import { useMemo } from 'preact/hooks';

const config = [
  {
    name: 'Absolute',
    value: 'abs()',
    descritpion: 'Returns the absolute value of a number.',
  },
  {
    name: 'Minimum',
    value: 'min()',
    descritpion: 'Returns the lowest value in a set of values.',
  },
  {
    name: 'Maximum',
    value: 'max()',
    descritpion: 'Returns the highest value in a set of values.',
  },
  {
    name: 'Round',
    value: 'round()',
    descritpion: 'Rounds a number to the nearest integer.',
  },
  {
    name: 'Floor',
    value: 'floor()',
    descritpion: 'Rounds a number down to the nearest integer.',
  },
  {
    name: 'Ceil',
    value: 'ceil()',
    descritpion: 'Rounds a number up to the nearest integer.',
  },
  {
    name: 'Sum',
    value: 'sum()',
    descritpion: 'Returns the sum of a set of values.',
  },
  {
    name: 'Date',
    value: 'date()',
    descritpion: 'Returns a date value.',
  },
  {
    name: 'Date and Time',
    value: 'date and time()',
    descritpion: 'Returns a date-time value.',
  },
];



export default function Typeahead({ feelActive, search, variables, onClick }) {



  const filteredValues = useMemo(() => {
    if (!search) {
      return config;
    }

    // console.log(search, config);
    return config.filter(f => {
      return f.name.toLowerCase().includes(search.toLowerCase()) ||
                              f.value.toLowerCase().includes(search.toLowerCase()) ||
                              f.descritpion.toLowerCase().includes(search.toLowerCase());}
    );
  }, [search]);


  console.log(variables);

  const filteredVariables = useMemo(() => {
    if (!search) {
      return variables;
    }

    return variables.filter(v => {
      return v.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, variables]);



  if (!feelActive || !search) {
    return;
  }

  return <div class="Typeahead">
    {!!filteredValues.length && <>
      <span class="section-header">Functions:</span>
      <ul>
        {filteredValues.map(f => <li onClick={ () => onClick(f.value) }>
          <b class="name">{f.name}</b>
          <div class="description">{f.descritpion}</div>
        </li>)}
      </ul>
    </>
    }
    {!!filteredVariables.length && <>
      <span class="section-header">Variables:</span>
      <ul>
        {filteredVariables.map(v => <li onClick={ () => onClick(v.name) }>
          <b class="name">{v.name}</b>
          <div class="description">Defined in {v.origin[0].name || v.origin[0].id}</div>
        </li>)}
      </ul>
    </>
    }



  </div>;
}