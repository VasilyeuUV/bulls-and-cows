/** Дочерний узел, который можно передать в `el`. */
export type Child = Node | string;

/**
 * Создаёт DOM-элемент.
 *
 * Атрибуты выставляются через `setAttribute`, дети добавляются через `append`.
 * Текст передаётся строкой и попадает в текстовый узел, поэтому `innerHTML`
 * не используется нигде в приложении.
 *
 * @param tag - имя тега
 * @param attributes - атрибуты элемента
 * @param children - дочерние узлы или текст; `null` игнорируется
 * @returns созданный элемент
 *
 * @example
 * el('button', { class: 'primary', type: 'button' }, ['Start']);
 */
export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string>> = {},
  children: readonly (Child | null)[] = [],
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);

  Object.entries(attributes).forEach(([name, value]) => {
    node.setAttribute(name, value);
  });

  node.append(...children.filter((child): child is Child => child !== null));

  return node;
};
