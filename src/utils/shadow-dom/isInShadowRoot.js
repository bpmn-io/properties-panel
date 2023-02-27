/**
 * For performance reasons, keep element reference in the {@link WeakSet}.
 * @type {WeakSet<object>}
 */
const inShadowRootElementSet = new WeakSet();

/**
 * Determine if the node is inside shadowRoot.
 * @param node {Node}
 */
export function isInShadowRoot(node) {
  if (!(node instanceof Node)) return false;

  if (inShadowRootElementSet.has(node)) return true;

  let parent = node && node.parentNode;

  while (parent) {
    if (parent instanceof ShadowRoot) {
      inShadowRootElementSet.add(node);
      return true;
    }

    parent = parent.parentNode;
  }

  return false;
}
