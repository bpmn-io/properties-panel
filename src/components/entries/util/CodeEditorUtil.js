import { parseExpressions } from 'feelin';

export function getTokenType(node) {

  const {
    name,
    error
  } = node;

  if (error || name === '⚠') {
    return 'error';
  }

  if (
    name === 'BuiltInFunctionName' ||
    name === 'BuiltInType' ||
    name === 'ListType' ||
    name === 'ContextType' ||
    name === 'FunctionType' ||
    name === 'DateAndTime' ||
    name === 'DateTimeConstructor'
  ) {
    return 'builtin';
  }

  if (name === 'BlockComment' || name === 'LineComment') {
    return 'comment';
  }

  if (name === 'Parameters') {
    return 'parameters';
  }

  if (name === 'List') {
    return 'list';
  }

  if (name === 'Context') {
    return 'context';
  }

  if (name === 'Interval') {
    return 'interval';
  }

  if (name === 'StringLiteral') {
    return 'string';
  }

  if (name === 'NumericLiteral') {
    return 'number';
  }

  if (name === 'BooleanLiteral') {
    return 'boolean';
  }

  if (name === 'QualifiedName') {
    return 'qname';
  }

  if (name === 'Name') {
    return 'name';
  }

  if (name === 'VariableName') {
    return 'variable';
  }

  return name;
}

export function parseFeel(value) {
  const {
    tree,
    parsedInput
  } = parseExpressions(value);

  const stack = [
    {
      children: []
    }
  ];

  const tokens = [];

  tree.iterate({
    enter(node, start, end) {
      const {
        name
      } = node;
      const skip = name === parsedInput.slice(start, end);
      const error = node.prop('error');
      const _node = {
        name,
        start,
        end,
        children: [],
        error,
        skip,
        type: getTokenType(node)
      };
      stack.push(_node);
    },
    leave(node, start, end) {
      const current = stack.pop();
      if (current.skip) {
        return;
      }
      const parent = stack[stack.length - 1];
      parent.children.push(current);

      if (current.tokenType || current.error) {
        tokens.push(current);
      }
    }
  });

  return stack[0].children[0];
}