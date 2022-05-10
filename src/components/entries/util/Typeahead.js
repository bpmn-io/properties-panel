import classNames from 'classnames';
import { useEffect, useMemo } from 'preact/hooks';

import builtIns from './builtIns';

const preventInputBlur = e => {
  console.log('preventInputBlur', e);
  e.preventDefault();
};

export default function Typeahead({ feelActive, search, variables, onClick, activeNode, editingActive, setAutoComplete }) {

  const filteredValues = useMemo(() => {
    if (!search) {
      return builtIns;
    }

    return builtIns.filter(f => {
      return f.name.toLowerCase().includes(search.toLowerCase()) ||
                              f.value.toLowerCase().includes(search.toLowerCase()) ||
                              f.description.toLowerCase().includes(search.toLowerCase());}
    );
  }, [search]);

  const filteredVariables = useMemo(() => {
    if (!search) {
      return variables;
    }

    return variables.filter(v => {
      return v.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, variables]);


  useEffect(() => {
    const filtered = filteredValues[0]?.value || filteredVariables[0]?.name || '';
    setAutoComplete(filtered);
  }, [filteredValues, filteredVariables, setAutoComplete]);


  if (!feelActive || (!search && !activeNode) || !editingActive) {
    return;
  }


  return <div class="Typeahead" onMouseDown={ preventInputBlur }>
    <ContextualHelp activeNode={ activeNode } />
    {!!filteredValues.length && <>
      <span class="section-header">Functions:</span>
      <ul>
        {filteredValues.map(f => <li onClick={ () => onClick(f.value) }>
          <b class="name">{f.name}</b>
          <div class="description">{f.description}</div>
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


function ContextualHelp({ activeNode }) {
  let closestFunctionIvocation = getClosest('PositionalParameters', activeNode)?.parent;

  if (!closestFunctionIvocation || !closestFunctionIvocation.value || closestFunctionIvocation === activeNode) {
    return null;
  }

  const functionName = closestFunctionIvocation.value.replace(/(?<=\()(.*)(?=\))/, '');
  const res = builtIns.find(b => {
    if (b.value === functionName) {
      return true;
    }
  });

  if (!res) {
    return null;
  }

  const position = getParameterPosition(activeNode);

  return <>
    <span class="section-header">{res.name}</span>
    <div>{res.description}</div>
    <ul>
      {res.parameters?.map((p, idx) =>
        <li class={ classNames('parameter', idx === position && 'active') }>{p.name}{p.optional ? '?' : ''}:{'<'}{p.type}{'>'} </li>
      )}
    </ul>
    <hr></hr>
  </>;
}


function getClosest(type, node) {

  while (node && node.type !== type) {
    node = node.parent;
  }

  return node;
}


function getParameterPosition(node) {
  const type = 'PositionalParameters';

  while (node && node.type !== type) {
    const parent = node.parent;

    if (parent && parent.type === type) {
      return parent.children.indexOf(node);
    }
    node = node.parent;
  }

  console.log('No parameter position found', node);

  if (!node.children || !node.children.length) {
    return 0;
  }

  return -1;
}