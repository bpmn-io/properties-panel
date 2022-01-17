import { Component, ComponentType, Context } from 'preact';

export type EntryDefinition = {
  component: Component,
  id: string,
  isEdited?: (node: HTMLElement) => boolean
};

export type ListItemDefinition = {
  autoFocusEntry: string,
  autoOpen?: boolean,
  entries: EntryDefinition[],
  id: string,
  label: string,
  remove: (event: MouseEvent) => void
}

export type ListGroupProps = {
  add: (event: MouseEvent) => void,
  element: any,
  id: string,
  items: Array<ListItemDefinition>,
  label: string,
  shouldSort?: boolean,
  shouldOpen?: boolean
}

export type EntriesGroupProps = {
  entries: EntryDefinition[],
  id: string,
  label: string,
  element: any
};

export type GroupDefinition = {
  id: string,
  label: string,
  component: ComponentType
} & EntriesGroupProps & ListGroupProps;

export type DescriptionConfig = { [id: string]: GetDescriptionFunction };

export type GetDescriptionFunction = (id: string, element: any) => string;

export type LayoutContext = Context<{
  layout: any,
  setLayout: (layout: any) => void,
  setLayoutForKey: (path: (string|number)[], newValue: any) => void,
  getLayoutForKey: (path: (string|number)[], defaultValue?: any) => any
}>;

export type DescriptionContext = Context<{
  description: DescriptionConfig,
  getDescriptionForId: GetDescriptionFunction
}>;
